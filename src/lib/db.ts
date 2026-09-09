import "server-only";
import postgres from "postgres";

let sql: ReturnType<typeof postgres> | null = null;

/** True when DATABASE_URL is set (production / staging). */
export function hasDatabase() {
  return Boolean(process.env.DATABASE_URL?.trim());
}

/**
 * Shared Postgres client (Supabase / Neon / any Postgres URL).
 * Uses a small pool + no prepared statements for serverless/poolers.
 */
export function getSql() {
  const url = process.env.DATABASE_URL?.trim();
  if (!url) {
    throw new Error("DATABASE_URL is not set");
  }
  if (!sql) {
    sql = postgres(url, {
      ssl: "require",
      max: 1,
      idle_timeout: 20,
      connect_timeout: 10,
      prepare: false,
    });
  }
  return sql;
}
