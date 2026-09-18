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
