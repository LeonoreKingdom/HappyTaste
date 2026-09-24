import { NextRequest, NextResponse } from "next/server";

import { getMemberLoyaltyOverview } from "@/db/queries/loyalty";
import { requireMember } from "@/lib/auth-session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const privateResponseHeaders = { "Cache-Control": "private, no-store" };

export async function GET(request: NextRequest) {
  const session = await requireMember(request);
  if (!session) {
    return NextResponse.json(
      { success: false, error: "Login member diperlukan untuk melihat poin." },
      { status: 401, headers: privateResponseHeaders },
    );
  }

  if (session.user.role !== "user") {
    return NextResponse.json(
      { success: false, error: "Saldo poin hanya tersedia untuk akun member." },
      { status: 403, headers: privateResponseHeaders },
    );
  }

  try {
    const overview = getMemberLoyaltyOverview(session.user.id);
    return NextResponse.json(
      { success: true, data: overview },
      { headers: privateResponseHeaders },
    );
  } catch (error) {
    console.error("Error fetching member loyalty overview:", error);
    return NextResponse.json(
      { success: false, error: "Saldo dan riwayat poin tidak dapat dimuat." },
      { status: 500, headers: privateResponseHeaders },
    );
  }
}
