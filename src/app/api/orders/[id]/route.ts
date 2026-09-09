import { NextRequest, NextResponse } from "next/server";
import { getOrderById, updateOrderStatus } from "@/lib/orders-store";
import type { OrderStatus } from "@/lib/types";
import {
  clientIp,
  isAdminAuthorized,
  phonesMatch,
  verifyTrackToken,
} from "@/lib/admin-auth";
import { toPublicOrder } from "@/lib/order-privacy";
import { rateLimit } from "@/lib/rate-limit";

const ALLOWED: OrderStatus[] = [
  "new",
  "confirmed",
  "preparing",
  "on_the_way",
  "delivered",
  "cancelled",
];

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const ip = clientIp(request);
  const limited = rateLimit(`track:${ip}`, 60, 60_000);
  if (!limited.ok) {
    return NextResponse.json(
      { error: "محاولات كثيرة، حاول بعد قليل" },
      {
        status: 429,
        headers: { "Retry-After": String(limited.retryAfterSec) },
      }
    );
  }

  const { id } = await context.params;
  const order = await getOrderById(id);
  if (!order) {
    return NextResponse.json({ error: "الطلب غير موجود" }, { status: 404 });
  }

  // Admin sees full PII
  if (isAdminAuthorized(request)) {
    return NextResponse.json(
      { order, access: "full" },
      { headers: { "Cache-Control": "no-store" } }
    );
  }

  const token =
    request.nextUrl.searchParams.get("t") ||
    request.headers.get("x-track-token");
  const phoneHint =
    request.nextUrl.searchParams.get("phone") ||
    request.headers.get("x-track-phone");

  const tokenOk = verifyTrackToken(order.id, order.phone, token);
  const phoneOk = phoneHint ? phonesMatch(order.phone, phoneHint) : false;

  if (tokenOk || phoneOk) {
    return NextResponse.json(
      { order, access: "full" },
      { headers: { "Cache-Control": "no-store" } }
    );
  }

  return NextResponse.json(
    { order: toPublicOrder(order), access: "public" },
    { headers: { "Cache-Control": "no-store" } }
  );
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  if (!isAdminAuthorized(request)) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  const { id } = await context.params;
  const body = await request.json();
  const status = body.status as OrderStatus;

  if (!ALLOWED.includes(status)) {
    return NextResponse.json({ error: "حالة غير صالحة" }, { status: 400 });
  }

  const order = await updateOrderStatus(id, status);
  if (!order) {
    return NextResponse.json({ error: "الطلب غير موجود" }, { status: 404 });
  }
  return NextResponse.json({ order });
}
