import "server-only";

import { randomUUID } from "node:crypto";
import { and, asc, desc, eq, gte, sql } from "drizzle-orm";

import { db } from "@/db";
import {
  loyaltyRewards,
  loyaltySettings,
  loyaltyTransactions,
  memberProfiles,
  orders,
  user as authUser,
} from "@/db/schema";
import { calculateBaseLoyaltyPoints } from "@/lib/loyalty-earning-policy";

export type AwardPointsForCompletedOrderResult =
  | {
      status: "awarded";
      orderId: string;
      userId: string;
      pointsAwarded: number;
      balanceAfter: number;
    }
  | {
      status: "already_awarded";
      orderId: string;
      userId: string;
      pointsAwarded: number;
      balanceAfter: number;
    }
  | {
      status: "skipped";
      orderId: string;
      reason:
        | "order_not_found"
        | "order_not_completed"
        | "guest_order"
        | "non_member_order"
        | "member_profile_missing"
        | "non_positive_total"
        | "zero_points";
    };

export type RedeemLoyaltyRewardResult =
  | {
      status: "redeemed" | "already_redeemed";
      rewardId: string;
      pointsDeducted: number;
      balanceAfter: number;
    }
  | {
      status: "skipped";
      reason:
        | "reward_not_available"
        | "member_profile_missing"
        | "insufficient_balance"
        | "invalid_request";
    };

export async function listActiveLoyaltyRewards() {
  return db
    .select({
      id: loyaltyRewards.id,
      name: loyaltyRewards.name,
      description: loyaltyRewards.description,
      pointsRequired: loyaltyRewards.pointsRequired,
    })
    .from(loyaltyRewards)
    .where(eq(loyaltyRewards.isActive, true))
    .orderBy(asc(loyaltyRewards.pointsRequired), asc(loyaltyRewards.name));
}

export async function redeemLoyaltyReward(
  userId: string,
  rewardId: string,
  idempotencyKey: string,
): Promise<RedeemLoyaltyRewardResult> {
  const normalizedRewardId = rewardId.trim();
  const normalizedIdempotencyKey = idempotencyKey.trim();
  if (!normalizedRewardId || !normalizedIdempotencyKey) {
    return { status: "skipped", reason: "invalid_request" };
  }

  const referenceId = JSON.stringify([normalizedRewardId, normalizedIdempotencyKey]);

  return db.transaction(async (tx) => {
    const [existingRedemption] = await tx
      .select({
        pointsDelta: loyaltyTransactions.pointsDelta,
        balanceAfter: loyaltyTransactions.balanceAfter,
      })
      .from(loyaltyTransactions)
      .where(
        and(
          eq(loyaltyTransactions.userId, userId),
          eq(loyaltyTransactions.referenceType, "reward_redemption"),
          eq(loyaltyTransactions.referenceId, referenceId),
          eq(loyaltyTransactions.type, "redeem"),
        ),
      )
      .limit(1);

    if (existingRedemption) {
      return {
        status: "already_redeemed",
        rewardId: normalizedRewardId,
        pointsDeducted: Math.abs(existingRedemption.pointsDelta),
        balanceAfter: existingRedemption.balanceAfter,
      };
    }

    const [reward] = await tx
      .select({
        id: loyaltyRewards.id,
        name: loyaltyRewards.name,
        pointsRequired: loyaltyRewards.pointsRequired,
      })
      .from(loyaltyRewards)
      .where(
        and(
          eq(loyaltyRewards.id, normalizedRewardId),
          eq(loyaltyRewards.isActive, true),
        ),
      )
      .limit(1);

    if (!reward) {
      return { status: "skipped", reason: "reward_not_available" };
    }

    const [profile] = await tx
      .select({ pointsBalance: memberProfiles.pointsBalance })
      .from(memberProfiles)
      .where(eq(memberProfiles.userId, userId))
      .limit(1);

    if (!profile) {
      return { status: "skipped", reason: "member_profile_missing" };
    }

    if (profile.pointsBalance < reward.pointsRequired) {
      return { status: "skipped", reason: "insufficient_balance" };
    }

    const [updatedProfile] = await tx
      .update(memberProfiles)
      .set({
        pointsBalance: sql`${memberProfiles.pointsBalance} - ${reward.pointsRequired}`,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(memberProfiles.userId, userId),
          gte(memberProfiles.pointsBalance, reward.pointsRequired),
        ),
      )
      .returning({ pointsBalance: memberProfiles.pointsBalance });

    if (!updatedProfile) {
      return { status: "skipped", reason: "insufficient_balance" };
    }

    await tx.insert(loyaltyTransactions)
      .values({
        id: randomUUID(),
        userId,
        type: "redeem",
        pointsDelta: -reward.pointsRequired,
        balanceAfter: updatedProfile.pointsBalance,
        description: `Penukaran hadiah: ${reward.name}`,
        referenceType: "reward_redemption",
        referenceId,
      });

    return {
      status: "redeemed",
      rewardId: reward.id,
      pointsDeducted: reward.pointsRequired,
      balanceAfter: updatedProfile.pointsBalance,
    };
  });
}

