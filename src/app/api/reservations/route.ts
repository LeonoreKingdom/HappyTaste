import { NextRequest, NextResponse } from "next/server";

import {
  createMemberReservation,
  ReservationValidationError,
  reservationTableTypes,
  reservationTimeSlots,
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

function readRequiredString(body: Record<string, unknown>, field: string, maxLength = 120) {
  const value = body[field];
  if (typeof value !== "string") {
    throw new ReservationValidationError(`${field} wajib diisi.`);
  }

  const normalized = value.trim();
  if (!normalized || normalized.length > maxLength) {
    throw new ReservationValidationError(`${field} tidak valid.`);
  }

  return normalized;
}

function readOptionalString(body: Record<string, unknown>, field: string, maxLength: number) {
  const value = body[field];
  if (value === undefined || value === null) return undefined;
  if (typeof value !== "string" || value.trim().length > maxLength) {
    throw new ReservationValidationError(`${field} tidak valid.`);
  }
  return value.trim() || undefined;
}

export async function POST(request: NextRequest) {
  const session = await requireMember(request);
  if (!session) {
    return NextResponse.json(
      { success: false, error: "Login member diperlukan untuk membuat reservasi." },
      { status: 401 },
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

    const input = body as Record<string, unknown>;
    const outletId = readRequiredString(input, "outletId");
    const tableTypeId = readRequiredString(input, "tableTypeId");
    const arrivalDate = readRequiredString(input, "arrivalDate", 10);
    const arrivalTime = readRequiredString(input, "arrivalTime", 5);
    const notes = readOptionalString(input, "notes", 500);
    const guestCount = input.guestCount;

    if (!isValidCalendarDate(arrivalDate)) {
      throw new ReservationValidationError("Tanggal kedatangan tidak valid.");
    }
    if (!reservationTimeSlots.includes(arrivalTime as (typeof reservationTimeSlots)[number])) {
      throw new ReservationValidationError("Slot waktu tidak tersedia.");
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

    const reservation = await createMemberReservation({
      userId: session.user.id,
      outletId,
      tableTypeId,
      arrivalDate,
      arrivalTime,
      guestCount,
      notes,
    });

    return NextResponse.json({ success: true, data: reservation }, { status: 201 });
  } catch (error) {
    if (error instanceof ReservationValidationError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 },
      );
    }

    console.error("Error creating reservation:", error);
    return NextResponse.json(
      { success: false, error: "Reservasi tidak dapat dibuat." },
      { status: 500 },
    );
  }
}
