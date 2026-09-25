import { NextResponse } from "next/server";

import {
  getAdminLoyaltyHistory,
  getAdminMemberList,
} from "@/db/queries/admin-members";
import { requireAdmin } from "@/lib/auth-session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const authorization = await requireAdmin(request);
  if (authorization.response) return authorization.response;

  try {
    const [members, transactions] = await Promise.all([
      getAdminMemberList(),
      getAdminLoyaltyHistory(),
    ]);

    return NextResponse.json({
      success: true,
      data: { members, transactions },
    });
  } catch (error) {
    console.error("Failed to load admin members and loyalty history", error);
    return NextResponse.json(
      { success: false, error: "Data member dan riwayat poin tidak dapat dimuat saat ini." },
      { status: 500 },
    );
  }
}
