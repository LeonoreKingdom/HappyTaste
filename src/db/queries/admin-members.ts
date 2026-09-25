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

export async function getAdminMemberOverview() {
  const adjustmentActor = alias(authUser, "adjustment_actor");
  const ruleChangeActor = alias(authUser, "rule_change_actor");
  const [members, transactions, settings, ruleChanges] = await Promise.all([
    db
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
      .limit(ADMIN_MEMBER_LIST_LIMIT),
    db
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
      .limit(ADMIN_LOYALTY_HISTORY_LIMIT),
    db
      .select({
        id: loyaltySettings.id,
        idrPerPoint: loyaltySettings.idrPerPoint,
        updatedAt: loyaltySettings.updatedAt,
        updatedByName: authUser.name,
      })
      .from(loyaltySettings)
      .leftJoin(authUser, eq(loyaltySettings.updatedByUserId, authUser.id))
      .where(eq(loyaltySettings.id, "default"))
      .limit(1),
    db
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
      .limit(20),
  ]);

  return { members, transactions, settings: settings[0] ?? null, ruleChanges };
}
