import { relations, sql } from "drizzle-orm";
import {
  check,
  index,
  integer,
  sqliteTable,
  text,
} from "drizzle-orm/sqlite-core";

import { user as authUser } from "./auth";

export const reservationStatuses = [
  "pending",
  "confirmed",
  "cancelled",
  "completed",
] as const;

export const reservations = sqliteTable(
  "reservations",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => authUser.id, { onDelete: "cascade" }),
    // Outlet and table type IDs remain opaque until their catalogs are introduced.
    outletId: text("outlet_id").notNull(),
    tableTypeId: text("table_type_id").notNull(),
    arrivalDate: text("arrival_date").notNull(),
    arrivalTime: text("arrival_time").notNull(),
    guestCount: integer("guest_count").notNull(),
    status: text("status", { enum: reservationStatuses })
      .notNull()
      .default("pending"),
    notes: text("notes"),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
    updatedAt: integer("updated_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (table) => [
    index("reservations_user_id_idx").on(table.userId),
    index("reservations_outlet_schedule_idx").on(
      table.outletId,
      table.arrivalDate,
      table.arrivalTime,
    ),
    index("reservations_status_idx").on(table.status),
    check("reservations_guest_count_positive", sql`${table.guestCount} > 0`),
    check("reservations_guest_count_reasonable", sql`${table.guestCount} <= 20`),
    check(
      "reservations_status_valid",
      sql`${table.status} in ('pending', 'confirmed', 'cancelled', 'completed')`,
    ),
  ],
);

export const reservationsRelations = relations(reservations, ({ one }) => ({
  member: one(authUser, {
    fields: [reservations.userId],
    references: [authUser.id],
  }),
}));

export type Reservation = typeof reservations.$inferSelect;
export type NewReservation = typeof reservations.$inferInsert;
