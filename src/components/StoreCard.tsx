"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { Store } from "@/lib/types";
import { formatPrice } from "@/lib/stores";
import { useCart } from "@/context/CartContext";
import { useSiteSettings } from "@/context/SiteSettingsContext";
import { isStoreOpen } from "@/lib/store-hours";
import { ClockIcon, StarIcon, StoreGlyph } from "@/components/icons";

export function StoreCard({ store }: { store: Store }) {
  const { village } = useCart();
  const { getDeliveryFee } = useSiteSettings();
  const deliveryFee = getDeliveryFee(village);
  const [open, setOpen] = useState(() => isStoreOpen(store));
  const badge = store.category === "restaurant" ? "مطعم" : "ميني ماركت";

  useEffect(() => {
    const sync = () => setOpen(isStoreOpen(store));
    sync();
    const timer = setInterval(sync, 30_000);
    return () => clearInterval(timer);
  }, [store]);

  return (
    <Link
      href={`/store/${store.slug}`}
      className="card-hover group block overflow-hidden rounded-3xl border border-border bg-surface"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-surface-2">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={store.coverImage}
          alt={store.name}
          className={`h-full w-full object-cover object-center transition duration-700 group-hover:scale-110 ${
            !open ? "brightness-75" : ""
          }`}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-canvas/90 via-canvas/35 to-canvas/20" />
        <div className="absolute inset-x-0 bottom-12 top-10 flex flex-col items-center justify-center px-4 text-center pointer-events-none">
          <p className="mb-1 rounded-full border border-white/20 bg-black/35 px-3 py-0.5 text-[11px] font-semibold text-white/90 backdrop-blur-sm">
            {badge}
          </p>
          <p className="font-display text-2xl font-extrabold text-white drop-shadow-[0_4px_16px_rgba(0,0,0,0.7)] sm:text-3xl">
            {store.name}
          </p>
          <p className="mt-1 text-xs text-white/85 sm:text-sm">{store.tagline}</p>
        </div>
        <span
          className={`absolute top-3 right-3 rounded-full px-2.5 py-1 text-xs font-semibold text-white shadow-lg ${
            open ? "bg-success/95" : "bg-danger"
          }`}
        >
          {open ? "مفتوح الآن" : "مغلق الآن"}
        </span>
        <span className="absolute bottom-3 right-3 inline-flex items-center gap-1 rounded-full bg-canvas/85 px-2.5 py-1 text-xs text-ink backdrop-blur">
          <ClockIcon size={12} /> {store.deliveryMinutes} د
        </span>
        <span className="absolute bottom-3 left-3 inline-flex items-center gap-1 rounded-full bg-amber/95 px-2.5 py-1 font-mono text-xs font-bold text-black">
          <StarIcon size={11} /> {store.rating}
        </span>
      </div>
      <div className="space-y-3 p-5">
        <div>
          <p className="text-xs font-semibold tracking-wide text-brand">
            {badge}
          </p>
          <h3 className="font-display text-xl font-bold text-ink mt-1 group-hover:text-brand transition-colors inline-flex items-center gap-2">
            <StoreGlyph
              storeId={store.id}
              category={store.category}
              size={22}
              className="text-brand"
            />
            {store.name}
          </h3>
          <p className="text-sm text-muted mt-1">{store.tagline}</p>
          <p className="mt-1 text-xs text-soft">{store.openHours}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {store.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-surface-2 px-2.5 py-1 text-xs text-soft"
            >
              {tag}
            </span>
          ))}
        </div>
        <div className="flex items-center justify-between border-t border-border pt-3 text-xs text-muted">
          <span>
            توصيل لـ{village} {formatPrice(deliveryFee)}
          </span>
          <span>حد أدنى {formatPrice(store.minOrder)}</span>
        </div>
        <span className="btn-press inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand/15 py-3 text-sm font-bold text-brand transition group-hover:bg-brand group-hover:text-white group-hover:glow-brand">
          تصفح القائمة واطلب
          <span className="transition group-hover:-translate-x-0.5" aria-hidden>
            ←
          </span>
        </span>
      </div>
    </Link>
  );
}
