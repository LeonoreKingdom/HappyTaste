import { menuCategories as frontendCategories, mockMenus } from "@/data/mock-menu";
import { db } from "./index";
import { menuCategories, menus } from "./schema";

const categoryIds = {
  "Makanan Utama": "makanan-utama",
  Camilan: "camilan",
  Minuman: "minuman",
} as const;

const categoryRows = frontendCategories.map((name) => ({
  id: categoryIds[name],
  name,
}));

const menuRows = mockMenus.map((menu) => ({
  id: menu.id,
  name: menu.name,
  description: menu.description,
  price: menu.price,
  categoryId: categoryIds[menu.category],
  imageUrl: menu.image,
  ingredients: menu.ingredients,
  portion: menu.portion,
}));

db.transaction((tx) => {
  tx.insert(menuCategories).values(categoryRows).onConflictDoNothing().run();
  tx.insert(menus).values(menuRows).onConflictDoNothing().run();
});

console.log(
  `Menu seed siap: ${categoryRows.length} kategori, ${menuRows.length} menu.`,
);
