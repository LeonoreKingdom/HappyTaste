import { NextResponse } from "next/server";

import { listPublicOutlets } from "@/db/queries/outlets";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const outlets = await listPublicOutlets();
    return NextResponse.json({ success: true, data: outlets });
  } catch (error) {
    console.error("Error listing outlets:", error);
    return NextResponse.json(
      { success: false, error: "Daftar outlet tidak dapat dimuat." },
      { status: 500 },
    );
  }
}
