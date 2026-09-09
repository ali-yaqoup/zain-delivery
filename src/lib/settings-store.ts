import { promises as fs } from "fs";
import path from "path";
import {
  defaultSiteSettings,
  normalizeSettings,
  type SiteSettings,
} from "./site-settings";

const DATA_DIR = path.join(process.cwd(), "data");
const SETTINGS_FILE = path.join(DATA_DIR, "settings.json");

let queue: Promise<unknown> = Promise.resolve();

function enqueue<T>(task: () => Promise<T>): Promise<T> {
  const run = queue.then(task, task);
  queue = run.then(
    () => undefined,
    () => undefined
  );
  return run;
}

async function ensureFile() {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    await fs.access(SETTINGS_FILE);
  } catch {
    await fs.writeFile(
      SETTINGS_FILE,
      JSON.stringify(defaultSiteSettings(), null, 2),
      "utf8"
    );
  }
}

async function readUnsafe(): Promise<SiteSettings> {
  await ensureFile();
  const raw = await fs.readFile(SETTINGS_FILE, "utf8");
  try {
    return normalizeSettings(JSON.parse(raw) as Partial<SiteSettings>);
  } catch {
    return defaultSiteSettings();
  }
}

async function writeAtomic(settings: SiteSettings) {
  await ensureFile();
  const tmp = `${SETTINGS_FILE}.${process.pid}.${Date.now()}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(settings, null, 2), "utf8");
  await fs.rename(tmp, SETTINGS_FILE);
}

export async function readSettings(): Promise<SiteSettings> {
  return enqueue(() => readUnsafe());
}

export async function replaceSettings(
  settings: SiteSettings
): Promise<SiteSettings> {
  return enqueue(async () => {
    const next = normalizeSettings(settings);
    await writeAtomic(next);
    return next;
  });
}
