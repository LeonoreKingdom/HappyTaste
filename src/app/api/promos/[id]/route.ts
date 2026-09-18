import { NextRequest, NextResponse } from "next/server";
import { getPromoById } from "@/db/queries/promos";

export const dynamic = "force-dynamic";

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
    console.error("Error fetching promo detail:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Gagal mengambil detail promo",
      },
      { status: 500 }
    );
  }
}
