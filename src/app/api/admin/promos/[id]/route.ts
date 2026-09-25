import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/auth-session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type PromoRouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(request: Request, { params }: PromoRouteContext) {
  const authorization = await requireAdmin(request);
  if (authorization.response) return authorization.response;

  const { id } = await params;
  try {
    const { getPromoById } = await import("@/db/queries/promos");
    const promo = await getPromoById(id, { withBanners: true });
    if (!promo) {
      return NextResponse.json(
        { success: false, error: "Promo tidak ditemukan." },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, data: promo });
  } catch (error) {
    console.error("Failed to load admin promo", error);
    return NextResponse.json(
      { success: false, error: "Detail promo tidak dapat dimuat saat ini." },
      { status: 500 },
    );
  }
}

async function updatePromoRoute(
  request: Request,
  { params }: PromoRouteContext,
  merge: boolean,
) {
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
    const { updateAdminPromo } = await import("@/db/services/admin-promos");
    const result = await updateAdminPromo(id, body, { merge });
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: result.status },
      );
    }

    return NextResponse.json({ success: true, data: { id: result.id } });
  } catch (error) {
    console.error("Failed to update admin promo", error);
    return NextResponse.json(
      { success: false, error: "Promo tidak dapat diperbarui saat ini." },
      { status: 500 },
    );
  }
}

export async function PUT(request: Request, context: PromoRouteContext) {
  return updatePromoRoute(request, context, false);
}

export async function PATCH(request: Request, context: PromoRouteContext) {
  return updatePromoRoute(request, context, true);
}

export async function DELETE(request: Request) {
  const authorization = await requireAdmin(request);
  if (authorization.response) return authorization.response;

  return NextResponse.json(
    { success: false, error: "Penghapusan promo belum tersedia." },
    { status: 405, headers: { Allow: "GET, PUT, PATCH" } },
  );
}
