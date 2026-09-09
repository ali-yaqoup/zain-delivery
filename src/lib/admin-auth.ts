import "server-only";
import { createHmac, timingSafeEqual, randomBytes } from "crypto";
import type { NextRequest } from "next/server";

/** Fail closed: admin routes require ADMIN_PASSWORD env (no hardcoded fallback). */
export function getAdminPassword(): string | null {
  const value = process.env.ADMIN_PASSWORD?.trim();
  return value ? value : null;
}

export function isAdminAuthorized(request: NextRequest): boolean {
  const expected = getAdminPassword();
  if (!expected) return false;

  const provided = request.headers.get("x-admin-key")?.trim() || "";
  if (!provided) return false;

  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  try {
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
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
