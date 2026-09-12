"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { useCart } from "@/context/CartContext";
import { useSiteSettings } from "@/context/SiteSettingsContext";
import { formatCartLinePrice, formatCartLineRequest, formatPrice, type VillageName } from "@/lib/stores";
import { CartIcon } from "@/components/icons";

const steps = ["السلة", "البيانات", "التأكيد"];

export default function CheckoutPage() {
  const router = useRouter();
  const { items, store, subtotal, clearCart, village, setVillage } = useCart();
  const { deliveryZones, getDeliveryFee } = useSiteSettings();
  const deliveryFee = getDeliveryFee(village);
  const total = subtotal + deliveryFee;
  const priceAtDelivery = items.some((line) => line.priceAtDelivery);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    customerName: "",
    phone: "",
    address: "",
    notes: "",
  });

  if (items.length === 0 || !store) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center animate-fade-up">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand/15 text-brand">
          <CartIcon size={32} />
        </div>
        <h1 className="font-display text-2xl font-bold">سلتك فارغة</h1>
        <p className="mt-2 text-muted text-sm">ارجع واضف منتجات قبل الإتمام</p>
        <Link
          href="/stores"
          className="btn-press mt-6 inline-flex rounded-xl bg-brand px-5 py-3 text-sm font-bold text-white"
        >
          تصفح المحلات
        </Link>
      </div>
    );
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    if (store!.minOrder > 0 && subtotal < store!.minOrder) {
      setError(
        `الحد الأدنى للطلب من ${store!.name} هو ${formatPrice(store!.minOrder)}`
      );
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          village,
          storeId: store!.id,
          storeName: store!.name,
          items,
          subtotal,
          deliveryFee,
          total,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "فشل إرسال الطلب");
      clearCart();
      const token = data.trackToken
        ? `&t=${encodeURIComponent(data.trackToken)}`
        : "";
      router.push(`/track/${data.order.id}?new=1${token}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "حدث خطأ");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="mb-8 animate-fade-up">
        <p className="text-sm text-brand mb-1">خطوة أخيرة</p>
        <h1 className="font-display text-3xl font-bold">إتمام الطلب</h1>
        <p className="mt-2 text-muted">بدون تسجيل — فقط بيانات التوصيل</p>

        <div className="mt-6 flex items-center gap-2">
          {steps.map((step, i) => (
            <div key={step} className="flex flex-1 items-center gap-2">
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                  i < 2
                    ? "bg-brand text-white"
                    : "bg-surface-3 text-soft"
                }`}
              >
                {i < 1 ? "✓" : i + 1}
              </div>
              <span
                className={`text-xs sm:text-sm ${
                  i === 1 ? "font-semibold text-ink" : "text-muted"
                }`}
              >
                {step}
              </span>
              {i < steps.length - 1 && (
                <div className="mx-1 hidden h-px flex-1 bg-border sm:block" />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-5">
        <form onSubmit={onSubmit} className="space-y-5 lg:col-span-3 animate-fade-up">
          <div className="rounded-2xl border border-border bg-surface p-5 space-y-4">
            <h2 className="font-semibold text-ink">بيانات الزبون</h2>
            <label className="block space-y-1.5">
              <span className="text-sm text-muted">الاسم الكامل</span>
              <input
                required
                value={form.customerName}
                onChange={(e) =>
                  setForm((f) => ({ ...f, customerName: e.target.value }))
                }
                className="field w-full rounded-xl border border-border bg-surface-2 px-4 py-3 outline-none"
                placeholder="مثال: أحمد محمد"
              />
            </label>
            <label className="block space-y-1.5">
              <span className="text-sm text-muted">رقم التلفون</span>
              <input
                required
                type="tel"
                inputMode="tel"
                value={form.phone}
                onChange={(e) =>
                  setForm((f) => ({ ...f, phone: e.target.value }))
                }
                className="field w-full rounded-xl border border-border bg-surface-2 px-4 py-3 outline-none"
                placeholder="05XXXXXXXX"
              />
            </label>
            <label className="block space-y-1.5">
              <span className="text-sm text-muted">القرية / البلدة</span>
              <select
                value={village}
                onChange={(e) => setVillage(e.target.value as VillageName)}
                className="field w-full rounded-xl border border-border bg-surface-2 px-4 py-3 outline-none"
              >
                {deliveryZones.map((z) => (
                  <option key={z.name} value={z.name}>
                    {z.name} — توصيل {z.fee} ₪
                  </option>
                ))}
              </select>
            </label>
            <label className="block space-y-1.5">
              <span className="text-sm text-muted">العنوان بالتفصيل</span>
              <textarea
                required
                rows={3}
                value={form.address}
                onChange={(e) =>
                  setForm((f) => ({ ...f, address: e.target.value }))
                }
                className="field w-full rounded-xl border border-border bg-surface-2 px-4 py-3 outline-none"
                placeholder="الحي، الشارع، معلم قريب..."
              />
            </label>
            <label className="block space-y-1.5">
              <span className="text-sm text-muted">ملاحظات للطلب (اختياري)</span>
              <textarea
                rows={2}
                value={form.notes}
                onChange={(e) =>
                  setForm((f) => ({ ...f, notes: e.target.value }))
                }
                className="field w-full rounded-xl border border-border bg-surface-2 px-4 py-3 outline-none"
                placeholder="مثال: بدون بصل، اتصل قبل الوصول..."
              />
            </label>
          </div>

          <div className="rounded-2xl border border-border bg-surface p-5">
            <h2 className="font-semibold text-ink mb-3">طريقة الدفع</h2>
            <div className="flex items-center gap-3 rounded-xl border border-brand/40 bg-brand/10 px-4 py-3.5">
              <span className="text-2xl">💵</span>
              <div>
                <p className="font-semibold text-ink">الدفع عند الاستلام</p>
                <p className="text-xs text-muted">كاش للمندوب عند باب البيت</p>
              </div>
              <span className="mr-auto rounded-full bg-success/15 px-2.5 py-1 text-[11px] font-semibold text-success">
                مفعّل
              </span>
            </div>
          </div>

          {error && (
            <p className="rounded-xl border border-danger/40 bg-danger/10 px-4 py-3 text-sm text-danger animate-fade-up">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-press w-full rounded-xl bg-brand py-4 text-sm font-bold text-white glow-brand hover:bg-brand-hover disabled:opacity-60"
          >
            {loading ? (
              <span className="inline-flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                جارٍ إرسال الطلب...
              </span>
            ) : priceAtDelivery ? (
              `تأكيد الطلب • توصيل ${formatPrice(deliveryFee)}`
            ) : (
              `تأكيد الطلب • ${formatPrice(total)}`
            )}
          </button>
        </form>

        <aside className="lg:col-span-2 animate-fade-up animate-delay-1">
          <div className="sticky top-24 rounded-2xl border border-border bg-surface p-5 space-y-4">
            <div className="flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={store.coverImage}
                alt=""
                className="h-12 w-12 rounded-xl object-cover"
              />
              <div>
                <p className="text-xs text-muted">الطلب من</p>
                <p className="font-semibold text-ink">{store.name}</p>
              </div>
            </div>
            <ul className="max-h-64 space-y-3 overflow-y-auto border-y border-border py-4">
              {items.map((line) => (
                <li
                  key={line.lineId}
                  className="flex justify-between gap-3 text-sm"
                >
                  <span className="text-muted">
                    {line.priceAtDelivery
                      ? `${line.name} — ${formatCartLineRequest(line)}`
                      : `${line.quantity}× ${line.name}${
                          line.sizeLabel ? ` (${line.sizeLabel})` : ""
                        }`}
                  </span>
                  <span className="font-mono text-ink shrink-0">
                    {line.priceAtDelivery
                      ? "عند التوصيل"
                      : formatPrice(line.price * line.quantity)}
                  </span>
                </li>
              ))}
            </ul>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-muted">
                <span>المجموع</span>
                <span className="font-mono text-ink">
                  {priceAtDelivery ? "عند التوصيل" : formatPrice(subtotal)}
                </span>
              </div>
              <div className="flex justify-between text-muted">
                <span>التوصيل ({village})</span>
                <span className="font-mono text-ink">
                  {formatPrice(deliveryFee)}
                </span>
              </div>
              <div className="flex justify-between text-base font-bold pt-1">
                <span>الإجمالي</span>
                <span className="font-mono text-brand text-lg text-left">
                  {priceAtDelivery
                    ? `توصيل ${formatPrice(deliveryFee)} + الأصناف عند التوصيل`
                    : formatPrice(total)}
                </span>
              </div>
              {priceAtDelivery && (
                <p className="rounded-lg bg-amber/10 px-3 py-2 text-xs text-amber">
                  السعر النهائي للأصناف يُحسب عند التوصيل حسب سعر السوق.
                </p>
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
