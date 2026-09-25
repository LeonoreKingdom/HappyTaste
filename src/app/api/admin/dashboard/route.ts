import { NextResponse } from "next/server";

import {
  getAdminDailyDashboard,
  getAdminSalesTrend,
  parseAdminSalesTrendRange,
} from "@/db/queries/admin-dashboard";
import { requireAdmin } from "@/lib/auth-session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const authorization = await requireAdmin(request);
  if (authorization.response) return authorization.response;

  const { searchParams } = new URL(request.url);
  const range = parseAdminSalesTrendRange(searchParams.get("range"));
  const now = new Date();

  try {
    const [summary, salesTrend] = await Promise.all([
      getAdminDailyDashboard(now),
      getAdminSalesTrend(range, now),
    ]);

    return NextResponse.json({
      success: true,
      data: { summary, salesTrend },
    });
  } catch (error) {
    console.error("Failed to load admin dashboard summary", error);
    return NextResponse.json(
      { success: false, error: "Ringkasan dashboard tidak dapat dimuat saat ini." },
      { status: 500 },
    );
  }
}
