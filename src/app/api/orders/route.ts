import { NextRequest, NextResponse } from "next/server";

import {
  createDineInOrder,
  OrderValidationError,
} from "@/db/queries/orders";
import { orderPaymentMethods } from "@/db/schema";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const paymentMethodSet = new Set<string>(orderPaymentMethods);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function readRequiredString(
  value: unknown,
  field: string,
  maxLength = 120,
): string {
  if (typeof value !== "string") {
    throw new OrderValidationError(`${field} wajib berupa teks.`);
  }

  const normalized = value.trim();
  if (!normalized || normalized.length > maxLength) {
    throw new OrderValidationError(`${field} wajib diisi dengan benar.`);
  }

  return normalized;
}

function readOptionalString(
  value: unknown,
  field: string,
  maxLength: number,
): string | undefined {
  if (value === undefined || value === null) return undefined;
  if (typeof value !== "string" || value.trim().length > maxLength) {
    throw new OrderValidationError(`${field} tidak valid.`);
  }
  return value.trim() || undefined;
}

function parseCreateOrderBody(body: unknown) {
  if (!isRecord(body)) {
    throw new OrderValidationError("Body pesanan tidak valid.");
  }

  const orderType = readRequiredString(body.orderType, "orderType", 20);
  if (orderType === "advance") {
    throw new OrderValidationError("Pesan lebih dulu membutuhkan login member.");
  }
  if (orderType !== "dine_in") {
    throw new OrderValidationError("Jenis pesanan tidak didukung.");
  }

  const paymentMethod = readRequiredString(body.paymentMethod, "paymentMethod", 20);
  if (!paymentMethodSet.has(paymentMethod)) {
    throw new OrderValidationError("Metode pembayaran tidak didukung.");
  }

  if (!Array.isArray(body.items) || body.items.length === 0 || body.items.length > 50) {
    throw new OrderValidationError("Pesanan harus memiliki 1–50 item.");
  }

  const menuIds = new Set<string>();
  const items = body.items.map((value, index) => {
    if (!isRecord(value)) {
      throw new OrderValidationError(`Item pesanan ke-${index + 1} tidak valid.`);
    }

    const menuId = readRequiredString(value.menuId, `menuId item ke-${index + 1}`, 120);
    if (menuIds.has(menuId)) {
      throw new OrderValidationError("Menu yang sama hanya boleh muncul sekali.");
    }
    menuIds.add(menuId);

    if (
      typeof value.quantity !== "number" ||
      !Number.isSafeInteger(value.quantity) ||
      value.quantity < 1 ||
      value.quantity > 99
    ) {
      throw new OrderValidationError(`Jumlah item ke-${index + 1} tidak valid.`);
    }

    return {
      menuId,
      quantity: value.quantity,
      notes: readOptionalString(value.notes, `Catatan item ke-${index + 1}`, 300),
    };
  });

  return {
    outletId: readRequiredString(body.outletId, "outletId"),
    tableId: readRequiredString(body.tableId, "tableId"),
    paymentMethod: paymentMethod as (typeof orderPaymentMethods)[number],
    items,
    notes: readOptionalString(body.notes, "Catatan pesanan", 500),
  };
}

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, error: "Body JSON tidak valid." },
      { status: 400 },
    );
  }

  try {
    const input = parseCreateOrderBody(body);
    const order = await createDineInOrder(input);

    return NextResponse.json({ success: true, data: order }, { status: 201 });
  } catch (error) {
    if (error instanceof OrderValidationError) {
      const status = error.message.includes("login member") ? 401 : 400;
      return NextResponse.json(
        { success: false, error: error.message },
        { status },
      );
    }

    console.error("Error creating order:", error);
    return NextResponse.json(
      { success: false, error: "Pesanan tidak dapat dikirim ke dapur." },
      { status: 500 },
    );
  }
}
