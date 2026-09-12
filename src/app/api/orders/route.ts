import { NextRequest, NextResponse } from "next/server";
import { createOrder, readOrders } from "@/lib/orders-store";
import type { CartLine } from "@/lib/types";
import { getStoreById, stores as baseStores } from "@/lib/stores";
import { readSettings } from "@/lib/settings-store";
import {
  applySiteSettingsToStores,
  feeForVillage,
} from "@/lib/site-settings";
import {
  clientIp,
  createTrackToken,
  isAdminAuthorized,
  normalizePhone,
} from "@/lib/admin-auth";
import { rateLimit } from "@/lib/rate-limit";
import { resolveOrderItems } from "@/lib/resolve-order-items";
import { isStoreOpen } from "@/lib/store-hours";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const ip = clientIp(request);
  if (!isAdminAuthorized(request)) {
    const limited = rateLimit(`admin-login:${ip}`, 12, 60_000);
    if (!limited.ok) {
      return NextResponse.json(
        { error: "محاولات كثيرة، حاول بعد قليل" },
        {
          status: 429,
          headers: { "Retry-After": String(limited.retryAfterSec) },
        }
      );
    }
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }
  const orders = await readOrders();
  return NextResponse.json(
    { orders },
    { headers: { "Cache-Control": "no-store" } }
  );
}

export async function POST(request: NextRequest) {
  const ip = clientIp(request);
  const limited = rateLimit(`order:${ip}`, 8, 60_000);
  if (!limited.ok) {
    return NextResponse.json(
      { error: "محاولات كثيرة، حاول بعد قليل" },
      {
        status: 429,
        headers: { "Retry-After": String(limited.retryAfterSec) },
      }
    );
  }

  try {
    const body = await request.json();
    const {
      customerName,
      phone,
      village,
      address,
      notes = "",
      storeId,
      storeName,
      items,
    } = body as {
      customerName: string;
      phone: string;
      village: string;
      address: string;
      notes?: string;
      storeId: string;
      storeName: string;
      items: CartLine[];
    };

    if (
      !customerName?.trim() ||
      !phone?.trim() ||
      !village?.trim() ||
      !address?.trim() ||
      !storeId ||
      !Array.isArray(items) ||
      items.length === 0
    ) {
      return NextResponse.json(
        { error: "بيانات الطلب ناقصة" },
        { status: 400 }
      );
    }

    const phoneDigits = normalizePhone(phone);
    if (phoneDigits.length < 9 || phoneDigits.length > 15) {
      return NextResponse.json(
        { error: "رقم الهاتف غير صالح" },
        { status: 400 }
      );
    }

    if (items.length > 80) {
      return NextResponse.json(
        { error: "عدد المنتجات في الطلب كبير جداً" },
        { status: 400 }
      );
    }

    const settings = await readSettings();
    const liveStores = applySiteSettingsToStores(baseStores, settings);
    const store =
      liveStores.find((s) => s.id === storeId) || getStoreById(storeId);
    if (!store) {
      return NextResponse.json({ error: "المحل غير موجود" }, { status: 400 });
    }

    if (!isStoreOpen(store)) {
      return NextResponse.json(
        { error: "المحل مغلق الآن — جرّب لاحقاً ضمن أوقات العمل" },
        { status: 403 }
      );
    }

    const resolved = resolveOrderItems({ store, settings, items });
    if (!resolved.ok) {
      return NextResponse.json({ error: resolved.error }, { status: 400 });
    }

    const safeItems = resolved.items;
    const computedSubtotal = safeItems.reduce(
      (sum, line) => sum + line.price * line.quantity,
      0
    );

    if (store.minOrder > 0 && computedSubtotal < store.minOrder) {
      return NextResponse.json(
        { error: `الحد الأدنى للطلب ${store.minOrder} ₪` },
        { status: 400 }
      );
    }

    const deliveryFee = feeForVillage(village.trim(), settings.deliveryZones);
    const total = computedSubtotal + deliveryFee;

    const order = await createOrder({
      customerName: customerName.trim().slice(0, 80),
      phone: phone.trim().slice(0, 20),
      village: village.trim().slice(0, 40),
      address: address.trim().slice(0, 240),
      notes: String(notes || "").trim().slice(0, 300),
      storeId,
      storeName: (storeName || store.name).slice(0, 80),
      items: safeItems,
      subtotal: computedSubtotal,
      deliveryFee,
      total,
    });

    const trackToken = createTrackToken(order.id, order.phone);

    return NextResponse.json(
      { order, trackToken },
      {
        status: 201,
        headers: { "Cache-Control": "no-store" },
      }
    );
  } catch {
    return NextResponse.json({ error: "فشل حفظ الطلب" }, { status: 500 });
  }
}
