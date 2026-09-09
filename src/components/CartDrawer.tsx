"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useCart } from "@/context/CartContext";
import { useSiteSettings } from "@/context/SiteSettingsContext";
import { formatPrice, type VillageName } from "@/lib/stores";
import { CartIcon } from "@/components/icons";

export function CartDrawer() {
  const {
    isOpen,
    closeCart,
    items,
    store,
    subtotal,
    deliveryFee,
    total,
    village,
    setVillage,
    setQuantity,
    clearCart,
  } = useCart();
  const { deliveryZones } = useSiteSettings();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    document.body.classList.toggle("cart-open", isOpen);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeCart();
    };
    if (isOpen) window.addEventListener("keydown", onKey);
    return () => {
      document.body.classList.remove("cart-open");
      window.removeEventListener("keydown", onKey);
    };
  }, [isOpen, closeCart, mounted]);

  if (!mounted || !isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-start">
      <button
        type="button"
        aria-label="إغلاق السلة"
        className="absolute inset-0 bg-black/65 backdrop-blur-sm animate-fade-in"
        onClick={closeCart}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="سلة الطلب"
        className="relative flex h-full w-full max-w-md flex-col border-l border-border bg-surface shadow-2xl animate-slide-drawer"
      >
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div>
            <h2 className="font-display text-lg font-bold text-ink">سلة الطلب</h2>
            <p className="text-xs text-muted">
              {store
                ? `${store.name} • ${items.length} عنصر`
                : "لم تُضف منتجات بعد"}
            </p>
          </div>
          <button
            type="button"
            onClick={closeCart}
            className="btn-press rounded-xl border border-border bg-surface-2 px-3 py-2 text-sm text-muted hover:text-ink hover:border-brand/40"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {items.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border-strong bg-surface-2 p-8 text-center animate-fade-up">
              <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand/15 text-brand">
                <CartIcon size={28} />
              </div>
              <p className="font-semibold text-ink mb-1">سلتك فارغة</p>
              <p className="text-sm text-muted">
                اختار من كينج بيتزا أو ميني ماركت مطاوع
              </p>
              <Link
                href="/stores"
                onClick={closeCart}
                className="btn-press mt-5 inline-flex rounded-xl bg-brand px-5 py-2.5 text-sm font-semibold text-white glow-brand"
              >
                تصفح المحلات
              </Link>
            </div>
          ) : (
            <ul className="space-y-3">
              {items.map((line, index) => (
                <li
                  key={line.lineId}
                  className="flex gap-3 rounded-2xl border border-border bg-surface-2 p-3 animate-fade-up"
                  style={{ animationDelay: `${Math.min(index, 6) * 0.04}s` }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={line.image}
                    alt=""
                    className="h-16 w-16 rounded-xl object-cover bg-surface-3"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-ink truncate">
                      {line.name}
                    </p>
                    {line.sizeLabel && (
                      <p className="text-xs text-muted">{line.sizeLabel}</p>
                    )}
                    <p className="font-mono text-xs text-brand mt-0.5">
                      {formatPrice(line.price)}
                    </p>
                    <div className="mt-2 inline-flex items-center gap-1 rounded-xl border border-border bg-surface p-1">
                      <button
                        type="button"
                        className="qty-btn h-8 w-8 rounded-lg bg-surface-3 text-ink"
                        onClick={() =>
                          setQuantity(line.lineId, line.quantity - 1)
                        }
                        aria-label="إنقاص"
                      >
                        −
                      </button>
                      <span className="w-7 text-center font-mono text-sm font-semibold">
                        {line.quantity}
                      </span>
                      <button
                        type="button"
                        className="qty-btn h-8 w-8 rounded-lg bg-brand text-white"
                        onClick={() =>
                          setQuantity(line.lineId, line.quantity + 1)
                        }
                        aria-label="زيادة"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-col items-end justify-between">
                    <p className="font-mono text-sm font-bold text-ink">
                      {formatPrice(line.price * line.quantity)}
                    </p>
                    <button
                      type="button"
                      onClick={() => setQuantity(line.lineId, 0)}
                      className="text-[11px] text-soft hover:text-danger transition"
                    >
                      حذف
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {items.length > 0 && (
          <div className="space-y-3 border-t border-border bg-surface-2/95 px-5 py-4 backdrop-blur">
            <div className="flex justify-between text-sm text-muted">
              <span>المجموع الفرعي</span>
              <span className="font-mono text-ink">{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm text-muted">
              <span>رسوم التوصيل ({village})</span>
              <span className="font-mono text-ink">{formatPrice(deliveryFee)}</span>
            </div>
            <label className="block space-y-1.5">
              <span className="text-xs text-soft">منطقة التوصيل</span>
              <select
                value={village}
                onChange={(e) => setVillage(e.target.value as VillageName)}
                className="field w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-sm outline-none"
              >
                {deliveryZones.map((z) => (
                  <option key={z.name} value={z.name}>
                    {z.name} — {z.fee} ₪
                  </option>
                ))}
              </select>
            </label>
            <div className="flex justify-between text-base font-bold">
              <span>الإجمالي</span>
              <span className="font-mono text-brand text-lg">
                {formatPrice(total)}
              </span>
            </div>
            <p className="rounded-lg bg-success/10 px-3 py-2 text-xs text-success">
              💵 الدفع عند الاستلام • كاش
            </p>
            <Link
              href="/checkout"
              onClick={closeCart}
              className="btn-press flex w-full items-center justify-center gap-2 rounded-xl bg-brand py-3.5 text-sm font-bold text-white glow-brand hover:bg-brand-hover"
            >
              إتمام الطلب
              <span aria-hidden>←</span>
            </Link>
            <button
              type="button"
              onClick={clearCart}
              className="w-full py-1 text-xs text-soft hover:text-danger transition"
            >
              تفريغ السلة
            </button>
          </div>
        )}
      </aside>
    </div>
  );
}
