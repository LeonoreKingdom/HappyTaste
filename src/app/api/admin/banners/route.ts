import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/auth-session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const authorization = await requireAdmin(request);
  if (authorization.response) return authorization.response;

  try {
    const { getAdminPromoOverview } = await import("@/db/queries/promos");
    const { banners } = await getAdminPromoOverview();
    return NextResponse.json({ success: true, data: banners });
  } catch (error) {
    console.error("Failed to list admin banners", error);
    return NextResponse.json(
      { success: false, error: "Daftar banner tidak dapat dimuat saat ini." },
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
    const { createAdminBanner } = await import("@/db/services/admin-promos");
    const result = await createAdminBanner(body);
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: result.status },
      );
    }

    return NextResponse.json({ success: true, data: { id: result.id } }, { status: 201 });
  } catch (error) {
    console.error("Failed to create admin banner", error);
    return NextResponse.json(
      { success: false, error: "Banner tidak dapat disimpan saat ini." },
      { status: 500 },
    );
  }
}
