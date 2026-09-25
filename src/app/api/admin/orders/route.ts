import { NextResponse } from "next/server";

import { listAdminOrders } from "@/db/queries/admin-orders";
import { requireAdmin } from "@/lib/auth-session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const authorization = await requireAdmin(request);
  if (authorization.response) return authorization.response;

  try {
    const data = await listAdminOrders();
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Failed to list admin orders", error);
    return NextResponse.json(
      { success: false, error: "Daftar pesanan tidak dapat dimuat saat ini." },
      { status: 500 },
    );
  }
}
