import { asc, eq } from "drizzle-orm";

import { db } from "@/db";
import { outlets } from "@/db/schema";

export async function listPublicOutlets() {
  return db
    .select({
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
    })
    .from(outlets)
    .where(eq(outlets.isActive, true))
    .orderBy(asc(outlets.name));
}
