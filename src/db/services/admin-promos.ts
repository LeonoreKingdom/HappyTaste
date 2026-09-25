import "server-only";

import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";

import { db } from "@/db";
import { banners, promos } from "@/db/schema";

const promoTypes = ["discount", "free_item", "cashback"] as const;
type PromoType = (typeof promoTypes)[number];

type PromoInput = {
  title: string;
  description: string;
  type: PromoType;
  value: number;
  terms: string;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
};

type BannerInput = {
  title: string;
  imageUrl: string;
  link: string;
  sortOrder: number;
  isActive: boolean;
  promoId: string | null;
};

type Validation<T> =
  | { success: true; data: T }
  | { success: false; error: string };

type WriteResult =
  | { success: true; id: string }
  | { success: false; status: 400 | 404 | 422; error: string };

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function parseDate(value: unknown) {
  if (
    typeof value !== "string" ||
    !/(Z|[+-]\d{2}:\d{2})$/i.test(value)
  ) {
    return null;
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function validatePromoInput(value: unknown): Validation<PromoInput> {
  if (!isRecord(value)) return { success: false, error: "Data promo tidak valid." };

  const title = typeof value.title === "string" ? value.title.trim() : "";
  const description = typeof value.description === "string" ? value.description.trim() : "";
  const terms = typeof value.terms === "string" ? value.terms.trim() : "";
  const startDate = parseDate(value.startDate);
  const endDate = parseDate(value.endDate);

  if (!title || title.length > 120) {
    return { success: false, error: "Judul promo wajib diisi dan maksimal 120 karakter." };
  }
  if (!description || description.length > 1000) {
    return { success: false, error: "Deskripsi wajib diisi dan maksimal 1.000 karakter." };
  }
  if (typeof value.type !== "string" || !promoTypes.includes(value.type as PromoType)) {
    return { success: false, error: "Jenis promo tidak valid." };
  }
  if (typeof value.value !== "number" || !Number.isSafeInteger(value.value) || value.value < 0) {
    return { success: false, error: "Nilai promo harus bilangan bulat non-negatif." };
  }
  if (!terms || terms.length > 5000) {
    return { success: false, error: "Syarat promo wajib diisi dan maksimal 5.000 karakter." };
  }
  if (!startDate || !endDate) {
    return { success: false, error: "Tanggal promo harus memiliki zona waktu dan format yang valid." };
  }
  if (startDate > endDate) {
    return { success: false, error: "Tanggal mulai tidak boleh setelah tanggal selesai." };
  }
  if (typeof value.isActive !== "boolean") {
    return { success: false, error: "Status aktif promo tidak valid." };
  }

  return {
    success: true,
    data: {
      title,
      description,
      type: value.type as PromoType,
      value: value.value,
      terms,
      startDate,
      endDate,
      isActive: value.isActive,
    },
  };
}

function isAllowedImageUrl(imageUrl: string) {
  const isLocalAsset = imageUrl.startsWith("/") && !imageUrl.startsWith("//") && !imageUrl.includes("\\");
  if (isLocalAsset) return true;

  try {
    const parsedUrl = new URL(imageUrl);
    return parsedUrl.protocol === "https:" &&
      parsedUrl.hostname === "images.unsplash.com" &&
      !parsedUrl.username &&
      !parsedUrl.password;
  } catch {
    return false;
  }
}

function validateBannerInput(value: unknown): Validation<BannerInput> {
  if (!isRecord(value)) return { success: false, error: "Data banner tidak valid." };

  const title = typeof value.title === "string" ? value.title.trim() : "";
  const imageUrl = typeof value.imageUrl === "string" ? value.imageUrl.trim() : "";
  const link = typeof value.link === "string" ? value.link.trim() : "";
  const sortOrder = value.sortOrder;
  const isActive = value.isActive;
  const promoIdValue = value.promoId;
  const promoId = promoIdValue === undefined || promoIdValue === null
    ? null
    : typeof promoIdValue === "string"
      ? promoIdValue.trim() || null
      : promoIdValue;

  if (!title || title.length > 120) {
    return { success: false, error: "Judul banner wajib diisi dan maksimal 120 karakter." };
  }
  if (!imageUrl || imageUrl.length > 2048 || !isAllowedImageUrl(imageUrl)) {
    return { success: false, error: "Gunakan HTTPS images.unsplash.com atau path gambar lokal." };
  }
  if (
    !link || link.length > 2048 || !link.startsWith("/") ||
    link.startsWith("//") || link.includes("\\") || /[\r\n]/.test(link)
  ) {
    return { success: false, error: "Tujuan banner harus berupa path internal aplikasi." };
  }
  if (typeof sortOrder !== "number" || !Number.isSafeInteger(sortOrder) || sortOrder < 0 || sortOrder > 100000) {
    return { success: false, error: "Urutan harus bilangan bulat antara 0 dan 100.000." };
  }
  if (typeof isActive !== "boolean") {
    return { success: false, error: "Status aktif banner tidak valid." };
  }
  if (promoId !== null && (typeof promoId !== "string" || promoId.length > 120)) {
    return { success: false, error: "Promo terkait tidak valid." };
  }

  return {
    success: true,
    data: { title, imageUrl, link, sortOrder, isActive, promoId: promoId as string | null },
  };
}

async function promoExists(promoId: string) {
  const [promo] = await db
    .select({ id: promos.id })
    .from(promos)
    .where(eq(promos.id, promoId))
    .limit(1);

  return Boolean(promo);
}

export async function createAdminPromo(value: unknown): Promise<WriteResult> {
  const validation = validatePromoInput(value);
  if (!validation.success) return { success: false, status: 400, error: validation.error };

  const id = randomUUID();
  await db.insert(promos).values({ id, ...validation.data });
  return { success: true, id };
}

export async function updateAdminPromo(id: string, value: unknown): Promise<WriteResult> {
  const [existing] = await db
    .select({ id: promos.id })
    .from(promos)
    .where(eq(promos.id, id))
    .limit(1);
  if (!existing) return { success: false, status: 404, error: "Promo tidak ditemukan." };

  const validation = validatePromoInput(value);
  if (!validation.success) return { success: false, status: 400, error: validation.error };

  await db.update(promos).set(validation.data).where(eq(promos.id, id));
  return { success: true, id };
}

export async function createAdminBanner(value: unknown): Promise<WriteResult> {
  const validation = validateBannerInput(value);
  if (!validation.success) return { success: false, status: 400, error: validation.error };
  if (validation.data.promoId && !(await promoExists(validation.data.promoId))) {
    return { success: false, status: 422, error: "Promo terkait tidak ditemukan." };
  }

  const id = randomUUID();
  await db.insert(banners).values({ id, ...validation.data });
  return { success: true, id };
}

export async function updateAdminBanner(id: string, value: unknown): Promise<WriteResult> {
  const [existing] = await db
    .select({ id: banners.id })
    .from(banners)
    .where(eq(banners.id, id))
    .limit(1);
  if (!existing) return { success: false, status: 404, error: "Banner tidak ditemukan." };

  const validation = validateBannerInput(value);
  if (!validation.success) return { success: false, status: 400, error: validation.error };
  if (validation.data.promoId && !(await promoExists(validation.data.promoId))) {
    return { success: false, status: 422, error: "Promo terkait tidak ditemukan." };
  }

  await db.update(banners).set(validation.data).where(eq(banners.id, id));
  return { success: true, id };
}
