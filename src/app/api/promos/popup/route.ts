import { NextResponse } from "next/server";
import { getActivePopupPromo } from "@/db/queries/promos";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const promo = await getActivePopupPromo();

    return NextResponse.json({
      success: true,
      data: promo,
    });
  } catch (error) {
    console.error("Error fetching active popup promo:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Gagal mengambil promo pop up aktif",
      },
      { status: 500 }
    );
  }
}
