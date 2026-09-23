import { eq } from "drizzle-orm";

import { db } from "@/db";
import { memberProfiles } from "@/db/schema";

export async function getMemberProfileByUserId(userId: string) {
  const [profile] = await db
    .select({
      phone: memberProfiles.phone,
      pointsBalance: memberProfiles.pointsBalance,
      createdAt: memberProfiles.createdAt,
      updatedAt: memberProfiles.updatedAt,
    })
    .from(memberProfiles)
    .where(eq(memberProfiles.userId, userId))
    .limit(1);

  return profile ?? null;
}

export async function ensureMemberProfileByUserId(userId: string) {
  await db
    .insert(memberProfiles)
    .values({ userId })
    .onConflictDoNothing({ target: memberProfiles.userId });

  return getMemberProfileByUserId(userId);
}

export async function updateMemberProfilePhone(userId: string, phone: string | null) {
  const [profile] = await db
    .update(memberProfiles)
    .set({ phone, updatedAt: new Date() })
    .where(eq(memberProfiles.userId, userId))
    .returning({
      phone: memberProfiles.phone,
      pointsBalance: memberProfiles.pointsBalance,
      createdAt: memberProfiles.createdAt,
      updatedAt: memberProfiles.updatedAt,
    });

  return profile ?? null;
}
