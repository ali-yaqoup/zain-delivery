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

    const quantity = Math.min(99, Math.max(1, Number(line.quantity) || 1));

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
    });
  }

  if (safe.length === 0) {
    return { ok: false, error: "الطلب فارغ" };
  }

  return { ok: true, items: safe };
}
