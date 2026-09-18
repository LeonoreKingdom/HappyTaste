import { NextRequest, NextResponse } from "next/server";
import { getAllPromos } from "@/db/queries/promos";

export const dynamic = "force-dynamic";

/**
 * Admin: Ambil semua promo (termasuk non-aktif)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || undefined;
    const withBanners = searchParams.get("with_banners") === "true";

    const data = await getAllPromos({ type, withBanners });

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Error fetching admin promos:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Gagal mengambil daftar promo admin",
      },
      { status: 500 }
    );
  }
}

/**
 * Admin: Buat promo baru
 * Guarded: Mutasi dinonaktifkan sementara sampai integrasi official Member/Auth tersedia
 */
export async function POST() {
  return NextResponse.json(
    {
      success: false,
      error:
        "Autentikasi admin diperlukan. Operasi mutasi data dinonaktifkan sementara menunggu modul official Member/Auth.",
    },
    { status: 401 }
  );
}
