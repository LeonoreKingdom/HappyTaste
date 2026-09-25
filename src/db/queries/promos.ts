import { db } from "@/db";
import { promos, banners } from "@/db/schema";
import { and, asc, eq, gte, lte, desc } from "drizzle-orm";

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

export async function getAdminPromoOverview() {
  const [allPromos, allBanners] = await Promise.all([
    db.query.promos.findMany({
      orderBy: [desc(promos.createdAt)],
      with: {
        banners: {
          orderBy: [asc(banners.sortOrder)],
        },
      },
    }),
    db
      .select({
        id: banners.id,
        title: banners.title,
        imageUrl: banners.imageUrl,
        link: banners.link,
        sortOrder: banners.sortOrder,
        isActive: banners.isActive,
        promoId: banners.promoId,
        promoTitle: promos.title,
      })
      .from(banners)
      .leftJoin(promos, eq(banners.promoId, promos.id))
      .orderBy(asc(banners.sortOrder), asc(banners.title)),
  ]);

  return { promos: allPromos, banners: allBanners };
}

export async function getAdminBannerById(id: string) {
  const [banner] = await db
    .select()
    .from(banners)
    .where(eq(banners.id, id))
    .limit(1);

  return banner ?? null;
}

export interface GetPromoByIdOptions {
  withBanners?: boolean;
  onlyActive?: boolean;
}

/**
 * Mengambil detail satu promo berdasarkan ID
 */
export async function getPromoById(
  id: string,
  options?: GetPromoByIdOptions
) {
  const conditions = [eq(promos.id, id)];

  if (options?.onlyActive) {
    const now = new Date();
    conditions.push(
      eq(promos.isActive, true),
      lte(promos.startDate, now),
      gte(promos.endDate, now)
    );
  }

  if (options?.withBanners) {
    const promo = await db.query.promos.findFirst({
      where: and(...conditions),
      with: {
        banners: {
          where: options.onlyActive ? eq(banners.isActive, true) : undefined,
          orderBy: [banners.sortOrder],
        },
      },
    });
    return promo || null;
  }

  const result = await db
    .select()
    .from(promos)
    .where(and(...conditions))
    .limit(1);

  return result[0] || null;
}

/**
 * Mengambil detail satu promo aktif dan dalam masa berlaku (khusus public API)
 */
export async function getActivePromoById(
  id: string,
  options?: { withBanners?: boolean }
) {
  return getPromoById(id, { ...options, onlyActive: true });
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

export const VALID_PROMO_TYPES = ["discount", "free_item", "cashback"] as const;
export type PromoType = (typeof VALID_PROMO_TYPES)[number];

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
 * Validasi input data promo untuk internal service / admin
 */
export function validatePromoInput(
  input: Partial<CreatePromoInput>,
  isUpdate: boolean = false
): { valid: boolean; error?: string } {
  if (!isUpdate) {
    if (!input.title || typeof input.title !== "string" || !input.title.trim()) {
      return { valid: false, error: "Judul promo (title) wajib diisi" };
    }
    if (!input.description || typeof input.description !== "string" || !input.description.trim()) {
      return { valid: false, error: "Deskripsi promo (description) wajib diisi" };
    }
    if (!input.type || !VALID_PROMO_TYPES.includes(input.type as PromoType)) {
      return {
        valid: false,
        error: `Tipe promo tidak valid. Pilihan valid: ${VALID_PROMO_TYPES.join(", ")}`,
      };
    }
    if (
      input.value !== undefined &&
      (typeof input.value !== "number" || isNaN(input.value) || input.value < 0)
    ) {
      return { valid: false, error: "Nilai promo (value) harus berupa angka non-negatif" };
    }
    if (!input.terms || typeof input.terms !== "string" || !input.terms.trim()) {
      return { valid: false, error: "Syarat dan ketentuan promo (terms) wajib diisi" };
    }
    if (!input.startDate) {
      return { valid: false, error: "Tanggal mulai (startDate) wajib diisi" };
    }
    const start = new Date(input.startDate);
    if (isNaN(start.getTime())) {
      return { valid: false, error: "Format tanggal mulai (startDate) tidak valid" };
    }
    if (!input.endDate) {
      return { valid: false, error: "Tanggal selesai (endDate) wajib diisi" };
    }
    const end = new Date(input.endDate);
    if (isNaN(end.getTime())) {
      return { valid: false, error: "Format tanggal selesai (endDate) tidak valid" };
    }
    if (start.getTime() > end.getTime()) {
      return {
        valid: false,
        error: "Tanggal mulai tidak boleh lebih besar dari tanggal selesai (startDate <= endDate)",
      };
    }
  } else {
    if (input.title !== undefined && (typeof input.title !== "string" || !input.title.trim())) {
      return { valid: false, error: "Judul promo (title) tidak boleh kosong" };
    }
    if (
      input.type !== undefined &&
      !VALID_PROMO_TYPES.includes(input.type as PromoType)
    ) {
      return {
        valid: false,
        error: `Tipe promo tidak valid. Pilihan valid: ${VALID_PROMO_TYPES.join(", ")}`,
      };
    }
    if (
      input.value !== undefined &&
      (typeof input.value !== "number" || isNaN(input.value) || input.value < 0)
    ) {
      return { valid: false, error: "Nilai promo (value) harus berupa angka non-negatif" };
    }
    let startCheck: Date | undefined;
    let endCheck: Date | undefined;
    if (input.startDate !== undefined) {
      startCheck = new Date(input.startDate);
      if (isNaN(startCheck.getTime())) {
        return { valid: false, error: "Format tanggal mulai (startDate) tidak valid" };
      }
    }
    if (input.endDate !== undefined) {
      endCheck = new Date(input.endDate);
      if (isNaN(endCheck.getTime())) {
        return { valid: false, error: "Format tanggal selesai (endDate) tidak valid" };
      }
    }
    if (startCheck && endCheck && startCheck.getTime() > endCheck.getTime()) {
      return {
        valid: false,
        error: "Tanggal mulai tidak boleh lebih besar dari tanggal selesai (startDate <= endDate)",
      };
    }
  }

  return { valid: true };
}

/**
 * Menambahkan promo baru ke database
 */
export async function createPromo(input: CreatePromoInput) {
  const validation = validatePromoInput(input, false);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

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
      title: input.title.trim(),
      description: input.description.trim(),
      type: input.type,
      value: input.value ?? 0,
      terms: input.terms.trim(),
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
  const validation = validatePromoInput(input, true);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  if (
    (input.startDate !== undefined && input.endDate === undefined) ||
    (input.startDate === undefined && input.endDate !== undefined)
  ) {
    const existing = await getPromoById(id);
    if (existing) {
      const start =
        input.startDate !== undefined
          ? new Date(input.startDate)
          : new Date(existing.startDate);
      const end =
        input.endDate !== undefined
          ? new Date(input.endDate)
          : new Date(existing.endDate);
      if (start.getTime() > end.getTime()) {
        throw new Error(
          "Tanggal mulai tidak boleh lebih besar dari tanggal selesai (startDate <= endDate)"
        );
      }
    }
  }

  const updateData: Partial<typeof promos.$inferInsert> = {};

  if (input.title !== undefined) updateData.title = input.title.trim();
  if (input.description !== undefined)
    updateData.description = input.description.trim();
  if (input.type !== undefined) updateData.type = input.type;
  if (input.value !== undefined) updateData.value = input.value;
  if (input.terms !== undefined) updateData.terms = input.terms.trim();
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
