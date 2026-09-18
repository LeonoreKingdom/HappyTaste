import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * Admin: Ambil detail promo berdasarkan ID
 * Guarded: Endpoint dinonaktifkan sementara sampai integrasi official Member/Auth tersedia
 */
export async function GET() {
  return NextResponse.json(
    {
      success: false,
      error:
        "Autentikasi admin diperlukan. Akses admin dinonaktifkan sementara menunggu modul official Member/Auth.",
    },
    { status: 401 }
  );
}

/**
 * Admin: Update promo berdasarkan ID
 * Guarded: Endpoint dinonaktifkan sementara sampai integrasi official Member/Auth tersedia
 */
export async function PUT() {
  return NextResponse.json(
    {
      success: false,
      error:
        "Autentikasi admin diperlukan. Akses admin dinonaktifkan sementara menunggu modul official Member/Auth.",
    },
    { status: 401 }
  );
}

export async function PATCH() {
  return PUT();
}

/**
 * Admin: Hapus promo berdasarkan ID
 * Guarded: Endpoint dinonaktifkan sementara sampai integrasi official Member/Auth tersedia
 */
export async function DELETE() {
  return NextResponse.json(
    {
      success: false,
      error:
        "Autentikasi admin diperlukan. Akses admin dinonaktifkan sementara menunggu modul official Member/Auth.",
    },
    { status: 401 }
  );
}
