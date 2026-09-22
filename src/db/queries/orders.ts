import { randomUUID } from "node:crypto";

import { inArray } from "drizzle-orm";

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

export class OrderValidationError extends Error {}

export async function createDineInOrder(input: CreateDineInOrderInput) {
  const table = await findRestaurantTableById(input.tableId, input.outletId);
  if (!table) {
    throw new OrderValidationError("Meja tidak ditemukan untuk outlet ini.");
  }

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

  db.transaction((tx) => {
    tx.insert(orders)
      .values({
        id: orderId,
        outletId: input.outletId,
        tableId: input.tableId,
        orderType: "dine_in",
        status: "pending",
        paymentMethod: input.paymentMethod,
        total,
        notes: input.notes ?? null,
      })
      .run();
    tx.insert(orderItems).values(itemRows).run();
  });

  return {
    id: orderId,
    outletId: input.outletId,
    tableId: input.tableId,
    orderType: "dine_in" as const,
    status: "pending" as const,
    paymentMethod: input.paymentMethod,
    total,
    itemCount: itemRows.reduce((sum, item) => sum + item.quantity, 0),
    table,
  };
}
