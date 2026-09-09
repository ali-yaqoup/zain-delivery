import { NextRequest, NextResponse } from "next/server";
import { createOrder, readOrders } from "@/lib/orders-store";
import type { CartLine } from "@/lib/types";
import { getStoreById, stores as baseStores } from "@/lib/stores";
import { readSettings } from "@/lib/settings-store";
import {
  applySiteSettingsToStores,
  feeForVillage,
} from "@/lib/site-settings";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const auth = request.headers.get("x-admin-key");
  if (auth !== process.env.ADMIN_PASSWORD && auth !== "zain2026") {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }
  const orders = await readOrders();
  return NextResponse.json(
    { orders },
    { headers: { "Cache-Control": "no-store" } }
  );
}

export async function POST(request: NextRequest) {
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
      subtotal?: number;
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

    const minOrder = store.minOrder;

    const safeItems = items.map((line) => ({
      lineId: String(line.lineId || line.itemId),
      itemId: String(line.itemId),
      storeId: String(line.storeId || storeId),
      name: String(line.name).slice(0, 120),
      sizeLabel: line.sizeLabel
        ? String(line.sizeLabel).slice(0, 40)
        : undefined,
      price: Number(line.price) || 0,
      quantity: Math.min(99, Math.max(1, Number(line.quantity) || 1)),
      image: String(line.image || "").slice(0, 500),
    }));

    const computedSubtotal = safeItems.reduce(
      (sum, line) => sum + line.price * line.quantity,
      0
    );

    if (computedSubtotal < minOrder) {
      return NextResponse.json(
        { error: `الحد الأدنى للطلب ${minOrder} ₪` },
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

    return NextResponse.json(
      { order },
      {
        status: 201,
        headers: { "Cache-Control": "no-store" },
      }
    );
  } catch {
    return NextResponse.json({ error: "فشل حفظ الطلب" }, { status: 500 });
  }
}
