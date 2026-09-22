import { NextRequest, NextResponse } from "next/server";

import {
  findMemberReservationById,
  reservationTableTypes,
  reservationTimeSlots,
  ReservationValidationError,
  updateMemberReservation,
} from "@/db/queries/reservations";
import { requireMember } from "@/lib/auth-session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function isValidCalendarDate(value: unknown): value is string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await requireMember(request);
  if (!session) {
    return NextResponse.json(
      { success: false, error: "Login member diperlukan untuk mengubah reservasi." },
      { status: 401 },
    );
  }

  const { id } = await params;
  const reservationId = id.trim();
  if (!reservationId || reservationId.length > 120) {
    return NextResponse.json(
      { success: false, error: "Reservasi tidak ditemukan." },
      { status: 404 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, error: "Body JSON tidak valid." },
      { status: 400 },
    );
  }

  try {
    if (typeof body !== "object" || body === null || Array.isArray(body)) {
      throw new ReservationValidationError("Body reservasi tidak valid.");
    }

    const existing = await findMemberReservationById(reservationId, session.user.id);
    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Reservasi tidak ditemukan." },
        { status: 404 },
      );
    }

    const input = body as Record<string, unknown>;
    const hasChanges = ["arrivalDate", "arrivalTime", "guestCount", "tableTypeId"].some(
      (field) => input[field] !== undefined,
    );
    if (!hasChanges) {
      throw new ReservationValidationError("Tidak ada perubahan reservasi.");
    }

    const arrivalDate = input.arrivalDate ?? existing.arrivalDate;
    const arrivalTime = input.arrivalTime ?? existing.arrivalTime;
    const tableTypeId = input.tableTypeId ?? existing.tableTypeId;
    const guestCount = input.guestCount ?? existing.guestCount;

    if (!isValidCalendarDate(arrivalDate)) {
      throw new ReservationValidationError("Tanggal kedatangan tidak valid.");
    }
    if (
      typeof arrivalTime !== "string" ||
      !reservationTimeSlots.includes(arrivalTime as (typeof reservationTimeSlots)[number])
    ) {
      throw new ReservationValidationError("Slot waktu tidak tersedia.");
    }
    if (
      typeof tableTypeId !== "string" ||
      !reservationTableTypes.some((tableType) => tableType.id === tableTypeId)
    ) {
      throw new ReservationValidationError("Tipe meja tidak tersedia.");
    }
    if (
      typeof guestCount !== "number" ||
      !Number.isSafeInteger(guestCount) ||
      guestCount < 1 ||
      guestCount > 20
    ) {
      throw new ReservationValidationError("Jumlah tamu harus berupa angka 1–20.");
    }

    const tableType = reservationTableTypes.find((item) => item.id === tableTypeId);
    if (
      !tableType ||
      guestCount < tableType.minGuests ||
      guestCount > tableType.maxGuests
    ) {
      throw new ReservationValidationError(
        "Tipe meja tidak sesuai dengan jumlah tamu.",
      );
    }

    const reservation = await updateMemberReservation({
      reservationId,
      userId: session.user.id,
      outletId: existing.outletId,
      tableTypeId,
      arrivalDate,
      arrivalTime,
      guestCount,
    });

    if (!reservation) {
      return NextResponse.json(
        { success: false, error: "Reservasi tidak ditemukan." },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, data: reservation });
  } catch (error) {
    if (error instanceof ReservationValidationError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 },
      );
    }

    console.error("Error updating reservation:", error);
    return NextResponse.json(
      { success: false, error: "Reservasi tidak dapat diubah." },
      { status: 500 },
    );
  }
}
