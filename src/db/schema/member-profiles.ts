import { relations, sql } from "drizzle-orm";
import { check, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

import { user as authUser } from "./auth";

export const memberProfiles = sqliteTable(
  "member_profiles",
  {
    userId: text("user_id")
      .primaryKey()
      .references(() => authUser.id, { onDelete: "cascade" }),
    phone: text("phone"),
    pointsBalance: integer("points_balance").notNull().default(0),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .notNull()
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .notNull()
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .$onUpdate(() => new Date()),
  },
  (table) => [
    check(
      "member_profiles_points_balance_nonnegative",
      sql`${table.pointsBalance} >= 0`,
    ),
  ],
);

export const memberProfilesRelations = relations(memberProfiles, ({ one }) => ({
  user: one(authUser, {
    fields: [memberProfiles.userId],
    references: [authUser.id],
  }),
}));

export type MemberProfile = typeof memberProfiles.$inferSelect;
export type NewMemberProfile = typeof memberProfiles.$inferInsert;
