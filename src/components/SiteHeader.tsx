"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useCart } from "@/context/CartContext";
import { useSiteSettings } from "@/context/SiteSettingsContext";
import { formatPrice, type VillageName } from "@/lib/stores";
import { BrandMark, CartIcon, PinIcon } from "@/components/icons";

const links = [
  { href: "/", label: "الرئيسية" },
  { href: "/stores", label: "المحلات والمطاعم" },
  { href: "/track", label: "تتبع الطلب" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const { itemCount, total, openCart, village, setVillage } = useCart();
  const { deliveryZones, settings } = useSiteSettings();
  const c = settings.content;
  const [bump, setBump] = useState(false);
  const isAdmin = pathname.startsWith("/admin");

  useEffect(() => {
    if (itemCount <= 0) return;
    setBump(true);
    const t = setTimeout(() => setBump(false), 350);
    return () => clearTimeout(t);
  }, [itemCount]);

  if (isAdmin) return null;

  return (
    <header className="site-header sticky top-0 z-40 border-b border-border/80 bg-canvas/95 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 px-4 sm:h-20 sm:gap-4 sm:px-6">
        <Link href="/" className="group flex min-w-0 items-center gap-2.5 sm:gap-3">
          <BrandMark
            size={36}
            className="shrink-0 transition group-hover:scale-105 sm:hidden"
            iconSize={26}
          />
          <BrandMark
            size={40}
            className="hidden shrink-0 transition group-hover:scale-105 sm:inline-block"
            iconSize={28}
          />
          <span className="flex min-w-0 flex-col leading-tight">
            <span className="font-display truncate text-base font-bold text-ink group-hover:text-brand transition-colors sm:text-lg">
              {c.brandNameAr}
            </span>
            <span className="hidden truncate text-xs text-soft sm:block">
              {c.headerSubtitle}
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {links.map((link) => {
            const active =
              link.href === "/"
                ? pathname === "/"
                : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-xl px-3 py-2 text-sm transition ${
                  active
                    ? "bg-brand/15 font-semibold text-brand"
                    : "text-muted hover:bg-surface hover:text-ink"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex shrink-0 items-center gap-2">
          <label className="hidden items-center gap-1.5 rounded-xl border border-border bg-surface px-2 py-1.5 text-xs text-muted sm:flex">
            <span className="text-brand">
              <PinIcon size={14} />
            </span>
            <select
              value={village}
              onChange={(e) => setVillage(e.target.value as VillageName)}
              className="max-w-[8.5rem] bg-transparent text-ink outline-none"
              aria-label="منطقة التوصيل"
            >
              {deliveryZones.map((z) => (
                <option key={z.name} value={z.name}>
                  {z.name} ({z.fee}₪)
                </option>
              ))}
            </select>
          </label>
          <button
            type="button"
            onClick={openCart}
            className={`btn-press relative flex items-center gap-2 rounded-xl border px-2.5 py-2 text-sm font-semibold transition sm:px-3 ${
              itemCount > 0
                ? "border-brand/40 bg-brand text-white glow-brand"
                : "border-brand/30 bg-brand/15 text-brand hover:bg-brand/25"
            }`}
          >
            <CartIcon size={16} />
            <span
              className={`font-mono text-xs sm:text-sm ${bump ? "animate-pop" : ""}`}
            >
              {itemCount > 0 ? (
                <>
                  <span className="sm:hidden">{itemCount}</span>
                  <span className="hidden sm:inline">
                    {itemCount} • {formatPrice(total)}
                  </span>
                </>
              ) : (
                "السلة"
              )}
            </span>
          </button>
        </div>
      </div>

      <nav className="chip-scroll flex gap-1.5 overflow-x-auto border-t border-border/60 px-4 py-2 md:hidden">
        {links.map((link) => {
          const active =
            link.href === "/"
              ? pathname === "/"
              : pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`whitespace-nowrap rounded-full px-3.5 py-1.5 text-xs font-medium transition ${
                active
                  ? "bg-brand text-white"
                  : "border border-border bg-surface-2 text-ink"
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
