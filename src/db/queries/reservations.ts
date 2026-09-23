import { randomUUID } from "node:crypto";

import { and, asc, desc, eq, ne, notInArray } from "drizzle-orm";

import {
  mockReservationOutlets,
  mockReservationTableTypes,
  mockReservationTimeSlots,
} from "@/data/mock-reservations";
import { db } from "@/db";
import { reservations } from "@/db/schema";
import { user as authUser } from "@/db/schema/auth";

export const reservationTimeSlots = mockReservationTimeSlots;
export const reservationTableTypes = mockReservationTableTypes;

export type CreateMemberReservationInput = {
  userId: string;
  outletId: string;
  tableTypeId: string;
  arrivalDate: string;
  arrivalTime: string;
  guestCount: number;
  notes?: string;
};

export class ReservationValidationError extends Error {}

export async function listMemberReservations(userId: string) {
  const rows = await db
    .select({
      id: reservations.id,
      outletId: reservations.outletId,
      tableTypeId: reservations.tableTypeId,
      arrivalDate: reservations.arrivalDate,
      arrivalTime: reservations.arrivalTime,
      guestCount: reservations.guestCount,
      status: reservations.status,
      notes: reservations.notes,
      createdAt: reservations.createdAt,
      updatedAt: reservations.updatedAt,
    })
    .from(reservations)
    .where(eq(reservations.userId, userId))
    .orderBy(desc(reservations.arrivalDate), desc(reservations.arrivalTime), asc(reservations.id));

  return rows.map((reservation) => ({
    ...reservation,
    outlet: mockReservationOutlets.find((outlet) => outlet.id === reservation.outletId) ?? null,
    tableType:
      reservationTableTypes.find((tableType) => tableType.id === reservation.tableTypeId) ??
      null,
  }));
}

export async function listManagementReservations() {
  const rows = await db
    .select({
      id: reservations.id,
      outletId: reservations.outletId,
      tableTypeId: reservations.tableTypeId,
      arrivalDate: reservations.arrivalDate,
      arrivalTime: reservations.arrivalTime,
      guestCount: reservations.guestCount,
      status: reservations.status,
      notes: reservations.notes,
      createdAt: reservations.createdAt,
      updatedAt: reservations.updatedAt,
      memberId: authUser.id,
      memberName: authUser.name,
      memberEmail: authUser.email,
    })
    .from(reservations)
    .innerJoin(authUser, eq(reservations.userId, authUser.id))
    .orderBy(asc(reservations.arrivalDate), asc(reservations.arrivalTime), asc(reservations.id));

  return rows.map(({ memberId, memberName, memberEmail, ...reservation }) => ({
    ...reservation,
    member: { id: memberId, name: memberName, email: memberEmail },
    outlet: mockReservationOutlets.find((outlet) => outlet.id === reservation.outletId) ?? null,
    tableType:
      reservationTableTypes.find((tableType) => tableType.id === reservation.tableTypeId) ??
      null,
  }));
}

export async function getReservationAvailability(input: {
  outletId: string;
  arrivalDate: string;
  guestCount: number;
  excludeReservationId?: string;
}) {
  const outlet = mockReservationOutlets.find((item) => item.id === input.outletId);
  if (!outlet) return null;

  const blockedReservations = await db
    .select({
      arrivalTime: reservations.arrivalTime,
      tableTypeId: reservations.tableTypeId,
    })
    .from(reservations)
    .where(
      and(
        eq(reservations.outletId, input.outletId),
        eq(reservations.arrivalDate, input.arrivalDate),
        notInArray(reservations.status, ["cancelled", "completed"]),
        input.excludeReservationId
          ? ne(reservations.id, input.excludeReservationId)
          : undefined,
      ),
    );

  const blocked = new Set(
    blockedReservations.map(
      (reservation) => `${reservation.arrivalTime}:${reservation.tableTypeId}`,
    ),
  );
  const matchingTableTypes = reservationTableTypes.filter(
    (tableType) =>
      input.guestCount >= tableType.minGuests &&
      input.guestCount <= tableType.maxGuests,
  );
  const now = new Date();

  const timeSlots = reservationTimeSlots.map((time) => {
    const isPast = new Date(`${input.arrivalDate}T${time}:00`).getTime() <= now.getTime();
    const availableTableTypes = matchingTableTypes.filter(
      (tableType) => !isPast && !blocked.has(`${time}:${tableType.id}`),
    );

    return {
      time,
      available: availableTableTypes.length > 0,
      tableTypes: availableTableTypes,
    };
  });

  return {
    outlet,
    date: input.arrivalDate,
    guestCount: input.guestCount,
    tableTypes: matchingTableTypes,
    timeSlots,
  };
}

