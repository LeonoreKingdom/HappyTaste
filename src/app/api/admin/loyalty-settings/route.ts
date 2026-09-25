import { NextResponse } from "next/server";

import {
  getAdminLoyaltyRuleChanges,
  getAdminLoyaltySettings,
} from "@/db/queries/admin-members";
import { updateAdminLoyaltyEarningRule } from "@/db/services/admin-loyalty";
import { requireAdmin } from "@/lib/auth-session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const authorization = await requireAdmin(request);
  if (authorization.response) return authorization.response;

  try {
    const [settings, ruleChanges] = await Promise.all([
      getAdminLoyaltySettings(),
      getAdminLoyaltyRuleChanges(),
    ]);

    return NextResponse.json({
      success: true,
      data: { settings, ruleChanges },
    });
  } catch (error) {
    console.error("Failed to load admin loyalty earning rule", error);
    return NextResponse.json(
      { success: false, error: "Aturan poin tidak dapat dimuat saat ini." },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request) {
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
    const result = updateAdminLoyaltyEarningRule(authorization.session.user.id, body);
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: result.status },
      );
    }

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error("Failed to update admin loyalty earning rule", error);
    return NextResponse.json(
      { success: false, error: "Aturan poin tidak dapat disimpan saat ini." },
      { status: 500 },
    );
  }
}
