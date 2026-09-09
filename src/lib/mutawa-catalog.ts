import "server-only";
import type { MenuItem } from "./types";
import mutawaMenu from "./mutawa-menu.json";
import {
  applyMutawaOverrides,
  isMutawaHidden,
  type MutawaOverride,
} from "./site-settings";

let cached: MenuItem[] | null = null;

export function getMutawaCatalog(): MenuItem[] {
  if (!cached) {
    cached = mutawaMenu as MenuItem[];
  }
  return cached;
}

export function queryMutawaCatalog(options: {
  q?: string;
  category?: string;
  page?: number;
  limit?: number;
  overrides?: Record<string, MutawaOverride>;
  includeHidden?: boolean;
}) {
  const q = (options.q || "").trim().toLowerCase();
  const category = (options.category || "").trim();
  const page = Math.max(1, options.page || 1);
  const limit = Math.min(60, Math.max(1, options.limit || 24));
  const overrides = options.overrides || {};

  let items = getMutawaCatalog()
    .filter(
      (item) => options.includeHidden || !isMutawaHidden(item.id, overrides)
    )
    .map((item) => applyMutawaOverrides(item, overrides));

  if (category && category !== "الكل") {
    items = items.filter((item) => item.category === category);
  }

  if (q) {
    items = items.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q)
    );
  }

  const categories = Array.from(new Set(items.map((i) => i.category))).sort(
    (a, b) => a.localeCompare(b, "ar")
  );

  const total = items.length;
  const start = (page - 1) * limit;
  const slice = items.slice(start, start + limit);

  return {
    items: slice,
    total,
    page,
    limit,
    totalPages: Math.max(1, Math.ceil(total / limit)),
    categories,
  };
}
