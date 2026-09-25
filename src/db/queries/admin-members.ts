import "server-only";

import { desc, eq } from "drizzle-orm";

import { db } from "@/db";
import { loyaltyTransactions, memberProfiles } from "@/db/schema";
import { user as authUser } from "@/db/schema/auth";

const ADMIN_MEMBER_LIST_LIMIT = 100;
const ADMIN_LOYALTY_HISTORY_LIMIT = 100;

export async function getAdminMemberOverview() {
  const [members, transactions] = await Promise.all([
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
        type: loyaltyTransactions.type,
        pointsDelta: loyaltyTransactions.pointsDelta,
        balanceAfter: loyaltyTransactions.balanceAfter,
        description: loyaltyTransactions.description,
        createdAt: loyaltyTransactions.createdAt,
      })
      .from(loyaltyTransactions)
      .innerJoin(authUser, eq(loyaltyTransactions.userId, authUser.id))
      .orderBy(desc(loyaltyTransactions.createdAt), desc(loyaltyTransactions.id))
      .limit(ADMIN_LOYALTY_HISTORY_LIMIT),
  ]);

  return { members, transactions };
}
