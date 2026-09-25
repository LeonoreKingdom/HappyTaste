import { relations, sql } from "drizzle-orm";
import {
  check,
  index,
  integer,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";

import { memberProfiles } from "./member-profiles";

export const loyaltyTransactionTypes = [
  "earn",
  "redeem",
  "adjustment",
  "expire",
] as const;

export const loyaltyTransactions = sqliteTable(
  "loyalty_transactions",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => memberProfiles.userId, { onDelete: "cascade" }),
    type: text("type", { enum: loyaltyTransactionTypes }).notNull(),
    pointsDelta: integer("points_delta").notNull(),
    balanceAfter: integer("balance_after").notNull(),
    description: text("description").notNull(),
    referenceType: text("reference_type"),
    referenceId: text("reference_id"),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .notNull()
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`),
  },
  (table) => [
    index("loyalty_transactions_user_created_at_idx").on(
      table.userId,
      table.createdAt,
    ),
    uniqueIndex("loyalty_transactions_reference_unique")
      .on(table.userId, table.referenceType, table.referenceId, table.type)
      .where(sql`${table.referenceType} is not null and ${table.referenceId} is not null`),
    check(
      "loyalty_transactions_type_valid",
      sql`${table.type} in ('earn', 'redeem', 'adjustment', 'expire')`,
    ),
    check(
      "loyalty_transactions_delta_nonzero",
      sql`${table.pointsDelta} <> 0`,
    ),
    check(
      "loyalty_transactions_delta_matches_type",
      sql`(${table.type} = 'earn' and ${table.pointsDelta} > 0) or (${table.type} in ('redeem', 'expire') and ${table.pointsDelta} < 0) or ${table.type} = 'adjustment'`,
    ),
    check(
      "loyalty_transactions_balance_nonnegative",
      sql`${table.balanceAfter} >= 0`,
    ),
    check(
      "loyalty_transactions_reference_pair_valid",
      sql`(${table.referenceType} is null and ${table.referenceId} is null) or (${table.referenceType} is not null and ${table.referenceId} is not null)`,
    ),
  ],
);

export const loyaltyTransactionsRelations = relations(
  loyaltyTransactions,
  ({ one }) => ({
    memberProfile: one(memberProfiles, {
      fields: [loyaltyTransactions.userId],
      references: [memberProfiles.userId],
    }),
  }),
);

export type LoyaltyTransaction = typeof loyaltyTransactions.$inferSelect;
export type NewLoyaltyTransaction = typeof loyaltyTransactions.$inferInsert;
