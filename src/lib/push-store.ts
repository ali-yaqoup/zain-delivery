import "server-only";
import { promises as fs } from "fs";
import path from "path";
import { getSql, hasDatabase } from "./db";

export type PushSub = {
  endpoint: string;
  keys: { p256dh: string; auth: string };
};

const DATA_DIR = path.join(process.cwd(), "data");
const FILE = path.join(DATA_DIR, "push-subscriptions.json");

let ensured = false;

async function ensureTable() {
  if (!hasDatabase() || ensured) return;
  const sql = getSql();
  await sql`
    CREATE TABLE IF NOT EXISTS push_subscriptions (
      endpoint TEXT PRIMARY KEY,
      p256dh TEXT NOT NULL,
      auth TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  ensured = true;
}

async function readFileSubs(): Promise<PushSub[]> {
  try {
    const raw = await fs.readFile(FILE, "utf8");
    const parsed = JSON.parse(raw) as PushSub[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function writeFileSubs(subs: PushSub[]) {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(FILE, JSON.stringify(subs, null, 2), "utf8");
}

export async function savePushSubscription(sub: PushSub) {
  if (!sub.endpoint || !sub.keys?.p256dh || !sub.keys?.auth) {
    throw new Error("اشتراك غير صالح");
  }

  if (!hasDatabase()) {
    const subs = await readFileSubs();
    const next = subs.filter((s) => s.endpoint !== sub.endpoint);
    next.push(sub);
    await writeFileSubs(next);
    return;
  }

  await ensureTable();
  const sql = getSql();
  await sql`
    INSERT INTO push_subscriptions (endpoint, p256dh, auth, created_at)
    VALUES (${sub.endpoint}, ${sub.keys.p256dh}, ${sub.keys.auth}, NOW())
    ON CONFLICT (endpoint) DO UPDATE
    SET p256dh = EXCLUDED.p256dh,
        auth = EXCLUDED.auth
  `;
}

export async function deletePushSubscription(endpoint: string) {
  if (!endpoint) return;

  if (!hasDatabase()) {
    const subs = await readFileSubs();
    await writeFileSubs(subs.filter((s) => s.endpoint !== endpoint));
    return;
  }

  await ensureTable();
  const sql = getSql();
  await sql`DELETE FROM push_subscriptions WHERE endpoint = ${endpoint}`;
}

export async function listPushSubscriptions(): Promise<PushSub[]> {
  if (!hasDatabase()) return readFileSubs();

  await ensureTable();
  const sql = getSql();
  const rows = await sql<{ endpoint: string; p256dh: string; auth: string }[]>`
    SELECT endpoint, p256dh, auth FROM push_subscriptions
  `;
  return rows.map((row) => ({
    endpoint: row.endpoint,
    keys: { p256dh: row.p256dh, auth: row.auth },
  }));
}
