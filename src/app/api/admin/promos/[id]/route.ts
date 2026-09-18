import { NextRequest, NextResponse } from "next/server";
import { getPromoById } from "@/db/queries/promos";

export const dynamic = "force-dynamic";

/**
 * Admin: Ambil detail promo berdasarkan ID (termasuk non-aktif)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const withBanners = searchParams.get("with_banners") === "true";

    const promo = await getPromoById(id, { withBanners });

    if (!promo) {
      return NextResponse.json(
        {
          success: false,
          error: "Promo tidak ditemukan",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: promo,
    });
  } catch (error) {
    console.error("Error fetching promo in admin:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Gagal mengambil detail promo",
      },
      { status: 500 }
    );
  }
}

/**
 * Admin: Update promo berdasarkan ID
 * Guarded: Mutasi dinonaktifkan sementara sampai integrasi official Member/Auth tersedia
 */
export async function PUT() {
  return NextResponse.json(
    {
      success: false,
      error:
        "Autentikasi admin diperlukan. Operasi mutasi data dinonaktifkan sementara menunggu modul official Member/Auth.",
    },
    { status: 401 }
  );
}

export async function PATCH() {
  return PUT();
}

/**
 * Admin: Hapus promo berdasarkan ID
 * Guarded: Mutasi dinonaktifkan sementara sampai integrasi official Member/Auth tersedia
 */
export async function DELETE() {
  return NextResponse.json(
    {
      success: false,
      error:
        "Autentikasi admin diperlukan. Operasi mutasi data dinonaktifkan sementara menunggu modul official Member/Auth.",
    },
    { status: 401 }
  );
}
