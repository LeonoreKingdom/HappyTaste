import { and, asc, eq } from "drizzle-orm";

import { db } from "@/db";
import { outlets } from "@/db/schema";

const publicOutletSelection = {
  id: outlets.id,
  name: outlets.name,
  address: outlets.address,
  city: outlets.city,
  phone: outlets.phone,
  whatsapp: outlets.whatsapp,
  email: outlets.email,
  openingHours: outlets.openingHours,
  facilities: outlets.facilities,
  latitude: outlets.latitude,
  longitude: outlets.longitude,
  isDemoLocation: outlets.isDemoLocation,
};

export async function listPublicOutlets() {
  return db
    .select(publicOutletSelection)
    .from(outlets)
    .where(eq(outlets.isActive, true))
    .orderBy(asc(outlets.name));
}

export async function getPublicOutletById(id: string) {
  const [outlet] = await db
    .select(publicOutletSelection)
    .from(outlets)
    .where(and(eq(outlets.id, id), eq(outlets.isActive, true)))
    .limit(1);

  return outlet ?? null;
}
