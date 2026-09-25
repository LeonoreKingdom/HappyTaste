import { sql } from "drizzle-orm";
import {
  check,
  index,
  integer,
  real,
  sqliteTable,
  text,
} from "drizzle-orm/sqlite-core";

export type OutletOpeningHours = {
  daysLabel: string;
  opensAt: string;
  closesAt: string;
  timeZone: string;
};

export const outlets = sqliteTable(
  "outlets",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    address: text("address").notNull(),
    city: text("city"),
    phone: text("phone"),
    whatsapp: text("whatsapp"),
    email: text("email"),
    openingHours: text("opening_hours", { mode: "json" }).$type<OutletOpeningHours>(),
    facilities: text("facilities", { mode: "json" })
      .$type<string[]>()
      .notNull()
      .default(sql`'[]'`),
    latitude: real("latitude"),
    longitude: real("longitude"),
    isDemoLocation: integer("is_demo_location", { mode: "boolean" })
      .notNull()
      .default(false),
    isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
    updatedAt: integer("updated_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`)
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("outlets_active_name_idx").on(table.isActive, table.name),
    check(
      "outlets_coordinates_pair_valid",
      sql`(${table.latitude} is null and ${table.longitude} is null) or (${table.latitude} is not null and ${table.longitude} is not null and ${table.latitude} between -90 and 90 and ${table.longitude} between -180 and 180)`,
    ),
  ],
);

export type Outlet = typeof outlets.$inferSelect;
export type NewOutlet = typeof outlets.$inferInsert;
