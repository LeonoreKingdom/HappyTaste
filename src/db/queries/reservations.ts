import { randomUUID } from "node:crypto";

import { and, asc, desc, eq, notInArray } from "drizzle-orm";

import {
  mockReservationOutlets,
  mockReservationTableTypes,
  mockReservationTimeSlots,
} from "@/data/mock-reservations";
import { db } from "@/db";
import { reservations } from "@/db/schema";

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

export async function getReservationAvailability(input: {
  outletId: string;
  arrivalDate: string;
  guestCount: number;
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
