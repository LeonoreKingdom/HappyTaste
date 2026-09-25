import { NextResponse } from "next/server";

import { updateAdminReservationStatus } from "@/db/services/admin-status";
import { requireAdmin } from "@/lib/auth-session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type ReservationRouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, { params }: ReservationRouteContext) {
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
      { success: false, error: "Body status reservasi tidak valid." },
      { status: 400 },
    );
  }

  try {
    const result = await updateAdminReservationStatus(
      id,
      (body as Record<string, unknown>).status,
    );
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: result.status },
      );
    }

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error("Failed to update admin reservation status", error);
    return NextResponse.json(
      { success: false, error: "Status reservasi tidak dapat diperbarui saat ini." },
      { status: 500 },
    );
  }
}
