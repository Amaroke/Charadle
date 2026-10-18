import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import type { PgDatabase, PgQueryResultHKT } from "drizzle-orm/pg-core";
import * as schema from "@/db/schema";

export type Database = PgDatabase<PgQueryResultHKT, typeof schema>;

const memoryUrl = "memory:";

export async function memoryDatabase(): Promise<Database> {
  const [{ PGlite }, pglite, { migrate }] = await Promise.all([
    import("@electric-sql/pglite"),
    import("drizzle-orm/pglite"),
    import("drizzle-orm/pglite/migrator"),
  ]);
  const database = pglite.drizzle(new PGlite(), { schema });
  await migrate(database, { migrationsFolder: "drizzle" });
  return database;
}

async function open(): Promise<Database> {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set");
  if (url === memoryUrl) return memoryDatabase();
  return drizzle(neon(url), { schema });
}

const shared = globalThis as typeof globalThis & { charadleDatabase?: Promise<Database> };

export function database(): Promise<Database> {
  shared.charadleDatabase ??= open().catch((error: unknown) => {
    shared.charadleDatabase = undefined;
    throw error;
  });
  return shared.charadleDatabase;
}