export async function getMemberLoyaltyOverview(userId: string) {
  return db.transaction(async (tx) => {
    const [profile] = await tx
      .select({ pointsBalance: memberProfiles.pointsBalance })
      .from(memberProfiles)
      .where(eq(memberProfiles.userId, userId))
      .limit(1);

    const transactions = await tx
      .select({
        id: loyaltyTransactions.id,
        type: loyaltyTransactions.type,
        pointsDelta: loyaltyTransactions.pointsDelta,
        balanceAfter: loyaltyTransactions.balanceAfter,
        description: loyaltyTransactions.description,
        createdAt: loyaltyTransactions.createdAt,
      })
      .from(loyaltyTransactions)
      .where(eq(loyaltyTransactions.userId, userId))
      .orderBy(desc(loyaltyTransactions.createdAt), desc(loyaltyTransactions.id));

    return {
      pointsBalance: profile?.pointsBalance ?? 0,
      transactions,
    };
  });
}

type LoyaltyTransaction = Parameters<Parameters<typeof db.transaction>[0]>[0];

export async function awardPointsForCompletedOrderInTransaction(
  tx: LoyaltyTransaction,
  orderId: string,
): Promise<AwardPointsForCompletedOrderResult> {
  const normalizedOrderId = orderId.trim();
  if (!normalizedOrderId || normalizedOrderId.length > 120) {
    return { status: "skipped", orderId, reason: "order_not_found" };
  }

  const [order] = await tx
    .select({
      id: orders.id,
      userId: orders.userId,
      status: orders.status,
      total: orders.total,
    })
    .from(orders)
    .where(eq(orders.id, normalizedOrderId))
    .limit(1);

  if (!order) {
    return {
      status: "skipped",
      orderId: normalizedOrderId,
      reason: "order_not_found",
    };
  }

  if (order.status !== "completed") {
    return {
      status: "skipped",
      orderId: order.id,
      reason: "order_not_completed",
    };
  }

  if (!order.userId) {
    return { status: "skipped", orderId: order.id, reason: "guest_order" };
  }

  const [member] = await tx
    .select({ id: authUser.id, role: authUser.role })
    .from(authUser)
    .where(and(eq(authUser.id, order.userId), eq(authUser.role, "user")))
    .limit(1);

  if (!member) {
    return { status: "skipped", orderId: order.id, reason: "non_member_order" };
  }

  const [profile] = await tx
    .select({ userId: memberProfiles.userId })
    .from(memberProfiles)
    .where(eq(memberProfiles.userId, order.userId))
    .limit(1);

  if (!profile) {
    return {
      status: "skipped",
      orderId: order.id,
      reason: "member_profile_missing",
    };
  }

  const [existingAward] = await tx
    .select({
      pointsDelta: loyaltyTransactions.pointsDelta,
      balanceAfter: loyaltyTransactions.balanceAfter,
    })
    .from(loyaltyTransactions)
    .where(
      and(
        eq(loyaltyTransactions.userId, order.userId),
        eq(loyaltyTransactions.referenceType, "order"),
        eq(loyaltyTransactions.referenceId, order.id),
        eq(loyaltyTransactions.type, "earn"),
      ),
    )
    .limit(1);

  if (existingAward) {
    return {
      status: "already_awarded",
      orderId: order.id,
      userId: order.userId,
      pointsAwarded: existingAward.pointsDelta,
      balanceAfter: existingAward.balanceAfter,
    };
  }

  if (!Number.isSafeInteger(order.total) || order.total <= 0) {
    return {
      status: "skipped",
      orderId: order.id,
      reason: "non_positive_total",
    };
  }

  const [earningSettings] = await tx
    .select({ idrPerPoint: loyaltySettings.idrPerPoint })
    .from(loyaltySettings)
    .where(eq(loyaltySettings.id, "default"))
    .limit(1);
  if (!earningSettings) {
    throw new Error("Canonical loyalty earning settings are missing.");
  }

  const pointsAwarded = calculateBaseLoyaltyPoints(
    order.total,
    earningSettings.idrPerPoint,
  );
  if (pointsAwarded === 0) {
    return { status: "skipped", orderId: order.id, reason: "zero_points" };
  }

  const [updatedProfile] = await tx
    .update(memberProfiles)
    .set({
      pointsBalance: sql`${memberProfiles.pointsBalance} + ${pointsAwarded}`,
      updatedAt: new Date(),
    })
    .where(eq(memberProfiles.userId, order.userId))
    .returning({ pointsBalance: memberProfiles.pointsBalance });

  if (!updatedProfile) {
    return {
      status: "skipped",
      orderId: order.id,
      reason: "member_profile_missing",
    };
  }

  await tx.insert(loyaltyTransactions)
    .values({
      id: randomUUID(),
      userId: order.userId,
      type: "earn",
      pointsDelta: pointsAwarded,
      balanceAfter: updatedProfile.pointsBalance,
      description: "Poin dari pesanan selesai",
      referenceType: "order",
      referenceId: order.id,
    });

  return {
    status: "awarded",
    orderId: order.id,
    userId: order.userId,
    pointsAwarded,
    balanceAfter: updatedProfile.pointsBalance,
  };
}

export async function awardPointsForCompletedOrder(
  orderId: string,
): Promise<AwardPointsForCompletedOrderResult> {
  return db.transaction(async (tx) => awardPointsForCompletedOrderInTransaction(tx, orderId));
}
