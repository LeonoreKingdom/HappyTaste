import { randomUUID } from "node:crypto";

import { and, asc, eq, inArray } from "drizzle-orm";

import { db } from "@/db";
import {
  menus,
  orderItems,
  orders,
  type OrderPaymentMethod,
} from "@/db/schema";
import { findRestaurantTableById } from "@/db/queries/restaurant-tables";

export type CreateDineInOrderInput = {
  outletId: string;
  tableId: string;
  paymentMethod: OrderPaymentMethod;
  items: Array<{
    menuId: string;
    quantity: number;
    notes?: string;
  }>;
  notes?: string;
};

export type CreateAdvanceOrderInput = Omit<CreateDineInOrderInput, "tableId"> & {
  userId: string;
  scheduledAt: Date;
};

export const orderPaymentMethodOptions = [
  {
    id: "cash",
    label: "Tunai di kasir",
    description: "Bayar langsung di outlet setelah pesanan siap.",
  },
  {
    id: "card",
    label: "Kartu di kasir",
    description:
      "Pilih kartu debit atau kredit saat di outlet; detail kartu tidak diminta di sini.",
  },
  {
    id: "qris",
    label: "QRIS",
    description:
      "Metode ini hanya dipilih di simulasi; tidak ada QR pembayaran yang dibuat.",
  },
] as const satisfies ReadonlyArray<{
  id: OrderPaymentMethod;
  label: string;
  description: string;
}>;

export class OrderValidationError extends Error {}

export async function createDineInOrder(input: CreateDineInOrderInput) {
  const table = await findRestaurantTableById(input.tableId, input.outletId);
  if (!table) {
    throw new OrderValidationError("Meja tidak ditemukan untuk outlet ini.");
  }

  const order = await createOrder({
    ...input,
    orderType: "dine_in",
    tableId: input.tableId,
    userId: undefined,
    scheduledAt: undefined,
  });

  return { ...order, table };
}

export async function createAdvanceOrder(input: CreateAdvanceOrderInput) {
  return createOrder({
    ...input,
    orderType: "advance",
    tableId: undefined,
    userId: input.userId,
    scheduledAt: input.scheduledAt,
  });
}

export async function findMemberOrderById(orderId: string, userId: string) {
  const [order] = await db
    .select({
      id: orders.id,
      outletId: orders.outletId,
      tableId: orders.tableId,
      orderType: orders.orderType,
      status: orders.status,
      paymentMethod: orders.paymentMethod,
      total: orders.total,
      notes: orders.notes,
      scheduledAt: orders.scheduledAt,
      createdAt: orders.createdAt,
    })
    .from(orders)
    .where(and(eq(orders.id, orderId), eq(orders.userId, userId)))
    .limit(1);

  if (!order) return null;

  const items = await db
    .select({
      id: orderItems.id,
      menuId: orderItems.menuId,
      menuName: menus.name,
      quantity: orderItems.quantity,
      price: orderItems.price,
      subtotal: orderItems.subtotal,
      notes: orderItems.notes,
    })
    .from(orderItems)
    .innerJoin(menus, eq(orderItems.menuId, menus.id))
    .where(eq(orderItems.orderId, orderId))
    .orderBy(asc(orderItems.id));

  return { ...order, items };
}

async function createOrder(input: {
  outletId: string;
  tableId: string | undefined;
  userId: string | undefined;
  orderType: "dine_in" | "advance";
  paymentMethod: OrderPaymentMethod;
  items: Array<{ menuId: string; quantity: number; notes?: string }>;
  notes?: string;
  scheduledAt: Date | undefined;
}) {
  const menuIds = input.items.map((item) => item.menuId);
  const menuRows = await db
    .select({ id: menus.id, price: menus.price })
    .from(menus)
    .where(inArray(menus.id, menuIds));
  const menusById = new Map(menuRows.map((menu) => [menu.id, menu]));

  if (menuRows.length !== menuIds.length) {
    throw new OrderValidationError("Salah satu menu tidak tersedia.");
  }

  const orderId = randomUUID();
  const itemRows = input.items.map((item) => {
    const menu = menusById.get(item.menuId);
    if (!menu) {
      throw new OrderValidationError("Salah satu menu tidak tersedia.");
    }

    return {
      id: randomUUID(),
      orderId,
      menuId: item.menuId,
      quantity: item.quantity,
      price: menu.price,
      subtotal: menu.price * item.quantity,
      notes: item.notes ?? null,
    };
  });
  const total = itemRows.reduce((sum, item) => sum + item.subtotal, 0);

  await db.transaction(async (tx) => {
    await tx.insert(orders)
      .values({
        id: orderId,
        userId: input.userId,
        outletId: input.outletId,
        tableId: input.tableId,
        orderType: input.orderType,
        status: "pending",
        paymentMethod: input.paymentMethod,
        total,
        notes: input.notes ?? null,
        scheduledAt: input.scheduledAt ?? null,
      });
    await tx.insert(orderItems).values(itemRows);
  });

  return {
    id: orderId,
    outletId: input.outletId,
    tableId: input.tableId,
    orderType: input.orderType,
    status: "pending" as const,
    paymentMethod: input.paymentMethod,
    total,
    itemCount: itemRows.reduce((sum, item) => sum + item.quantity, 0),
    scheduledAt: input.scheduledAt ?? null,
  };
}
