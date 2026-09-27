import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

type Database = PostgresJsDatabase<typeof schema>;

const globalForDb = globalThis as unknown as { db?: Database };

/** Lazily connects so builds without DATABASE_URL still succeed. */
export function getDb(): Database {
  if (globalForDb.db) return globalForDb.db;

  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set.");

  const db = drizzle({ client: postgres(url, { max: 10 }), schema });
  globalForDb.db = db;
  return db;
}

export type Transaction = Parameters<Parameters<Database["transaction"]>[0]>[0];

export { schema };
