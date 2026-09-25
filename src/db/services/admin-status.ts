import "server-only";

import { and, eq } from "drizzle-orm";

import { db } from "@/db";
import { orderStatuses, orders, reservationStatuses, reservations } from "@/db/schema";
import { awardPointsForCompletedOrderInTransaction } from "@/db/queries/loyalty";

export type AdminOrderStatus = (typeof orderStatuses)[number];
export type AdminReservationStatus = (typeof reservationStatuses)[number];

const orderStatusTransitions: Record<AdminOrderStatus, readonly AdminOrderStatus[]> = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["preparing", "cancelled"],
  preparing: ["ready", "cancelled"],
  ready: ["completed", "cancelled"],
  completed: [],
  cancelled: [],
};

const reservationStatusTransitions: Record<
  AdminReservationStatus,
  readonly AdminReservationStatus[]
> = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["completed", "cancelled"],
  cancelled: [],
  completed: [],
};

export async function updateAdminOrderStatus(
  orderId: string,
  requestedStatus: unknown,
) {
  const id = orderId.trim();
  if (!id || id.length > 120) {
    return { success: false, status: 404, error: "Pesanan tidak ditemukan." } as const;
  }
  if (
    typeof requestedStatus !== "string" ||
    !orderStatuses.includes(requestedStatus as AdminOrderStatus)
  ) {
    return { success: false, status: 400, error: "Status pesanan tidak valid." } as const;
  }

  const status = requestedStatus as AdminOrderStatus;
  return db.transaction(async (tx) => {
    const [existing] = await tx
      .select({ status: orders.status })
      .from(orders)
      .where(eq(orders.id, id))
      .limit(1);

    if (!existing) {
      return { success: false, status: 404, error: "Pesanan tidak ditemukan." } as const;
    }

    let changed = false;
    if (status !== existing.status) {
      if (!orderStatusTransitions[existing.status].includes(status)) {
        return {
          success: false,
          status: 409,
          error: `Perubahan status dari ${existing.status} ke ${status} tidak diizinkan.`,
        } as const;
      }

      const [updated] = await tx
        .update(orders)
        .set({ status })
        .where(and(eq(orders.id, id), eq(orders.status, existing.status)))
        .returning({ id: orders.id });

      if (!updated) {
        return {
          success: false,
          status: 409,
          error: "Status pesanan berubah di sesi lain. Muat ulang lalu coba lagi.",
        } as const;
      }
      changed = true;
    }

    // Keep the completed-order status and the idempotent points ledger in one transaction.
    const loyalty = status === "completed"
      ? await awardPointsForCompletedOrderInTransaction(tx, id)
      : null;

    return { success: true, id, status, changed, loyalty } as const;
  });
}

export async function updateAdminReservationStatus(
  reservationId: string,
  requestedStatus: unknown,
) {
  const id = reservationId.trim();
  if (!id || id.length > 120) {
    return { success: false, status: 404, error: "Reservasi tidak ditemukan." } as const;
  }
  if (
    typeof requestedStatus !== "string" ||
    !reservationStatuses.includes(requestedStatus as AdminReservationStatus)
  ) {
    return { success: false, status: 400, error: "Status reservasi tidak valid." } as const;
  }

  const status = requestedStatus as AdminReservationStatus;
  const [existing] = await db
    .select({ status: reservations.status })
    .from(reservations)
    .where(eq(reservations.id, id))
    .limit(1);

  if (!existing) {
    return { success: false, status: 404, error: "Reservasi tidak ditemukan." } as const;
  }

  if (status === existing.status) {
    return { success: true, id, status, changed: false } as const;
  }
  if (!reservationStatusTransitions[existing.status].includes(status)) {
    return {
      success: false,
      status: 409,
      error: `Perubahan status dari ${existing.status} ke ${status} tidak diizinkan.`,
    } as const;
  }

  const [updated] = await db
    .update(reservations)
    .set({ status, updatedAt: new Date() })
    .where(and(eq(reservations.id, id), eq(reservations.status, existing.status)))
    .returning({ id: reservations.id });

  if (!updated) {
    return {
      success: false,
      status: 409,
      error: "Status reservasi berubah di sesi lain. Muat ulang lalu coba lagi.",
    } as const;
  }

  return { success: true, id, status, changed: true } as const;
}

export function getAdminOrderStatusTransitions(status: AdminOrderStatus) {
  return orderStatusTransitions[status];
}

export function getAdminReservationStatusTransitions(status: AdminReservationStatus) {
  return reservationStatusTransitions[status];
}
