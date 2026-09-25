import { NextResponse } from "next/server";

import { updateAdminMenu } from "@/db/services/admin-menus";
import { requireAdmin } from "@/lib/auth-session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type MenuRouteContext = {
  params: Promise<{ id: string }>;
};

export async function PUT(request: Request, { params }: MenuRouteContext) {
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
    const result = await updateAdminMenu(id, body);
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: result.status },
      );
    }

    return NextResponse.json({ success: true, data: { id: result.id } });
  } catch (error) {
    console.error("Failed to update admin menu", error);
    return NextResponse.json(
      { success: false, error: "Menu tidak dapat diperbarui saat ini." },
      { status: 500 },
    );
  }
}
