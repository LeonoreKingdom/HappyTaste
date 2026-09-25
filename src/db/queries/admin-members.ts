import "server-only";

import { desc, eq } from "drizzle-orm";
import { alias } from "drizzle-orm/sqlite-core";

import { db } from "@/db";
import {
  loyaltyEarningRuleChanges,
  loyaltySettings,
  loyaltyTransactions,
  memberProfiles,
} from "@/db/schema";
import { user as authUser } from "@/db/schema/auth";

const ADMIN_MEMBER_LIST_LIMIT = 100;
const ADMIN_LOYALTY_HISTORY_LIMIT = 100;
const ADMIN_LOYALTY_RULE_HISTORY_LIMIT = 20;

export async function getAdminMemberList() {
  return db
    .select({
      id: authUser.id,
      name: authUser.name,
      email: authUser.email,
      phone: memberProfiles.phone,
      pointsBalance: memberProfiles.pointsBalance,
      joinedAt: authUser.createdAt,
    })
    .from(memberProfiles)
    .innerJoin(authUser, eq(memberProfiles.userId, authUser.id))
    .where(eq(authUser.role, "user"))
    .orderBy(desc(authUser.createdAt), desc(authUser.id))
    .limit(ADMIN_MEMBER_LIST_LIMIT);
}

export async function getAdminLoyaltyHistory() {
  const adjustmentActor = alias(authUser, "adjustment_actor");
  return db
    .select({
      id: loyaltyTransactions.id,
      memberId: authUser.id,
      memberName: authUser.name,
      memberEmail: authUser.email,
      adjustmentByName: adjustmentActor.name,
      type: loyaltyTransactions.type,
      pointsDelta: loyaltyTransactions.pointsDelta,
      balanceAfter: loyaltyTransactions.balanceAfter,
      description: loyaltyTransactions.description,
      createdAt: loyaltyTransactions.createdAt,
    })
    .from(loyaltyTransactions)
    .innerJoin(authUser, eq(loyaltyTransactions.userId, authUser.id))
    .leftJoin(adjustmentActor, eq(loyaltyTransactions.createdByUserId, adjustmentActor.id))
    .orderBy(desc(loyaltyTransactions.createdAt), desc(loyaltyTransactions.id))
    .limit(ADMIN_LOYALTY_HISTORY_LIMIT);
}

export async function getAdminLoyaltySettings() {
  const [settings] = await db
    .select({
      id: loyaltySettings.id,
      idrPerPoint: loyaltySettings.idrPerPoint,
      updatedAt: loyaltySettings.updatedAt,
      updatedByName: authUser.name,
    })
    .from(loyaltySettings)
    .leftJoin(authUser, eq(loyaltySettings.updatedByUserId, authUser.id))
    .where(eq(loyaltySettings.id, "default"))
    .limit(1);

  return settings ?? null;
}

export async function getAdminLoyaltyRuleChanges() {
  const ruleChangeActor = alias(authUser, "rule_change_actor");
  return db
    .select({
      id: loyaltyEarningRuleChanges.id,
      previousIdrPerPoint: loyaltyEarningRuleChanges.previousIdrPerPoint,
      newIdrPerPoint: loyaltyEarningRuleChanges.newIdrPerPoint,
      createdAt: loyaltyEarningRuleChanges.createdAt,
      changedByName: ruleChangeActor.name,
    })
    .from(loyaltyEarningRuleChanges)
    .leftJoin(ruleChangeActor, eq(loyaltyEarningRuleChanges.changedByUserId, ruleChangeActor.id))
    .orderBy(desc(loyaltyEarningRuleChanges.createdAt), desc(loyaltyEarningRuleChanges.id))
    .limit(ADMIN_LOYALTY_RULE_HISTORY_LIMIT);
}

export async function getAdminMemberOverview() {
  const [members, transactions, settings, ruleChanges] = await Promise.all([
    getAdminMemberList(),
    getAdminLoyaltyHistory(),
    getAdminLoyaltySettings(),
    getAdminLoyaltyRuleChanges(),
  ]);

  return { members, transactions, settings, ruleChanges };
}
