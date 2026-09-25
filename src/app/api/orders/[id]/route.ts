import { NextRequest, NextResponse } from "next/server";

import { findMemberOrderById } from "@/db/queries/orders";
import { requireMember } from "@/lib/auth-session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await requireMember(request);
  if (!session) {
    return NextResponse.json(
      { success: false, error: "Login member diperlukan untuk melihat status pesanan." },
      { status: 401 },
    );
  }

  const { id } = await params;
  const orderId = id.trim();
  if (!orderId || orderId.length > 120) {
    return NextResponse.json(
      { success: false, error: "Pesanan tidak ditemukan." },
      { status: 404 },
    );
  }

  try {
    const order = await findMemberOrderById(orderId, session.user.id);
    if (!order) {
      return NextResponse.json(
        { success: false, error: "Pesanan tidak ditemukan." },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, data: order });
  } catch (error) {
    console.error("Error fetching order status:", error);
    return NextResponse.json(
      { success: false, error: "Status pesanan tidak dapat dimuat." },
      { status: 500 },
    );
  }
}
