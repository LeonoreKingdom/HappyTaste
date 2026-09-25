import { NextRequest, NextResponse } from "next/server";

import { findRestaurantTableByQrCode } from "@/db/queries/restaurant-tables";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Public read-only endpoint used to validate a table QR before starting a dine-in order.
 */
export async function GET(request: NextRequest) {
  const qrCode = request.nextUrl.searchParams.get("qr")?.trim();

  if (!qrCode) {
    return NextResponse.json(
      { success: false, error: "Kode QR meja wajib diisi." },
      { status: 400 },
    );
  }

  try {
    const table = await findRestaurantTableByQrCode(qrCode);

    if (!table) {
      return NextResponse.json(
        { success: false, error: "QR meja tidak ditemukan." },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, data: table });
  } catch (error) {
    console.error("Error validating table QR:", error);
    return NextResponse.json(
      { success: false, error: "Validasi QR meja gagal." },
      { status: 500 },
    );
  }
}
