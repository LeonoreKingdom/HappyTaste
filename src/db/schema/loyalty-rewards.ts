import { sql } from "drizzle-orm";
import {
  check,
  index,
  integer,
  sqliteTable,
  text,
} from "drizzle-orm/sqlite-core";

export const loyaltyRewards = sqliteTable(
  "loyalty_rewards",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    description: text("description").notNull(),
    pointsRequired: integer("points_required").notNull(),
    isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .notNull()
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .notNull()
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("loyalty_rewards_active_cost_idx").on(table.isActive, table.pointsRequired),
    check("loyalty_rewards_name_nonempty", sql`length(trim(${table.name})) > 0`),
    check(
      "loyalty_rewards_description_nonempty",
      sql`length(trim(${table.description})) > 0`,
    ),
    check("loyalty_rewards_points_positive", sql`${table.pointsRequired} > 0`),
    check("loyalty_rewards_active_boolean", sql`${table.isActive} in (0, 1)`),
  ],
);

export type LoyaltyReward = typeof loyaltyRewards.$inferSelect;
export type NewLoyaltyReward = typeof loyaltyRewards.$inferInsert;
