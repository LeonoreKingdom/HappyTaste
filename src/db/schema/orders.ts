import { relations, sql } from "drizzle-orm";
import {
  check,
  index,
  integer,
  sqliteTable,
  text,
} from "drizzle-orm/sqlite-core";

import { menus } from "./menus";

export const orderTypes = ["dine_in", "advance"] as const;
export const orderStatuses = [
  "pending",
  "confirmed",
  "preparing",
  "ready",
  "completed",
  "cancelled",
] as const;
export const orderPaymentMethods = ["cash", "card", "qris"] as const;

export const orders = sqliteTable(
  "orders",
  {
    id: text("id").primaryKey(),
    // These IDs stay opaque until member, outlet, and table schemas are introduced.
    userId: text("user_id"),
    outletId: text("outlet_id").notNull(),
    tableId: text("table_id"),
    orderType: text("order_type", { enum: orderTypes }).notNull(),
    status: text("status", { enum: orderStatuses }).notNull().default("pending"),
    paymentMethod: text("payment_method", { enum: orderPaymentMethods }).notNull(),
    total: integer("total").notNull(),
    notes: text("notes"),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (table) => [
    index("orders_user_id_idx").on(table.userId),
    index("orders_outlet_created_at_idx").on(table.outletId, table.createdAt),
    index("orders_status_created_at_idx").on(table.status, table.createdAt),
    check("orders_total_non_negative", sql`${table.total} >= 0`),
    check(
      "orders_order_type_valid",
      sql`${table.orderType} in ('dine_in', 'advance')`,
    ),
    check(
      "orders_status_valid",
      sql`${table.status} in ('pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled')`,
    ),
    check(
      "orders_payment_method_valid",
      sql`${table.paymentMethod} in ('cash', 'card', 'qris')`,
    ),
  ],
);

export const orderItems = sqliteTable(
  "order_items",
  {
    id: text("id").primaryKey(),
    orderId: text("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    menuId: text("menu_id")
      .notNull()
      .references(() => menus.id, { onDelete: "restrict" }),
    quantity: integer("quantity").notNull(),
    // Store the purchase-time price so later menu price changes do not alter receipts.
    price: integer("price").notNull(),
    subtotal: integer("subtotal").notNull(),
    notes: text("notes"),
  },
  (table) => [
    index("order_items_order_id_idx").on(table.orderId),
    index("order_items_menu_id_idx").on(table.menuId),
    check("order_items_quantity_positive", sql`${table.quantity} > 0`),
    check("order_items_price_non_negative", sql`${table.price} >= 0`),
    check(
      "order_items_subtotal_matches_quantity_price",
      sql`${table.subtotal} = ${table.quantity} * ${table.price}`,
    ),
  ],
);

export const ordersRelations = relations(orders, ({ many }) => ({
  items: many(orderItems),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
  menu: one(menus, {
    fields: [orderItems.menuId],
    references: [menus.id],
  }),
}));

export type Order = typeof orders.$inferSelect;
export type NewOrder = typeof orders.$inferInsert;
export type OrderItem = typeof orderItems.$inferSelect;
export type NewOrderItem = typeof orderItems.$inferInsert;
