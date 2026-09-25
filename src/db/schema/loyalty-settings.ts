import { relations, sql } from "drizzle-orm";
import { check, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

import { user as authUser } from "./auth";

export const loyaltySettings = sqliteTable(
  "loyalty_settings",
  {
    id: text("id").primaryKey(),
    idrPerPoint: integer("idr_per_point").notNull().default(1_000),
    updatedByUserId: text("updated_by_user_id").references(() => authUser.id, {
      onDelete: "set null",
    }),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .notNull()
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .$onUpdate(() => new Date()),
  },
  (table) => [
    check("loyalty_settings_default_id", sql`${table.id} = 'default'`),
    check("loyalty_settings_rate_positive", sql`${table.idrPerPoint} > 0`),
  ],
);

export const loyaltyEarningRuleChanges = sqliteTable(
  "loyalty_earning_rule_changes",
  {
    id: text("id").primaryKey(),
    previousIdrPerPoint: integer("previous_idr_per_point").notNull(),
    newIdrPerPoint: integer("new_idr_per_point").notNull(),
    changedByUserId: text("changed_by_user_id").references(() => authUser.id, {
      onDelete: "set null",
    }),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .notNull()
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`),
  },
  (table) => [
    check("loyalty_rule_previous_rate_positive", sql`${table.previousIdrPerPoint} > 0`),
    check("loyalty_rule_new_rate_positive", sql`${table.newIdrPerPoint} > 0`),
    check(
      "loyalty_rule_rate_changed",
      sql`${table.previousIdrPerPoint} <> ${table.newIdrPerPoint}`,
    ),
  ],
);

export const loyaltySettingsRelations = relations(loyaltySettings, ({ one }) => ({
  updatedBy: one(authUser, {
    fields: [loyaltySettings.updatedByUserId],
    references: [authUser.id],
  }),
}));

export const loyaltyEarningRuleChangesRelations = relations(
  loyaltyEarningRuleChanges,
  ({ one }) => ({
    changedBy: one(authUser, {
      fields: [loyaltyEarningRuleChanges.changedByUserId],
      references: [authUser.id],
    }),
  }),
);

export type LoyaltySettings = typeof loyaltySettings.$inferSelect;
export type NewLoyaltySettings = typeof loyaltySettings.$inferInsert;
export type LoyaltyEarningRuleChange = typeof loyaltyEarningRuleChanges.$inferSelect;
