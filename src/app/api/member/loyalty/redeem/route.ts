import { NextRequest, NextResponse } from "next/server";

import { redeemLoyaltyReward } from "@/db/queries/loyalty";
import { requireMember } from "@/lib/auth-session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const privateResponseHeaders = { "Cache-Control": "private, no-store" };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export async function POST(request: NextRequest) {
  const session = await requireMember(request);
  if (!session) {
    return NextResponse.json(
      { success: false, error: "Login member diperlukan untuk menukar poin." },
      { status: 401, headers: privateResponseHeaders },
    );
  }

  if (session.user.role !== "user") {
    return NextResponse.json(
      { success: false, error: "Penukaran poin hanya tersedia untuk akun member." },
      { status: 403, headers: privateResponseHeaders },
    );
  }

  const idempotencyKey = request.headers.get("Idempotency-Key")?.trim();
  if (
    !idempotencyKey ||
    idempotencyKey.length > 120 ||
    !/^[\x21-\x7E]+$/.test(idempotencyKey)
  ) {
    return NextResponse.json(
      { success: false, error: "Header Idempotency-Key wajib berupa teks ASCII 1–120 karakter." },
      { status: 400, headers: privateResponseHeaders },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, error: "Body JSON tidak valid." },
      { status: 400, headers: privateResponseHeaders },
    );
  }

  if (
    !isRecord(body) ||
    Object.keys(body).length !== 1 ||
    typeof body.rewardId !== "string"
  ) {
    return NextResponse.json(
      { success: false, error: "Body penukaran hanya menerima rewardId." },
      { status: 400, headers: privateResponseHeaders },
    );
  }

  const rewardId = body.rewardId.trim();
  if (!rewardId || rewardId.length > 120) {
    return NextResponse.json(
      { success: false, error: "rewardId tidak valid." },
      { status: 400, headers: privateResponseHeaders },
    );
  }

  try {
    const result = redeemLoyaltyReward(
      session.user.id,
      rewardId,
      idempotencyKey,
    );

    if (result.status === "skipped") {
      if (result.reason === "invalid_request") {
        return NextResponse.json(
          { success: false, error: "Permintaan penukaran tidak valid." },
          { status: 400, headers: privateResponseHeaders },
        );
      }

      if (result.reason === "reward_not_available") {
        return NextResponse.json(
          { success: false, error: "Hadiah tidak tersedia." },
          { status: 404, headers: privateResponseHeaders },
        );
      }

      if (result.reason === "insufficient_balance") {
        return NextResponse.json(
          { success: false, error: "Saldo poin tidak mencukupi untuk hadiah ini." },
          { status: 409, headers: privateResponseHeaders },
        );
      }

      return NextResponse.json(
        { success: false, error: "Profil member belum tersedia." },
        { status: 409, headers: privateResponseHeaders },
      );
    }

    return NextResponse.json(
      { success: true, data: result },
      {
        status: result.status === "redeemed" ? 201 : 200,
        headers: privateResponseHeaders,
      },
    );
  } catch (error) {
    console.error("Error redeeming loyalty reward:", error);
    return NextResponse.json(
      { success: false, error: "Hadiah tidak dapat ditukar." },
      { status: 500, headers: privateResponseHeaders },
    );
  }
}
