import { NextResponse } from "next/server";

import { updateAdminOrderStatus } from "@/db/services/admin-status";
import { requireAdmin } from "@/lib/auth-session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type OrderRouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, { params }: OrderRouteContext) {
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

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return NextResponse.json(
      { success: false, error: "Body status pesanan tidak valid." },
      { status: 400 },
    );
  }

  try {
    const result = await updateAdminOrderStatus(
      id,
      (body as Record<string, unknown>).status,
    );
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: result.status },
      );
    }

    const loyalty = result.loyalty;
    return NextResponse.json({
      success: true,
      data: {
        id: result.id,
        status: result.status,
        changed: result.changed,
        loyalty: loyalty
          ? {
              status: loyalty.status,
              ...(loyalty.status === "awarded" || loyalty.status === "already_awarded"
                ? { pointsAwarded: loyalty.pointsAwarded }
                : {}),
            }
          : null,
      },
    });
  } catch (error) {
    console.error("Failed to update admin order status", error);
    return NextResponse.json(
      { success: false, error: "Status pesanan tidak dapat diperbarui saat ini." },
      { status: 500 },
    );
  }
}
