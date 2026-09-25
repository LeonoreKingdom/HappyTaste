import { relations, sql } from "drizzle-orm";
import {
  index,
  integer,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";

export const menuCategories = sqliteTable(
  "menu_categories",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (table) => [uniqueIndex("menu_categories_name_unique").on(table.name)],
);

export const menus = sqliteTable(
  "menus",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    description: text("description").notNull(),
    price: integer("price").notNull(),
    isAvailable: integer("is_available", { mode: "boolean" }).notNull().default(true),
    categoryId: text("category_id")
      .notNull()
      .references(() => menuCategories.id, { onDelete: "restrict" }),
    imageUrl: text("image_url").notNull(),
    ingredients: text("ingredients", { mode: "json" })
      .$type<string[]>()
      .notNull(),
    portion: text("portion").notNull(),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (table) => [index("menus_category_id_idx").on(table.categoryId)],
);

export const menuCategoriesRelations = relations(
  menuCategories,
  ({ many }) => ({
    menus: many(menus),
  }),
);

export const menusRelations = relations(menus, ({ one }) => ({
  category: one(menuCategories, {
    fields: [menus.categoryId],
    references: [menuCategories.id],
  }),
}));

export type MenuCategory = typeof menuCategories.$inferSelect;
export type NewMenuCategory = typeof menuCategories.$inferInsert;
export type Menu = typeof menus.$inferSelect;
export type NewMenu = typeof menus.$inferInsert;
