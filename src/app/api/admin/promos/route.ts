import { NextRequest, NextResponse } from "next/server";
import { getAllPromos, createPromo } from "@/db/queries/promos";

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
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (
      !body.title ||
      !body.description ||
      !body.type ||
      !body.terms ||
      !body.startDate ||
      !body.endDate
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Field wajib: title, description, type, terms, startDate, endDate",
        },
        { status: 400 }
      );
    }

    const newPromo = await createPromo({
      id: body.id,
      title: body.title,
      description: body.description,
      type: body.type,
      value: typeof body.value === "number" ? body.value : 0,
      terms: body.terms,
      startDate: body.startDate,
      endDate: body.endDate,
      isActive: body.isActive !== false,
    });

    return NextResponse.json(
      {
        success: true,
        data: newPromo,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating promo in admin:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Gagal membuat promo baru",
      },
      { status: 500 }
    );
  }
}
