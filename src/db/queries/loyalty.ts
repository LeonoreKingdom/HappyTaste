import "server-only";

import { randomUUID } from "node:crypto";
import { and, eq, sql } from "drizzle-orm";

import { db } from "@/db";
import {
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

export function awardPointsForCompletedOrder(
  orderId: string,
): AwardPointsForCompletedOrderResult {
  const normalizedOrderId = orderId.trim();
  if (!normalizedOrderId || normalizedOrderId.length > 120) {
    return { status: "skipped", orderId, reason: "order_not_found" };
  }

  return db.transaction((tx) => {
    const [order] = tx
      .select({
        id: orders.id,
        userId: orders.userId,
        status: orders.status,
        total: orders.total,
      })
      .from(orders)
      .where(eq(orders.id, normalizedOrderId))
      .limit(1)
      .all();

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

    const [member] = tx
      .select({ id: authUser.id, role: authUser.role })
      .from(authUser)
      .where(and(eq(authUser.id, order.userId), eq(authUser.role, "user")))
      .limit(1)
      .all();

    if (!member) {
      return { status: "skipped", orderId: order.id, reason: "non_member_order" };
    }

    const [profile] = tx
      .select({ userId: memberProfiles.userId })
      .from(memberProfiles)
      .where(eq(memberProfiles.userId, order.userId))
      .limit(1)
      .all();

    if (!profile) {
      return {
        status: "skipped",
        orderId: order.id,
        reason: "member_profile_missing",
      };
    }

    const [existingAward] = tx
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
      .limit(1)
      .all();

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

    const pointsAwarded = calculateBaseLoyaltyPoints(order.total);
    if (pointsAwarded === 0) {
      return { status: "skipped", orderId: order.id, reason: "zero_points" };
    }

    const [updatedProfile] = tx
      .update(memberProfiles)
      .set({
        pointsBalance: sql`${memberProfiles.pointsBalance} + ${pointsAwarded}`,
        updatedAt: new Date(),
      })
      .where(eq(memberProfiles.userId, order.userId))
      .returning({ pointsBalance: memberProfiles.pointsBalance })
      .all();

    if (!updatedProfile) {
      return {
        status: "skipped",
        orderId: order.id,
        reason: "member_profile_missing",
      };
    }

    tx.insert(loyaltyTransactions)
      .values({
        id: randomUUID(),
        userId: order.userId,
        type: "earn",
        pointsDelta: pointsAwarded,
        balanceAfter: updatedProfile.pointsBalance,
        description: "Poin dari pesanan selesai",
        referenceType: "order",
        referenceId: order.id,
      })
      .run();

    return {
      status: "awarded",
      orderId: order.id,
      userId: order.userId,
      pointsAwarded,
      balanceAfter: updatedProfile.pointsBalance,
    };
  });
}
