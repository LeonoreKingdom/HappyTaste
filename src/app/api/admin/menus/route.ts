import { NextResponse } from "next/server";

import { createAdminMenu } from "@/db/services/admin-menus";
import { requireAdmin } from "@/lib/auth-session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const authorization = await requireAdmin(request);
  if (authorization.response) return authorization.response;

  try {
    const { getMenuList } = await import("@/db/queries/menus");
    const data = await getMenuList();
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Failed to list admin menus", error);
    return NextResponse.json(
      { success: false, error: "Daftar menu tidak dapat dimuat saat ini." },
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
    const result = await createAdminMenu(body);
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: result.status },
      );
    }

    return NextResponse.json({ success: true, data: { id: result.id } }, { status: 201 });
  } catch (error) {
    console.error("Failed to create admin menu", error);
    return NextResponse.json(
      { success: false, error: "Menu tidak dapat disimpan saat ini." },
      { status: 500 },
    );
  }
}
