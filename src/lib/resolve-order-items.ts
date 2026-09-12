import "server-only";
import type { CartLine, MenuItem, Store } from "./types";
import {
  applyMutawaOverrides,
  isMutawaHidden,
  type SiteSettings,
} from "./site-settings";
import { getMutawaCatalog } from "./mutawa-catalog";

function resolveMenuItemPrice(
  item: MenuItem,
  sizeLabel?: string
): number | null {
  if (item.priceAtDelivery) return 0;
  if (item.sizes?.length) {
    const size =
      item.sizes.find((s) => s.labelAr === sizeLabel || s.label === sizeLabel) ||
      item.sizes.find((s) => s.id === sizeLabel);
    return size ? size.price : null;
  }
  if (typeof item.price === "number" && Number.isFinite(item.price)) {
    return item.price;
  }
  return null;
}

function findInMenu(menu: MenuItem[], itemId: string) {
  return menu.find((item) => item.id === itemId);
}

/**
 * Rebuild cart lines from trusted catalog/menu prices (ignore client prices).
 */
export function resolveOrderItems(options: {
  store: Store;
  settings: SiteSettings;
  items: CartLine[];
}): { ok: true; items: CartLine[] } | { ok: false; error: string } {
  const { store, settings, items } = options;
  const safe: CartLine[] = [];

  for (const line of items) {
    const itemId = String(line.itemId || "").trim();
    if (!itemId) {
      return { ok: false, error: "منتج غير صالح في الطلب" };
    }

    let menuItem: MenuItem | undefined;

    if (store.catalogId === "mutawa") {
      if (isMutawaHidden(itemId, settings.mutawaOverrides)) {
        return { ok: false, error: "أحد المنتجات غير متاح حالياً" };
      }
      const raw = findInMenu(getMutawaCatalog(), itemId);
      if (!raw) {
        return { ok: false, error: "أحد المنتجات غير موجود" };
      }
      menuItem = applyMutawaOverrides(raw, settings.mutawaOverrides);
    } else if (store.id === "king-pizza") {
      const menu = settings.kingMenu?.length ? settings.kingMenu : store.menu;
      menuItem = findInMenu(menu, itemId);
    } else {
      menuItem = findInMenu(store.menu, itemId);
    }

    if (!menuItem) {
      return { ok: false, error: "أحد المنتجات غير موجود" };
    }

    const sizeLabel = line.sizeLabel
      ? String(line.sizeLabel).slice(0, 40)
      : undefined;
    const price = resolveMenuItemPrice(menuItem, sizeLabel);
    if (price === null || price < 0) {
      return { ok: false, error: "تعذر التحقق من سعر أحد المنتجات" };
    }

    const quantity =
      menuItem.priceAtDelivery && line.orderMode === "budget"
        ? 1
        : Math.min(
            99,
            Math.max(
              menuItem.priceAtDelivery ? 0.25 : 1,
              Math.round((Number(line.quantity) || 1) * 100) / 100
            )
          );

    const orderMode =
      menuItem.priceAtDelivery && line.orderMode === "budget"
        ? ("budget" as const)
        : menuItem.priceAtDelivery
          ? ("quantity" as const)
          : undefined;

    let budgetAmount: number | undefined;
    if (orderMode === "budget") {
      const raw = Number(line.budgetAmount);
      if (!Number.isFinite(raw) || raw < 1) {
        return { ok: false, error: "حدّد مبلغاً صالحاً لأحد الأصناف" };
      }
      budgetAmount = Math.min(500, Math.round(raw * 100) / 100);
    }

    const requestNote = line.requestNote
      ? String(line.requestNote).trim().slice(0, 80)
      : undefined;

    safe.push({
      lineId: String(line.lineId || `${itemId}-${sizeLabel || "default"}`).slice(
        0,
        80
      ),
      itemId,
      storeId: store.id,
      name: menuItem.name.slice(0, 120),
      sizeLabel,
      price,
      quantity,
      image: String(menuItem.image || line.image || "").slice(0, 500),
      priceAtDelivery: Boolean(menuItem.priceAtDelivery),
      unit: menuItem.unit ? String(menuItem.unit).slice(0, 20) : undefined,
      orderMode,
      budgetAmount,
      requestNote,
    });
  }

  if (safe.length === 0) {
    return { ok: false, error: "الطلب فارغ" };
  }

  return { ok: true, items: safe };
}
