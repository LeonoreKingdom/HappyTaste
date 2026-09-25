import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/auth-session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const authorization = await requireAdmin(request);
  if (authorization.response) return authorization.response;

  try {
    const { getAdminPromoOverview } = await import("@/db/queries/promos");
    const data = await getAdminPromoOverview();
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Failed to list admin promos", error);
    return NextResponse.json(
      { success: false, error: "Daftar promo tidak dapat dimuat saat ini." },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  const authorization = await requireAdmin(request);
  if (authorization.response) return authorization.response;

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
    const { createAdminPromo } = await import("@/db/services/admin-promos");
    const result = await createAdminPromo(body);
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: result.status },
      );
    }

    return NextResponse.json({ success: true, data: { id: result.id } }, { status: 201 });
  } catch (error) {
    console.error("Failed to create admin promo", error);
    return NextResponse.json(
      { success: false, error: "Promo tidak dapat disimpan saat ini." },
      { status: 500 },
    );
  }
}
