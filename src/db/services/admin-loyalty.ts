import "server-only";

import { randomUUID } from "node:crypto";
import { and, eq } from "drizzle-orm";

import { db } from "@/db";
import {
  loyaltyEarningRuleChanges,
  loyaltySettings,
  loyaltyTransactions,
  memberProfiles,
  user as authUser,
} from "@/db/schema";

export function updateAdminLoyaltyEarningRule(
  adminUserId: string,
  value: unknown,
) {
  if (
    !value ||
    typeof value !== "object" ||
    Array.isArray(value) ||
    !Number.isSafeInteger((value as Record<string, unknown>).idrPerPoint) ||
    ((value as Record<string, unknown>).idrPerPoint as number) <= 0
  ) {
    return {
      success: false,
      status: 400,
      error: "Nilai rupiah per poin harus bilangan bulat positif.",
    } as const;
  }

  const idrPerPoint = (value as { idrPerPoint: number }).idrPerPoint;

  return db.transaction((tx) => {
    const [existing] = tx
      .select({ idrPerPoint: loyaltySettings.idrPerPoint })
      .from(loyaltySettings)
      .where(eq(loyaltySettings.id, "default"))
      .limit(1)
      .all();

    if (!existing) {
      return {
        success: false,
        status: 409,
        error: "Pengaturan poin belum tersedia. Pastikan migrasi database terbaru sudah diterapkan.",
      } as const;
    }

    if (existing.idrPerPoint === idrPerPoint) {
      return {
        success: true,
        changed: false,
        idrPerPoint,
      } as const;
    }

    const [updated] = tx
      .update(loyaltySettings)
      .set({ idrPerPoint, updatedByUserId: adminUserId, updatedAt: new Date() })
      .where(eq(loyaltySettings.id, "default"))
      .returning({ idrPerPoint: loyaltySettings.idrPerPoint })
      .all();

    if (!updated) {
      return {
        success: false,
        status: 409,
        error: "Pengaturan poin berubah di sesi lain. Muat ulang lalu coba lagi.",
      } as const;
    }

    tx.insert(loyaltyEarningRuleChanges)
      .values({
        id: randomUUID(),
        previousIdrPerPoint: existing.idrPerPoint,
        newIdrPerPoint: idrPerPoint,
        changedByUserId: adminUserId,
      })
      .run();

    return {
      success: true,
      changed: true,
      previousIdrPerPoint: existing.idrPerPoint,
      idrPerPoint,
    } as const;
  });
}

export function adjustAdminMemberPoints(
  adminUserId: string,
  memberId: string,
  input: unknown,
) {
  const normalizedMemberId = memberId.trim();
  if (!normalizedMemberId || normalizedMemberId.length > 120) {
    return { success: false, status: 404, error: "Member tidak ditemukan." } as const;
  }
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return { success: false, status: 400, error: "Data penyesuaian poin tidak valid." } as const;
  }

  const body = input as Record<string, unknown>;
  const pointsDelta = body.pointsDelta;
  const reason = typeof body.reason === "string" ? body.reason.trim() : "";
  const requestId = typeof body.requestId === "string" ? body.requestId.trim() : "";

  if (!Number.isSafeInteger(pointsDelta) || pointsDelta === 0) {
    return { success: false, status: 400, error: "Perubahan poin harus bilangan bulat selain nol." } as const;
  }
  if (!reason || reason.length < 5 || reason.length > 300) {
    return { success: false, status: 400, error: "Alasan penyesuaian wajib diisi (5–300 karakter)." } as const;
  }
  if (requestId.length < 16 || requestId.length > 120) {
    return { success: false, status: 400, error: "Kunci permintaan penyesuaian tidak valid." } as const;
  }

  const delta = pointsDelta as number;
  const description = `Penyesuaian admin: ${reason}`;

  return db.transaction((tx) => {
    const [existingAdjustment] = tx
      .select({
        pointsDelta: loyaltyTransactions.pointsDelta,
        balanceAfter: loyaltyTransactions.balanceAfter,
        description: loyaltyTransactions.description,
        createdByUserId: loyaltyTransactions.createdByUserId,
      })
      .from(loyaltyTransactions)
      .where(
        and(
          eq(loyaltyTransactions.userId, normalizedMemberId),
          eq(loyaltyTransactions.referenceType, "admin_adjustment"),
          eq(loyaltyTransactions.referenceId, requestId),
          eq(loyaltyTransactions.type, "adjustment"),
        ),
      )
      .limit(1)
      .all();

    if (existingAdjustment) {
      if (
        existingAdjustment.pointsDelta !== delta ||
        existingAdjustment.description !== description ||
        existingAdjustment.createdByUserId !== adminUserId
      ) {
        return {
          success: false,
          status: 409,
          error: "Kunci permintaan sudah digunakan untuk penyesuaian lain.",
        } as const;
      }

      return {
        success: true,
        status: "already_applied",
        pointsDelta: existingAdjustment.pointsDelta,
        balanceAfter: existingAdjustment.balanceAfter,
      } as const;
    }

    const [member] = tx
      .select({
        userId: memberProfiles.userId,
        pointsBalance: memberProfiles.pointsBalance,
      })
      .from(memberProfiles)
      .innerJoin(authUser, eq(memberProfiles.userId, authUser.id))
      .where(and(eq(memberProfiles.userId, normalizedMemberId), eq(authUser.role, "user")))
      .limit(1)
      .all();

    if (!member) {
      return { success: false, status: 404, error: "Member tidak ditemukan." } as const;
    }

    const balanceAfter = member.pointsBalance + delta;
    if (!Number.isSafeInteger(balanceAfter)) {
      return { success: false, status: 400, error: "Hasil saldo berada di luar rentang aman." } as const;
    }
    if (balanceAfter < 0) {
      return { success: false, status: 409, error: "Saldo poin tidak dapat menjadi negatif." } as const;
    }

    const [updated] = tx
      .update(memberProfiles)
      .set({ pointsBalance: balanceAfter, updatedAt: new Date() })
      .where(
        and(
          eq(memberProfiles.userId, normalizedMemberId),
          eq(memberProfiles.pointsBalance, member.pointsBalance),
        ),
      )
      .returning({ pointsBalance: memberProfiles.pointsBalance })
      .all();

    if (!updated) {
      return {
        success: false,
        status: 409,
        error: "Saldo berubah di sesi lain. Muat ulang lalu coba lagi.",
      } as const;
    }

    tx.insert(loyaltyTransactions)
      .values({
        id: randomUUID(),
        userId: normalizedMemberId,
        createdByUserId: adminUserId,
        type: "adjustment",
        pointsDelta: delta,
        balanceAfter: updated.pointsBalance,
        description,
        referenceType: "admin_adjustment",
        referenceId: requestId,
      })
      .run();

    return {
      success: true,
      status: "applied",
      pointsDelta: delta,
      balanceAfter: updated.pointsBalance,
    } as const;
  });
}
