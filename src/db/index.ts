import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema";

const isProductionRuntime = process.env.NODE_ENV === "production";
const isVercelRuntime = process.env.VERCEL === "1";
const databaseUrl = process.env.TURSO_DATABASE_URL ??
  (isProductionRuntime ? undefined : "file:sqlite.db");
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!databaseUrl) {
  throw new Error("TURSO_DATABASE_URL must be configured for production.");
}

if (isVercelRuntime && databaseUrl.startsWith("file:")) {
  throw new Error("Vercel deployments require a remote Turso database URL.");
}

const isRemoteDatabase = !databaseUrl.startsWith("file:");
if (isRemoteDatabase && !authToken) {
  throw new Error("TURSO_AUTH_TOKEN must be configured for the remote database.");
}

export const client = createClient({
  url: databaseUrl,
  ...(authToken ? { authToken } : {}),
});

export const db = drizzle(client, { schema });

export * from "./schema";
