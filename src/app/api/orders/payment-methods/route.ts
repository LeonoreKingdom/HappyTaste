import { NextResponse } from "next/server";

import { orderPaymentMethodOptions } from "@/db/queries/orders";

export const dynamic = "force-static";

export function GET() {
  return NextResponse.json({
    success: true,
    data: orderPaymentMethodOptions,
  });
}
