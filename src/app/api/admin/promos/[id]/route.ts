import { NextRequest, NextResponse } from "next/server";
import { getPromoById, updatePromo, deletePromo } from "@/db/queries/promos";

export const dynamic = "force-dynamic";

/**
 * Admin: Ambil detail promo berdasarkan ID
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
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const existing = await getPromoById(id);
    if (!existing) {
      return NextResponse.json(
        {
          success: false,
          error: "Promo tidak ditemukan",
        },
        { status: 404 }
      );
    }

    const updated = await updatePromo(id, {
      title: body.title,
      description: body.description,
      type: body.type,
      value: body.value,
      terms: body.terms,
      startDate: body.startDate,
      endDate: body.endDate,
      isActive: body.isActive,
    });

    return NextResponse.json({
      success: true,
      data: updated,
    });
  } catch (error) {
    console.error("Error updating promo in admin:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Gagal memperbarui promo",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return PUT(request, { params });
}

/**
 * Admin: Hapus promo berdasarkan ID
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const existing = await getPromoById(id);
    if (!existing) {
      return NextResponse.json(
        {
          success: false,
          error: "Promo tidak ditemukan",
        },
        { status: 404 }
      );
    }

    const deleted = await deletePromo(id);

    return NextResponse.json({
      success: true,
      message: "Promo berhasil dihapus",
      data: deleted,
    });
  } catch (error) {
    console.error("Error deleting promo in admin:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Gagal menghapus promo",
      },
      { status: 500 }
    );
  }
}
