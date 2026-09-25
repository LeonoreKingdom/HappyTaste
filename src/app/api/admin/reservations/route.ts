import { NextResponse } from "next/server";

import { listManagementReservations } from "@/db/queries/reservations";
import { requireAdmin } from "@/lib/auth-session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const authorization = await requireAdmin(request);
  if (authorization.response) return authorization.response;

  try {
    const reservations = await listManagementReservations();
    return NextResponse.json({ success: true, data: reservations });
  } catch (error) {
    console.error("Error listing management reservations:", error);
    return NextResponse.json(
      { success: false, error: "Daftar reservasi tidak dapat dimuat." },
      { status: 500 },
    );
  }
}
