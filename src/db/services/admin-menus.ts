import "server-only";

import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";

import { db } from "@/db";
import { menuCategories, menus } from "@/db/schema";

type AdminMenuInput = {
  name: string;
  description: string;
  price: number;
  categoryId: string;
  imageUrl: string;
  ingredients: string[];
  portion: string;
  isAvailable?: boolean;
};

type InputValidation =
  | { success: true; data: AdminMenuInput }
  | { success: false; error: string };

type AdminMenuWriteResult =
  | { success: true; id: string }
  | { success: false; status: 400 | 404 | 422; error: string };

function validateAdminMenuInput(value: unknown): InputValidation {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return { success: false, error: "Data menu tidak valid." };
  }

  const body = value as Record<string, unknown>;
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const description = typeof body.description === "string" ? body.description.trim() : "";
  const categoryId = typeof body.categoryId === "string" ? body.categoryId.trim() : "";
  const imageUrl = typeof body.imageUrl === "string" ? body.imageUrl.trim() : "";
  const portion = typeof body.portion === "string" ? body.portion.trim() : "";
  const ingredients = Array.isArray(body.ingredients)
    ? body.ingredients.map((ingredient) => typeof ingredient === "string" ? ingredient.trim() : "")
    : [];
  const price = body.price;
  const isAvailable = body.isAvailable;

  if (!name || name.length > 120) {
    return { success: false, error: "Nama menu wajib diisi dan maksimal 120 karakter." };
  }
  if (!description || description.length > 1000) {
    return { success: false, error: "Deskripsi wajib diisi dan maksimal 1.000 karakter." };
  }
  if (typeof price !== "number" || !Number.isSafeInteger(price) || price <= 0) {
    return { success: false, error: "Harga harus berupa bilangan bulat positif." };
  }
  if (!categoryId || categoryId.length > 120) {
    return { success: false, error: "Kategori menu wajib dipilih." };
  }
  if (!imageUrl || imageUrl.length > 2048) {
    return { success: false, error: "URL gambar wajib diisi dan maksimal 2.048 karakter." };
  }
  if (!portion || portion.length > 80) {
    return { success: false, error: "Informasi porsi wajib diisi dan maksimal 80 karakter." };
  }
  if (
    ingredients.length === 0 ||
    ingredients.length > 20 ||
    ingredients.some((ingredient) => !ingredient || ingredient.length > 100)
  ) {
    return { success: false, error: "Isi 1–20 bahan, masing-masing maksimal 100 karakter." };
  }
  if (isAvailable !== undefined && typeof isAvailable !== "boolean") {
    return { success: false, error: "Status ketersediaan harus berupa boolean." };
  }

  const isLocalAsset = imageUrl.startsWith("/") && !imageUrl.startsWith("//") && !imageUrl.includes("\\");
  if (!isLocalAsset) {
    try {
      const parsedUrl = new URL(imageUrl);
      if (
        parsedUrl.protocol !== "https:" ||
        parsedUrl.hostname !== "images.unsplash.com" ||
        parsedUrl.username ||
        parsedUrl.password
      ) {
        return { success: false, error: "Gunakan HTTPS images.unsplash.com atau path gambar lokal." };
      }
    } catch {
      return { success: false, error: "Gunakan HTTPS images.unsplash.com atau path gambar lokal." };
    }
  }

  return {
    success: true,
    data: {
      name,
      description,
      price,
      categoryId,
      imageUrl,
      ingredients,
      portion,
      ...(typeof isAvailable === "boolean" ? { isAvailable } : {}),
    },
  };
}

async function categoryExists(categoryId: string) {
  const [category] = await db
    .select({ id: menuCategories.id })
    .from(menuCategories)
    .where(eq(menuCategories.id, categoryId))
    .limit(1);

  return Boolean(category);
}

export async function createAdminMenu(value: unknown): Promise<AdminMenuWriteResult> {
  const validation = validateAdminMenuInput(value);
  if (!validation.success) {
    return { success: false, status: 400, error: validation.error };
  }

  if (!(await categoryExists(validation.data.categoryId))) {
    return { success: false, status: 422, error: "Kategori yang dipilih tidak ditemukan." };
  }

  const id = randomUUID();
  await db.insert(menus).values({ id, ...validation.data });

  return { success: true, id };
}

export async function updateAdminMenu(
  id: string,
  value: unknown,
): Promise<AdminMenuWriteResult> {
  const [existingMenu] = await db
    .select({ id: menus.id })
    .from(menus)
    .where(eq(menus.id, id))
    .limit(1);
  if (!existingMenu) {
    return { success: false, status: 404, error: "Menu tidak ditemukan." };
  }

  const validation = validateAdminMenuInput(value);
  if (!validation.success) {
    return { success: false, status: 400, error: validation.error };
  }

  if (!(await categoryExists(validation.data.categoryId))) {
    return { success: false, status: 422, error: "Kategori yang dipilih tidak ditemukan." };
  }

  const [updatedMenu] = await db
    .update(menus)
    .set(validation.data)
    .where(eq(menus.id, id))
    .returning({ id: menus.id });

  return updatedMenu
    ? { success: true, id: updatedMenu.id }
    : { success: false, status: 404, error: "Menu tidak ditemukan." };
}
