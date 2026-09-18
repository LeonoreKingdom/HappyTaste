import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * Admin: Ambil semua promo
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
 * Admin: Buat promo baru
 * Guarded: Endpoint dinonaktifkan sementara sampai integrasi official Member/Auth tersedia
 */
export async function POST() {
  return NextResponse.json(
    {
      success: false,
      error:
        "Autentikasi admin diperlukan. Akses admin dinonaktifkan sementara menunggu modul official Member/Auth.",
    },
    { status: 401 }
  );
}
