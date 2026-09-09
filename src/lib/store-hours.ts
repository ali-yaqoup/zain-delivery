import type { Store } from "./types";

/** Palestine local time for store hours */
export const STORE_TIMEZONE = "Asia/Jerusalem";

/** Minutes since midnight in a timezone */
export function minutesNowInZone(
  timeZone: string = STORE_TIMEZONE,
  date = new Date()
) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(date);

  const hour = Number(parts.find((p) => p.type === "hour")?.value || 0);
  const minute = Number(parts.find((p) => p.type === "minute")?.value || 0);
  // en-GB can return 24 for midnight in some engines
  const h = hour === 24 ? 0 : hour;
  return h * 60 + minute;
}

export function parseTimeToMinutes(value?: string | null) {
  if (!value) return null;
  const match = String(value).trim().match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return null;
  const h = Number(match[1]);
  const m = Number(match[2]);
  if (h < 0 || h > 23 || m < 0 || m > 59) return null;
  return h * 60 + m;
}

/**
 * Supports overnight windows (e.g. 16:00 → 02:00).
 * If closes === opens, treated as always open.
 */
export function isOpenAt(
  opensAt: string | undefined,
  closesAt: string | undefined,
  nowMinutes = minutesNowInZone()
) {
  const open = parseTimeToMinutes(opensAt);
  const close = parseTimeToMinutes(closesAt);
  if (open == null || close == null) return true;

  if (open === close) return true;

  // Same-day window: 08:00–22:00
  if (open < close) {
    return nowMinutes >= open && nowMinutes < close;
  }

  // Overnight: 16:00–02:00 → open if after open OR before close
  return nowMinutes >= open || nowMinutes < close;
}

export function isStoreOpen(store: Pick<Store, "opensAt" | "closesAt">) {
  return isOpenAt(store.opensAt, store.closesAt);
}
