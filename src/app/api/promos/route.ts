import { NextRequest, NextResponse } from "next/server";
import { getActivePromos, getAllPromos } from "@/db/queries/promos";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get("active") !== "false";
    const type = searchParams.get("type") || undefined;
    const withBanners = searchParams.get("with_banners") === "true";

    const data = activeOnly
      ? await getActivePromos({ type, withBanners })
      : await getAllPromos({ type, withBanners });

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Error fetching promos:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Gagal mengambil daftar promo",
      },
      { status: 500 }
    );
  }
}
