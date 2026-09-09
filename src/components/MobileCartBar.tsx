"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/lib/stores";

export function MobileCartBar() {
  const pathname = usePathname();
  const { itemCount, total, openCart, store } = useCart();
  const [bump, setBump] = useState(false);

  useEffect(() => {
    if (itemCount <= 0) return;
    setBump(true);
    const t = setTimeout(() => setBump(false), 350);
    return () => clearTimeout(t);
  }, [itemCount]);

  if (
    itemCount <= 0 ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/checkout")
  ) {
    return null;
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] md:hidden pointer-events-none">
      <div className="pointer-events-auto mx-auto flex max-w-lg items-center gap-3 rounded-2xl border border-brand/40 bg-surface/95 p-2 pl-3 shadow-[0_12px_40px_rgba(0,0,0,0.55)] backdrop-blur-xl animate-toast">
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs text-muted">
            {store?.name || "سلتك"}
          </p>
          <p className="font-mono text-sm font-bold text-brand">
            <span className={`inline-block ${bump ? "animate-pop" : ""}`}>
              {itemCount}
            </span>{" "}
            عنصر • {formatPrice(total)}
          </p>
        </div>
        <button
          type="button"
          onClick={openCart}
          className="btn-press rounded-xl border border-border bg-surface-2 px-3 py-2.5 text-xs font-semibold text-ink"
        >
          السلة
        </button>
        <Link
          href="/checkout"
          className="btn-press rounded-xl bg-brand px-4 py-2.5 text-xs font-bold text-white glow-brand"
        >
          إتمام
        </Link>
      </div>
    </div>
  );
}
