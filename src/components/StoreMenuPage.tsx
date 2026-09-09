"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { ProductImage } from "@/components/ProductImage";
import {
  formatPrice,
  itemPriceRange,
} from "@/lib/stores";
import { useSiteSettings } from "@/context/SiteSettingsContext";
import { isStoreOpen } from "@/lib/store-hours";
import { PhoneIcon, StarIcon, StoreGlyph } from "@/components/icons";
import type { MenuItem } from "@/lib/types";

const PAGE_SIZE = 24;

export function StoreMenuPage() {
  const params = useParams<{ slug: string }>();
  const { stores, getDeliveryFee } = useSiteSettings();
  const store = stores.find((s) => s.slug === params.slug);
  const { addItem, items, setQuantity, openCart, itemCount, total, village } =
    useCart();
  const deliveryFeeForVillage = getDeliveryFee(village);
  const [openNow, setOpenNow] = useState(() =>
    store ? isStoreOpen(store) : false
  );
  const [activeCategory, setActiveCategory] = useState("الكل");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [sizePick, setSizePick] = useState<Record<string, string>>({});
  const [remoteItems, setRemoteItems] = useState<MenuItem[]>([]);
  const [remoteTotal, setRemoteTotal] = useState(0);
  const [remoteCategories, setRemoteCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const usesCatalogApi = Boolean(store?.catalogId);

  useEffect(() => {
    if (!store) return;
    const sync = () => setOpenNow(isStoreOpen(store));
    sync();
    const timer = setInterval(sync, 30_000);
    return () => clearInterval(timer);
  }, [store]);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 250);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    setPage(1);
    setRemoteItems([]);
  }, [activeCategory, debouncedSearch, store?.slug]);

  const loadCatalog = useCallback(
    async (nextPage: number, append: boolean) => {
      if (!store?.catalogId) return;
      append ? setLoadingMore(true) : setLoading(true);
      try {
        const params = new URLSearchParams({
          page: String(nextPage),
          limit: String(PAGE_SIZE),
        });
        if (activeCategory !== "الكل") params.set("category", activeCategory);
        if (debouncedSearch) params.set("q", debouncedSearch);

        const res = await fetch(
          `/api/catalog/${store.catalogId}?${params.toString()}`
        );
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "فشل التحميل");
        setRemoteCategories(data.categories || []);
        setRemoteTotal(data.total || 0);
        setRemoteItems((prev) =>
          append ? [...prev, ...(data.items || [])] : data.items || []
        );
        setPage(nextPage);
      } catch {
        if (!append) {
          setRemoteItems([]);
          setRemoteTotal(0);
        }
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [store?.catalogId, activeCategory, debouncedSearch]
  );

  useEffect(() => {
    if (!usesCatalogApi) return;
    loadCatalog(1, false);
  }, [usesCatalogApi, loadCatalog]);

  const localFiltered = useMemo(() => {
    if (!store || usesCatalogApi) return [];
    const q = debouncedSearch.toLowerCase();
    return store.menu.filter((item) => {
      const catOk =
        activeCategory === "الكل" || item.category === activeCategory;
      if (!catOk) return false;
      if (!q) return true;
      return (
        item.name.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q)
      );
    });
  }, [store, usesCatalogApi, activeCategory, debouncedSearch]);

  const localVisible = localFiltered.slice(0, page * PAGE_SIZE);

  const displayedItems = usesCatalogApi ? remoteItems : localVisible;
  const totalCount = usesCatalogApi ? remoteTotal : localFiltered.length;
  const hasMore = displayedItems.length < totalCount;

  const categories = useMemo(() => {
    if (!store) return [];
    if (usesCatalogApi) {
      return [
        { name: "الكل", count: remoteTotal },
        ...remoteCategories.map((name) => ({ name, count: 0 })),
      ];
    }
    const counts = new Map<string, number>();
    for (const item of store.menu) {
      counts.set(item.category, (counts.get(item.category) || 0) + 1);
    }
    return [
      { name: "الكل", count: store.menu.length },
      ...Array.from(counts.keys())
        .sort((a, b) => a.localeCompare(b, "ar"))
        .map((name) => ({ name, count: counts.get(name) || 0 })),
    ];
  }, [store, usesCatalogApi, remoteCategories, remoteTotal]);

  if (!store) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <h1 className="font-display text-2xl font-bold">المحل غير موجود</h1>
        <Link href="/stores" className="mt-4 inline-block text-brand">
          العودة للمتاجر
        </Link>
      </div>
    );
  }

  const qtyOf = (lineId: string) =>
    items.find((line) => line.lineId === lineId)?.quantity ?? 0;

  function selectedSize(item: MenuItem) {
    if (!item.sizes?.length) return undefined;
    const picked = sizePick[item.id] ?? item.sizes[1]?.id ?? item.sizes[0].id;
    return item.sizes.find((s) => s.id === picked) ?? item.sizes[0];
  }

  function handleAdd(item: MenuItem) {
    if (!store) return;
    if (item.sizes?.length) {
      const size = selectedSize(item);
      if (!size) return;
      addItem(store, item, { size });
      return;
    }
    addItem(store, item);
  }

  return (
    <div>
      <section className="relative h-56 overflow-hidden sm:h-72 md:h-80">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={store.coverImage}
          alt={store.name}
          className="h-full w-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-canvas via-canvas/55 to-canvas/25" />
        <div className="absolute inset-0 flex flex-col items-center justify-center px-4 text-center">
          <p className="mb-2 rounded-full border border-white/20 bg-black/35 px-3 py-1 text-xs font-semibold text-white/90 backdrop-blur-sm">
            {store.category === "restaurant" ? "مطعم" : "ميني ماركت"}
          </p>
          <p className="font-display text-3xl font-extrabold text-white drop-shadow-[0_4px_20px_rgba(0,0,0,0.65)] sm:text-4xl md:text-5xl">
            {store.name}
          </p>
          <p className="mt-2 max-w-md text-sm text-white/85 sm:text-base">
            {store.tagline}
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="-mt-16 relative z-10 rounded-2xl border border-border bg-surface p-5 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs text-brand mb-1">
                {store.category === "restaurant" ? "مطعم" : "ميني ماركت"}
              </p>
              <h1 className="font-display text-2xl font-bold text-ink sm:text-3xl inline-flex flex-wrap items-center gap-2">
                <StoreGlyph
                  storeId={store.id}
                  category={store.category}
                  size={28}
                  className="text-brand"
                />
                {store.name}
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-semibold text-white ${
                    openNow ? "bg-success/95" : "bg-danger"
                  }`}
                >
                  {openNow ? "مفتوح الآن" : "مغلق الآن"}
                </span>
              </h1>
              <p className="mt-1 text-sm text-muted">{store.description}</p>
              <div className="mt-3 flex flex-wrap gap-3 text-xs text-muted">
                <span className="inline-flex items-center gap-1 rounded-lg bg-amber/15 px-2 py-1 text-amber">
                  <StarIcon size={12} /> {store.rating}
                </span>
                {usesCatalogApi ? (
                  <span>{remoteTotal || "…"} صنف</span>
                ) : (
                  <span>{store.menu.length} صنف</span>
                )}
                <span>{store.deliveryMinutes} دقيقة</span>
                <span>
                  توصيل لـ{village} {formatPrice(deliveryFeeForVillage)}
                </span>
                <span>حد أدنى {formatPrice(store.minOrder)}</span>
                <span>{store.openHours}</span>
              </div>
              {store.phones && (
                <div className="mt-2 flex flex-wrap gap-2 text-xs">
                  {store.phones.map((phone) => (
                    <a
                      key={phone}
                      href={`tel:${phone.replace(/\s/g, "")}`}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface-2 px-2 py-1 text-brand hover:border-brand/50"
                    >
                      <PhoneIcon size={12} /> {phone}
                    </a>
                  ))}
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={openCart}
              className="btn-press rounded-xl bg-brand px-4 py-2.5 text-sm font-bold text-white"
            >
              السلة ({itemCount}) • {formatPrice(total)}
            </button>
          </div>

          <div className="mt-4 relative">
            <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-soft">
              🔍
            </span>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ابحث عن منتج..."
              className="field w-full rounded-xl border border-border bg-surface-2 py-3 pr-11 pl-4 text-sm outline-none"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute left-3 top-1/2 -translate-y-1/2 rounded-lg px-2 py-1 text-xs text-soft hover:text-ink"
              >
                مسح
              </button>
            )}
          </div>
        </div>

        <div className="sticky top-16 z-20 -mx-4 mt-6 overflow-x-auto border-y border-border bg-canvas/95 px-4 py-3 backdrop-blur sm:mx-0 sm:rounded-xl sm:border sm:px-3">
          <div className="chip-scroll flex gap-2">
            {categories.map((cat) => (
              <button
                key={cat.name}
                type="button"
                onClick={() => setActiveCategory(cat.name)}
                className={`btn-press whitespace-nowrap rounded-full px-4 py-1.5 text-sm transition ${
                  activeCategory === cat.name
                    ? "bg-brand text-white"
                    : "bg-surface text-muted hover:text-ink"
                }`}
              >
                {cat.name}
                {cat.count > 0 && (
                  <span className="opacity-70"> ({cat.count})</span>
                )}
              </button>
            ))}
          </div>
        </div>

        <p className="mt-4 text-xs text-soft">
          عرض {displayedItems.length} من {totalCount} منتج
        </p>

        {loading ? (
          <div className="grid gap-4 py-4 sm:grid-cols-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-32 animate-pulse rounded-2xl border border-border bg-surface-2"
              />
            ))}
          </div>
        ) : (
          <div className="grid gap-4 py-4 sm:grid-cols-2">
            {displayedItems.map((item) => {
              const size = selectedSize(item);
              const lineId = item.sizes?.length
                ? `${item.id}:${size?.id}`
                : item.id;
              const qty = qtyOf(lineId);

              return (
                <article
                  key={item.id}
                  className="card-hover flex gap-3 overflow-hidden rounded-2xl border border-border bg-surface p-3"
                >
                  <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-surface-2 sm:h-28 sm:w-28">
                    <ProductImage
                      src={item.image}
                      alt={item.name}
                      width={112}
                      height={112}
                      className="h-full w-full object-cover"
                      sizes="112px"
                    />
                  </div>
                  <div className="flex flex-1 flex-col">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-semibold text-ink leading-snug">
                          {item.name}
                        </h3>
                        {item.popular && (
                          <span className="text-[11px] text-amber">
                            الأكثر طلباً
                          </span>
                        )}
                      </div>
                      <span className="font-mono text-sm font-bold text-brand whitespace-nowrap">
                        {item.sizes?.length && size
                          ? formatPrice(size.price)
                          : itemPriceRange(item)}
                      </span>
                    </div>
                    {item.description ? (
                      <p className="mt-1 line-clamp-2 text-xs text-muted">
                        {item.description}
                      </p>
                    ) : null}

                    {item.sizes?.length ? (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {item.sizes.map((s) => {
                          const active = size?.id === s.id;
                          return (
                            <button
                              key={s.id}
                              type="button"
                              onClick={() =>
                                setSizePick((prev) => ({
                                  ...prev,
                                  [item.id]: s.id,
                                }))
                              }
                              className={`rounded-lg px-2 py-1 text-[11px] transition ${
                                active
                                  ? "bg-brand text-white"
                                  : "bg-surface-2 text-muted hover:text-ink"
                              }`}
                            >
                              {s.labelAr} · {s.price}
                            </button>
                          );
                        })}
                      </div>
                    ) : null}

                    <div className="mt-auto pt-3">
                      {qty === 0 ? (
                        <button
                          type="button"
                          onClick={() => handleAdd(item)}
                          className="btn-press rounded-xl bg-brand px-3 py-1.5 text-xs font-bold text-white hover:bg-brand-hover"
                        >
                          + أضف للسلة
                        </button>
                      ) : (
                        <div className="inline-flex items-center gap-2 rounded-xl border border-brand/40 bg-brand/10 p-1">
                          <button
                            type="button"
                            className="qty-btn h-7 w-7 rounded-lg bg-surface-2"
                            onClick={() => setQuantity(lineId, qty - 1)}
                          >
                            −
                          </button>
                          <span className="w-5 text-center font-mono text-sm">
                            {qty}
                          </span>
                          <button
                            type="button"
                            className="qty-btn h-7 w-7 rounded-lg bg-brand text-white"
                            onClick={() => handleAdd(item)}
                          >
                            +
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {hasMore && !loading && (
          <div className="pb-10 text-center">
            <button
              type="button"
              disabled={loadingMore}
              onClick={() => {
                if (usesCatalogApi) loadCatalog(page + 1, true);
                else setPage((p) => p + 1);
              }}
              className="btn-press rounded-xl border border-brand/40 bg-brand/15 px-6 py-3 text-sm font-semibold text-brand hover:bg-brand hover:text-white transition disabled:opacity-60"
            >
              {loadingMore
                ? "جارٍ التحميل..."
                : `عرض المزيد (${totalCount - displayedItems.length} متبقي)`}
            </button>
          </div>
        )}

        {!loading && displayedItems.length === 0 && (
          <div className="mb-10 rounded-2xl border border-dashed border-border-strong py-16 text-center text-muted">
            ما في نتائج لهالبحث
          </div>
        )}
      </div>
    </div>
  );
}
