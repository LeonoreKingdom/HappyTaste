import { and, eq } from "drizzle-orm";

import { db } from "@/db";
import { restaurantTables, type RestaurantTable } from "@/db/schema";

function normalizeQrCode(value: string) {
  return value.trim().toLocaleUpperCase("id-ID");
}

export type PublicRestaurantTable = Pick<
  RestaurantTable,
  "id" | "outletId" | "tableNumber" | "capacity" | "type" | "qrCode" | "status"
>;

function toPublicRestaurantTable(table: RestaurantTable): PublicRestaurantTable {
  return {
    id: table.id,
    outletId: table.outletId,
    tableNumber: table.tableNumber,
    capacity: table.capacity,
    type: table.type,
    qrCode: table.qrCode,
    status: table.status,
  };
}

export async function findRestaurantTableByQrCode(
  value: string,
): Promise<PublicRestaurantTable | null> {
  const normalizedQrCode = normalizeQrCode(value);

  if (!normalizedQrCode) return null;

  const [table] = await db
    .select()
    .from(restaurantTables)
    .where(eq(restaurantTables.qrCode, normalizedQrCode))
    .limit(1);

  return table ? toPublicRestaurantTable(table) : null;
}

export async function findRestaurantTableById(
  id: string,
  outletId: string,
): Promise<PublicRestaurantTable | null> {
  const [table] = await db
    .select()
    .from(restaurantTables)
    .where(
      and(eq(restaurantTables.id, id), eq(restaurantTables.outletId, outletId)),
    )
    .limit(1);

  return table ? toPublicRestaurantTable(table) : null;
}