export async function findMemberReservationById(
  reservationId: string,
  userId: string,
) {
  const [reservation] = await db
    .select({
      id: reservations.id,
      outletId: reservations.outletId,
      tableTypeId: reservations.tableTypeId,
      arrivalDate: reservations.arrivalDate,
      arrivalTime: reservations.arrivalTime,
      guestCount: reservations.guestCount,
      status: reservations.status,
      notes: reservations.notes,
      createdAt: reservations.createdAt,
      updatedAt: reservations.updatedAt,
    })
    .from(reservations)
    .where(and(eq(reservations.id, reservationId), eq(reservations.userId, userId)))
    .limit(1);

  return reservation ?? null;
}

export async function createMemberReservation(input: CreateMemberReservationInput) {
  const availability = await getReservationAvailability({
    outletId: input.outletId,
    arrivalDate: input.arrivalDate,
    guestCount: input.guestCount,
  });

  if (!availability) {
    throw new ReservationValidationError("Outlet tidak ditemukan.");
  }

  const slot = availability.timeSlots.find((item) => item.time === input.arrivalTime);
  if (!slot || !slot.tableTypes.some((item) => item.id === input.tableTypeId)) {
    throw new ReservationValidationError(
      "Tipe meja tidak sesuai dengan jumlah tamu atau slot tidak tersedia.",
    );
  }

  const reservationId = randomUUID();
  db.insert(reservations)
    .values({
      id: reservationId,
      userId: input.userId,
      outletId: input.outletId,
      tableTypeId: input.tableTypeId,
      arrivalDate: input.arrivalDate,
      arrivalTime: input.arrivalTime,
      guestCount: input.guestCount,
      status: "pending",
      notes: input.notes ?? null,
    })
    .run();

  return {
    id: reservationId,
    outletId: input.outletId,
    tableTypeId: input.tableTypeId,
    arrivalDate: input.arrivalDate,
    arrivalTime: input.arrivalTime,
    guestCount: input.guestCount,
    status: "pending" as const,
    notes: input.notes ?? null,
  };
}

export async function updateMemberReservation(input: {
  reservationId: string;
  userId: string;
  outletId: string;
  tableTypeId: string;
  arrivalDate: string;
  arrivalTime: string;
  guestCount: number;
}) {
  const existing = await findMemberReservationById(input.reservationId, input.userId);
  if (!existing) return null;
  if (existing.status !== "pending" && existing.status !== "confirmed") {
    throw new ReservationValidationError(
      "Reservasi dengan status ini tidak dapat diubah.",
    );
  }

  const availability = await getReservationAvailability({
    outletId: input.outletId,
    arrivalDate: input.arrivalDate,
    guestCount: input.guestCount,
    excludeReservationId: input.reservationId,
  });
  if (!availability) {
    throw new ReservationValidationError("Outlet tidak ditemukan.");
  }

  const slot = availability.timeSlots.find((item) => item.time === input.arrivalTime);
  if (!slot || !slot.tableTypes.some((item) => item.id === input.tableTypeId)) {
    throw new ReservationValidationError(
      "Tipe meja tidak sesuai dengan jumlah tamu atau slot tidak tersedia.",
    );
  }

  const updatedAt = new Date();
  db.update(reservations)
    .set({
      tableTypeId: input.tableTypeId,
      arrivalDate: input.arrivalDate,
      arrivalTime: input.arrivalTime,
      guestCount: input.guestCount,
      updatedAt,
    })
    .where(
      and(
        eq(reservations.id, input.reservationId),
        eq(reservations.userId, input.userId),
      ),
    )
    .run();

  return {
    ...existing,
    tableTypeId: input.tableTypeId,
    arrivalDate: input.arrivalDate,
    arrivalTime: input.arrivalTime,
    guestCount: input.guestCount,
    updatedAt,
  };
}

export async function cancelMemberReservation(reservationId: string, userId: string) {
  const existing = await findMemberReservationById(reservationId, userId);
  if (!existing) return null;
  if (existing.status !== "pending" && existing.status !== "confirmed") {
    throw new ReservationValidationError(
      "Reservasi dengan status ini tidak dapat dibatalkan.",
    );
  }

  const updatedAt = new Date();
  db.update(reservations)
    .set({ status: "cancelled", updatedAt })
    .where(
      and(eq(reservations.id, reservationId), eq(reservations.userId, userId)),
    )
    .run();

  return { ...existing, status: "cancelled" as const, updatedAt };
}
