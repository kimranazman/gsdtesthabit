import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

const connectionString =
  process.env.POSTGRES_URL ?? process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error(
    "Missing database connection string. Set POSTGRES_URL (Vercel) or DATABASE_URL (local)."
  );
}

const isSSL = !connectionString.includes("localhost");

const pool = new Pool({
  connectionString,
  ssl: isSSL ? { rejectUnauthorized: false } : false,
});

export const db = drizzle(pool, { schema });
