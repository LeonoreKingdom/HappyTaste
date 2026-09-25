import { NextResponse } from "next/server";

import { adjustAdminMemberPoints } from "@/db/services/admin-loyalty";
import { requireAdmin } from "@/lib/auth-session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type MemberPointsRouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(request: Request, { params }: MemberPointsRouteContext) {
  const authorization = await requireAdmin(request);
  if (authorization.response) return authorization.response;

  const { id } = await params;
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, error: "Body harus berupa JSON yang valid." },
      { status: 400 },
    );
  }

  try {
    const result = await adjustAdminMemberPoints(authorization.session.user.id, id, body);
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: result.status },
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        status: result.status,
        pointsDelta: result.pointsDelta,
        balanceAfter: result.balanceAfter,
      },
    });
  } catch (error) {
    console.error("Failed to adjust admin member points", error);
    return NextResponse.json(
      { success: false, error: "Saldo poin tidak dapat disesuaikan saat ini." },
      { status: 500 },
    );
  }
}
