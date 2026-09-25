import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/auth-session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type BannerRouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(request: Request, { params }: BannerRouteContext) {
  const authorization = await requireAdmin(request);
  if (authorization.response) return authorization.response;

  const { id } = await params;
  try {
    const { getAdminBannerById } = await import("@/db/queries/promos");
    const banner = await getAdminBannerById(id);
    if (!banner) {
      return NextResponse.json(
        { success: false, error: "Banner tidak ditemukan." },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, data: banner });
  } catch (error) {
    console.error("Failed to load admin banner", error);
    return NextResponse.json(
      { success: false, error: "Detail banner tidak dapat dimuat saat ini." },
      { status: 500 },
    );
  }
}

export async function PUT(request: Request, { params }: BannerRouteContext) {
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
    const { updateAdminBanner } = await import("@/db/services/admin-promos");
    const result = await updateAdminBanner(id, body);
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: result.status },
      );
    }

    return NextResponse.json({ success: true, data: { id: result.id } });
  } catch (error) {
    console.error("Failed to update admin banner", error);
    return NextResponse.json(
      { success: false, error: "Banner tidak dapat diperbarui saat ini." },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request, context: BannerRouteContext) {
  return PUT(request, context);
}

export async function DELETE(request: Request) {
  const authorization = await requireAdmin(request);
  if (authorization.response) return authorization.response;

  return NextResponse.json(
    { success: false, error: "Penghapusan banner belum tersedia." },
    { status: 405, headers: { Allow: "GET, PUT, PATCH" } },
  );
}
