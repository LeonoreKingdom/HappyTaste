import { NextRequest, NextResponse } from "next/server";

import {
  getReservationAvailability,
  reservationTableTypes,
  reservationTimeSlots,
} from "@/db/queries/reservations";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function isValidCalendarDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  return (
    !Number.isNaN(date.getTime()) &&
    date.toISOString().slice(0, 10) === value
  );
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const outletId = searchParams.get("outletId")?.trim();
  const arrivalDate = searchParams.get("date")?.trim();
  const guestCountValue = searchParams.get("guests")?.trim();
  const guestCount = guestCountValue ? Number(guestCountValue) : Number.NaN;

  if (!outletId || !arrivalDate || !isValidCalendarDate(arrivalDate)) {
    return NextResponse.json(
      { success: false, error: "Outlet dan tanggal kedatangan wajib valid." },
      { status: 400 },
    );
  }

  if (
    !Number.isSafeInteger(guestCount) ||
    guestCount < 1 ||
    guestCount > 20
  ) {
    return NextResponse.json(
      { success: false, error: "Jumlah tamu harus berupa angka 1–20." },
      { status: 400 },
    );
  }

  try {
    const availability = await getReservationAvailability({
      outletId,
      arrivalDate,
      guestCount,
    });

    if (!availability) {
      return NextResponse.json(
        { success: false, error: "Outlet tidak ditemukan." },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: availability,
      meta: {
        supportedTimeSlots: reservationTimeSlots,
        supportedTableTypes: reservationTableTypes,
      },
    });
  } catch (error) {
    console.error("Error fetching reservation availability:", error);
    return NextResponse.json(
      { success: false, error: "Ketersediaan meja tidak dapat dimuat." },
      { status: 500 },
    );
  }
}
