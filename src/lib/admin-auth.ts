import "server-only";
import { createHmac, timingSafeEqual, randomBytes } from "crypto";
import type { NextRequest } from "next/server";

function safeEqualString(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  try {
    return timingSafeEqual(bufA, bufB);
  } catch {
    return false;
  }
}

function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

/** Fail closed: admin routes require ADMIN_EMAIL + ADMIN_PASSWORD (no hardcoded fallback). */
export function getAdminEmail(): string | null {
  const value = process.env.ADMIN_EMAIL?.trim();
  return value ? normalizeEmail(value) : null;
}

export function getAdminPassword(): string | null {
  const value = process.env.ADMIN_PASSWORD?.trim();
  return value ? value : null;
}

type AdminAccount = { email: string; password: string };

/** Primary ADMIN_EMAIL/PASSWORD plus optional extras in ADMIN_USERS. */
export function getAdminAccounts(): AdminAccount[] {
  const accounts: AdminAccount[] = [];
  const primaryEmail = getAdminEmail();
  const primaryPassword = getAdminPassword();
  if (primaryEmail && primaryPassword) {
    accounts.push({ email: primaryEmail, password: primaryPassword });
  }

  const extra = process.env.ADMIN_USERS?.trim();
  if (extra) {
    for (const part of extra.split("|")) {
      const idx = part.indexOf(":");
      if (idx <= 0) continue;
      const email = normalizeEmail(part.slice(0, idx));
      const password = part.slice(idx + 1);
      if (email && password) accounts.push({ email, password });
    }
  }

  // Extra numbered accounts: ADMIN_EMAIL1 / ADMIN_PASSWORD1, ADMIN_EMAIL2...
  for (let i = 1; i <= 9; i++) {
    const email = process.env[`ADMIN_EMAIL${i}`]?.trim();
    const password = process.env[`ADMIN_PASSWORD${i}`]?.trim();
    if (email && password) {
      accounts.push({ email: normalizeEmail(email), password });
    }
  }

  return accounts;
}

export function isAdminAuthorized(request: NextRequest): boolean {
  const providedEmail = normalizeEmail(
    request.headers.get("x-admin-email") || ""
  );
  const providedPassword = request.headers.get("x-admin-key")?.trim() || "";
  if (!providedEmail || !providedPassword) return false;

  const accounts = getAdminAccounts();
  if (accounts.length === 0) return false;

  return accounts.some(
    (account) =>
      safeEqualString(providedEmail, account.email) &&
      safeEqualString(providedPassword, account.password)
  );
}

export function normalizePhone(phone: string) {
  return phone.replace(/\D/g, "");
}

function trackSecret() {
  return (
    process.env.ORDER_TRACK_SECRET?.trim() ||
    process.env.ADMIN_PASSWORD?.trim() ||
    ""
  );
}

/** Short HMAC token bound to order id + phone — not stored in DB. */
export function createTrackToken(orderId: string, phone: string) {
  const secret = trackSecret();
  if (!secret) return "";
  return createHmac("sha256", secret)
    .update(`${orderId.toUpperCase()}:${normalizePhone(phone)}`)
    .digest("base64url")
    .slice(0, 22);
}

export function verifyTrackToken(
  orderId: string,
  phone: string,
  token: string | null | undefined
) {
  if (!token?.trim()) return false;
  const expected = createTrackToken(orderId, phone);
  if (!expected || expected.length !== token.trim().length) return false;
  try {
    return timingSafeEqual(
      Buffer.from(expected),
      Buffer.from(token.trim())
    );
  } catch {
    return false;
  }
}

export function phonesMatch(a: string, b: string) {
  const na = normalizePhone(a);
  const nb = normalizePhone(b);
  if (!na || !nb) return false;
  if (na === nb) return true;
  // Allow match on last 9 digits (local vs +972)
  return na.slice(-9) === nb.slice(-9);
}

export function newOrderId() {
  const stamp = Date.now().toString(36).toUpperCase();
  const rand = randomBytes(4).toString("hex").toUpperCase();
  return `ZN-${stamp.slice(-5)}${rand}`;
}

export function clientIp(request: NextRequest) {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() || "unknown";
  return request.headers.get("x-real-ip")?.trim() || "unknown";
}
