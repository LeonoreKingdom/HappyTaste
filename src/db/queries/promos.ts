import { db } from "@/db";
import { promos, banners } from "@/db/schema";
import { and, eq, gte, lte, desc } from "drizzle-orm";

export interface GetPromosOptions {
  type?: string;
  withBanners?: boolean;
}

/**
 * Mengambil daftar promo yang berstatus aktif dan dalam masa berlaku
 */
export async function getActivePromos(options?: GetPromosOptions) {
  const now = new Date();

  if (options?.withBanners) {
    const conditions = [
      eq(promos.isActive, true),
      lte(promos.startDate, now),
      gte(promos.endDate, now),
    ];

    if (options.type) {
      conditions.push(eq(promos.type, options.type));
    }

    return await db.query.promos.findMany({
      where: and(...conditions),
      orderBy: [desc(promos.createdAt)],
      with: {
        banners: {
          where: eq(banners.isActive, true),
          orderBy: [banners.sortOrder],
        },
      },
    });
  }

  const conditions = [
    eq(promos.isActive, true),
    lte(promos.startDate, now),
    gte(promos.endDate, now),
  ];

  if (options?.type) {
    conditions.push(eq(promos.type, options.type));
  }

  return await db
    .select()
    .from(promos)
    .where(and(...conditions))
    .orderBy(desc(promos.createdAt));
}

/**
 * Mengambil seluruh promo (aktif maupun tidak aktif)
 */
export async function getAllPromos(options?: GetPromosOptions) {
  if (options?.withBanners) {
    return await db.query.promos.findMany({
      where: options.type ? eq(promos.type, options.type) : undefined,
      orderBy: [desc(promos.createdAt)],
      with: {
        banners: {
          orderBy: [banners.sortOrder],
        },
      },
    });
  }

  if (options?.type) {
    return await db
      .select()
      .from(promos)
      .where(eq(promos.type, options.type))
      .orderBy(desc(promos.createdAt));
  }

  return await db
    .select()
    .from(promos)
    .orderBy(desc(promos.createdAt));
}

/**
 * Mengambil detail satu promo berdasarkan ID
 */
export async function getPromoById(
  id: string,
  options?: { withBanners?: boolean }
) {
  if (options?.withBanners) {
    const promo = await db.query.promos.findFirst({
      where: eq(promos.id, id),
      with: {
        banners: {
          orderBy: [banners.sortOrder],
        },
      },
    });
    return promo || null;
  }

  const result = await db
    .select()
    .from(promos)
    .where(eq(promos.id, id))
    .limit(1);

  return result[0] || null;
}

/**
 * Mengambil satu promo aktif utama yang ditampilkan pada pop up promo beranda
 */
export async function getActivePopupPromo() {
  const now = new Date();

  const promo = await db.query.promos.findFirst({
    where: and(
      eq(promos.isActive, true),
      lte(promos.startDate, now),
      gte(promos.endDate, now)
    ),
    orderBy: [desc(promos.value), desc(promos.createdAt)],
    with: {
      banners: {
        where: eq(banners.isActive, true),
        orderBy: [banners.sortOrder],
      },
    },
  });

  return promo || null;
}

export interface CreatePromoInput {
  id?: string;
  title: string;
  description: string;
  type: string;
  value?: number;
  terms: string;
  startDate: Date | string;
  endDate: Date | string;
  isActive?: boolean;
}

export interface UpdatePromoInput {
  title?: string;
  description?: string;
  type?: string;
  value?: number;
  terms?: string;
  startDate?: Date | string;
  endDate?: Date | string;
  isActive?: boolean;
}

/**
 * Menambahkan promo baru ke database
 */
export async function createPromo(input: CreatePromoInput) {
  const id = input.id || crypto.randomUUID();
  const startDate =
    typeof input.startDate === "string"
      ? new Date(input.startDate)
      : input.startDate;
  const endDate =
    typeof input.endDate === "string"
      ? new Date(input.endDate)
      : input.endDate;

  const inserted = await db
    .insert(promos)
    .values({
      id,
      title: input.title,
      description: input.description,
      type: input.type,
      value: input.value ?? 0,
      terms: input.terms,
      startDate,
      endDate,
      isActive: input.isActive ?? true,
    })
    .returning();

  return inserted[0];
}

/**
 * Memperbarui data promo berdasarkan ID
 */
export async function updatePromo(id: string, input: UpdatePromoInput) {
  const updateData: Partial<typeof promos.$inferInsert> = {};

  if (input.title !== undefined) updateData.title = input.title;
  if (input.description !== undefined)
    updateData.description = input.description;
  if (input.type !== undefined) updateData.type = input.type;
  if (input.value !== undefined) updateData.value = input.value;
  if (input.terms !== undefined) updateData.terms = input.terms;
  if (input.startDate !== undefined) {
    updateData.startDate =
      typeof input.startDate === "string"
        ? new Date(input.startDate)
        : input.startDate;
  }
  if (input.endDate !== undefined) {
    updateData.endDate =
      typeof input.endDate === "string"
        ? new Date(input.endDate)
        : input.endDate;
  }
  if (input.isActive !== undefined) updateData.isActive = input.isActive;

  const updated = await db
    .update(promos)
    .set(updateData)
    .where(eq(promos.id, id))
    .returning();

  return updated[0] || null;
}

/**
 * Menghapus promo berdasarkan ID
 */
export async function deletePromo(id: string) {
  const deleted = await db
    .delete(promos)
    .where(eq(promos.id, id))
    .returning();

  return deleted[0] || null;
}
