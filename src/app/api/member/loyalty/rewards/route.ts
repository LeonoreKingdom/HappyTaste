import { NextRequest, NextResponse } from "next/server";

import { listActiveLoyaltyRewards } from "@/db/queries/loyalty";
import { requireMember } from "@/lib/auth-session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const privateResponseHeaders = { "Cache-Control": "private, no-store" };

export async function GET(request: NextRequest) {
  const session = await requireMember(request);
  if (!session) {
    return NextResponse.json(
      { success: false, error: "Login member diperlukan untuk melihat hadiah." },
      { status: 401, headers: privateResponseHeaders },
    );
  }

  if (session.user.role !== "user") {
    return NextResponse.json(
      { success: false, error: "Katalog hadiah hanya tersedia untuk akun member." },
      { status: 403, headers: privateResponseHeaders },
    );
  }

  try {
    const rewards = await listActiveLoyaltyRewards();
    return NextResponse.json(
      { success: true, data: rewards },
      { headers: privateResponseHeaders },
    );
  } catch (error) {
    console.error("Error listing loyalty rewards:", error);
    return NextResponse.json(
      { success: false, error: "Daftar hadiah tidak dapat dimuat." },
      { status: 500, headers: privateResponseHeaders },
    );
  }
}
