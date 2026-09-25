import { eq } from "drizzle-orm";

import { menuCategories, menus } from "@/db/schema";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

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
        isAvailable: menus.isAvailable,
      })
      .from(menus)
      .innerJoin(menuCategories, eq(menus.categoryId, menuCategories.id))
      .where(eq(menus.id, id))
      .limit(1);

    const menu = rows[0];

    if (!menu) {
      return Response.json({ error: "Menu tidak ditemukan." }, { status: 404 });
    }

    return Response.json({
      data: {
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
        isAvailable: menu.isAvailable,
      },
    });
  } catch (error) {
    console.error("Failed to get menu", error);
    return Response.json(
      { error: "Menu sedang tidak dapat dimuat." },
      { status: 500 },
    );
  }
}
