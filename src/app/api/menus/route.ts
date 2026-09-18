import { asc, eq, or } from "drizzle-orm";

import { menuCategories, menus } from "@/db/schema";

export const runtime = "nodejs";

type MenuListItem = {
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

export async function GET(request: Request) {
  const categoryFilter = new URL(request.url).searchParams.get("category")?.trim();

  try {
    const { db } = await import("@/db");
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
      .where(
        categoryFilter
          ? or(
              eq(menuCategories.id, categoryFilter),
              eq(menuCategories.name, categoryFilter),
            )
          : undefined,
      )
      .orderBy(asc(menuCategories.name), asc(menus.name));

    const data: MenuListItem[] = rows.map((menu) => ({
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

    return Response.json({ data });
  } catch (error) {
    console.error("Failed to list menus", error);
    return Response.json(
      { error: "Menu sedang tidak dapat dimuat." },
      { status: 500 },
    );
  }
}
