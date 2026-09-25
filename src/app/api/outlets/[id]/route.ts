import { NextResponse } from "next/server";

import { getPublicOutletById } from "@/db/queries/outlets";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const normalizedId = id.trim();

  if (!normalizedId || normalizedId.length > 120) {
    return NextResponse.json(
      { success: false, error: "Outlet tidak ditemukan." },
      { status: 404 },
    );
  }

  try {
    const outlet = await getPublicOutletById(normalizedId);

    if (!outlet) {
      return NextResponse.json(
        { success: false, error: "Outlet tidak ditemukan." },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, data: outlet });
  } catch (error) {
    console.error("Error loading outlet details:", error);
    return NextResponse.json(
      { success: false, error: "Detail outlet tidak dapat dimuat." },
      { status: 500 },
    );
  }
}
