import { and, eq, notInArray } from "drizzle-orm";

import {
  mockReservationOutlets,
  mockReservationTableTypes,
  mockReservationTimeSlots,
} from "@/data/mock-reservations";
import { db } from "@/db";
import { reservations } from "@/db/schema";

export const reservationTimeSlots = mockReservationTimeSlots;
export const reservationTableTypes = mockReservationTableTypes;

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
