import { defineConfig } from "drizzle-kit";

const databaseUrl = process.env.TURSO_DATABASE_URL;
if (!databaseUrl) {
  throw new Error("TURSO_DATABASE_URL must be set before running Drizzle Kit.");
}

const baseConfig = {
  schema: "./src/db/schema/index.ts",
  out: "./drizzle",
};

export default databaseUrl.startsWith("file:")
  ? defineConfig({
      ...baseConfig,
      dialect: "sqlite",
      dbCredentials: { url: databaseUrl },
    })
  : defineConfig({
      ...baseConfig,
      dialect: "turso",
      dbCredentials: {
        url: databaseUrl,
        authToken: process.env.TURSO_AUTH_TOKEN,
      },
    });
