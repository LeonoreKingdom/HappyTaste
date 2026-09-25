import "server-only";

import { and, asc, eq, like, or } from "drizzle-orm";

import { db } from "@/db";
import { menuCategories, menus } from "@/db/schema";

export type MenuListItem = {
  id: string;
  name: string;
  description: string;
  price: number;
  category: {
    id: string;
    name: string;
  };
  imageUrl: string;
  ingredients: string[];
  portion: string;
};

export async function getMenuList({ category, keyword }: {
  category?: string | null;
  keyword?: string | null;
} = {}): Promise<MenuListItem[]> {
  const categoryFilter = category?.trim();
  const keywordFilter = keyword?.trim();
  const filters = [
    categoryFilter
      ? or(
          eq(menuCategories.id, categoryFilter),
          eq(menuCategories.name, categoryFilter),
        )
      : undefined,
    keywordFilter
      ? or(
          like(menus.name, `%${keywordFilter}%`),
          like(menus.description, `%${keywordFilter}%`),
          like(menuCategories.name, `%${keywordFilter}%`),
        )
      : undefined,
  ].filter((filter): filter is NonNullable<typeof filter> => filter !== undefined);

  const rows = await db
    .select({
      id: menus.id,
      name: menus.name,
      description: menus.description,
      price: menus.price,
      categoryId: menuCategories.id,
      categoryName: menuCategories.name,
      imageUrl: menus.imageUrl,
      ingredients: menus.ingredients,
      portion: menus.portion,
    })
    .from(menus)
    .innerJoin(menuCategories, eq(menus.categoryId, menuCategories.id))
    .where(filters.length > 0 ? and(...filters) : undefined)
    .orderBy(asc(menuCategories.name), asc(menus.name));

  return rows.map((menu) => ({
    id: menu.id,
    name: menu.name,
    description: menu.description,
    price: menu.price,
    category: {
      id: menu.categoryId,
      name: menu.categoryName,
    },
    imageUrl: menu.imageUrl,
    ingredients: menu.ingredients,
    portion: menu.portion,
  }));
}
