import { sql } from "drizzle-orm";
import {
  check,
  index,
  integer,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";

export const restaurantTableTypes = ["regular", "vip"] as const;
export const restaurantTableStatuses = ["available", "occupied"] as const;

export const restaurantTables = sqliteTable(
  "restaurant_tables",
  {
    id: text("id").primaryKey(),
    // Outlet IDs remain opaque until the outlets table is introduced.
    outletId: text("outlet_id").notNull(),
    tableNumber: text("table_number").notNull(),
    capacity: integer("capacity").notNull(),
    type: text("type", { enum: restaurantTableTypes }).notNull(),
    qrCode: text("qr_code").notNull(),
    status: text("status", { enum: restaurantTableStatuses })
      .notNull()
      .default("available"),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (table) => [
    uniqueIndex("restaurant_tables_qr_code_unique").on(table.qrCode),
    uniqueIndex("restaurant_tables_outlet_table_number_unique").on(
      table.outletId,
      table.tableNumber,
    ),
    index("restaurant_tables_outlet_id_idx").on(table.outletId),
    index("restaurant_tables_status_idx").on(table.status),
    check("restaurant_tables_capacity_positive", sql`${table.capacity} > 0`),
    check(
      "restaurant_tables_type_valid",
      sql`${table.type} in ('regular', 'vip')`,
    ),
    check(
      "restaurant_tables_status_valid",
      sql`${table.status} in ('available', 'occupied')`,
    ),
  ],
);

export type RestaurantTable = typeof restaurantTables.$inferSelect;
export type NewRestaurantTable = typeof restaurantTables.$inferInsert;
