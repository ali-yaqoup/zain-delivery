import "server-only";
import {
  defaultSiteSettings,
  normalizeSettings,
  type SiteSettings,
} from "./site-settings";
import { getSql, hasDatabase } from "./db";
import {
  readSettingsFile,
  replaceSettingsFile,
} from "./settings-store-file";

type SettingsRow = {
  id: string;
  data: Partial<SiteSettings> | string;
};

export async function readSettings(): Promise<SiteSettings> {
  if (!hasDatabase()) return readSettingsFile();

  const sql = getSql();
  const rows = await sql<SettingsRow[]>`
    SELECT id, data
    FROM site_settings
    WHERE id = 'default'
    LIMIT 1
  `;

  if (!rows[0]) {
    const defaults = defaultSiteSettings();
    await sql`
      INSERT INTO site_settings (id, data, updated_at)
      VALUES ('default', ${sql.json(defaults)}, NOW())
      ON CONFLICT (id) DO NOTHING
    `;
    return defaults;
  }

  const raw =
    typeof rows[0].data === "string"
      ? (JSON.parse(rows[0].data) as Partial<SiteSettings>)
      : rows[0].data;

  // Empty seed row → use code defaults until admin saves
  if (!raw || Object.keys(raw).length === 0) {
    return defaultSiteSettings();
  }

  return normalizeSettings(raw);
}

export async function replaceSettings(
  settings: SiteSettings
): Promise<SiteSettings> {
  const next = normalizeSettings(settings);
  if (!hasDatabase()) return replaceSettingsFile(next);

  const sql = getSql();
  await sql`
    INSERT INTO site_settings (id, data, updated_at)
    VALUES ('default', ${sql.json(next)}, NOW())
    ON CONFLICT (id) DO UPDATE
    SET data = EXCLUDED.data,
        updated_at = NOW()
  `;
  return next;
}
