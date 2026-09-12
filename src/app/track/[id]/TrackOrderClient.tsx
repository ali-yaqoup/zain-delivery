"use client";

import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { formatCartLineRequest, formatPrice } from "@/lib/stores";
import type { Order, OrderStatus } from "@/lib/types";

const STATUS_STEPS: { key: OrderStatus; label: string }[] = [
  { key: "new", label: "استلمنا طلبك" },
  { key: "confirmed", label: "تم التأكيد" },
  { key: "preparing", label: "قيد التحضير" },
  { key: "on_the_way", label: "في الطريق إليك" },
  { key: "delivered", label: "تم التسليم" },
];

const STATUS_ORDER: OrderStatus[] = [
  "new",
  "confirmed",
  "preparing",
  "on_the_way",
  "delivered",
];

type TrackOrder = Order & { redacted?: boolean };

export default function TrackOrderClient() {
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const isNew = searchParams.get("new") === "1";
  const urlToken = searchParams.get("t") || "";
  const [order, setOrder] = useState<TrackOrder | null>(null);
  const [access, setAccess] = useState<"public" | "full">("public");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [phoneUnlock, setPhoneUnlock] = useState("");
  const [unlockError, setUnlockError] = useState("");
  const [token, setToken] = useState(urlToken);

  useEffect(() => {
    setToken(urlToken);
  }, [urlToken]);

  useEffect(() => {
    let alive = true;
    let first = true;
    async function load() {
      if (first) setLoading(true);
      try {
        const qs = new URLSearchParams();
        if (token) qs.set("t", token);
        const res = await fetch(
          `/api/orders/${encodeURIComponent(params.id)}${
            qs.toString() ? `?${qs.toString()}` : ""
          }`
        );
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "الطلب غير موجود");
        if (alive) {
          setOrder(data.order);
          setAccess(data.access === "full" ? "full" : "public");
          setError("");
        }
      } catch (err) {
        if (alive) setError(err instanceof Error ? err.message : "خطأ");
      } finally {
        if (alive) {
          setLoading(false);
          first = false;
        }
      }
    }
    load();
    const timer = setInterval(load, 15000);
    return () => {
      alive = false;
      clearInterval(timer);
    };
  }, [params.id, token]);

  async function onUnlock(e: FormEvent) {
    e.preventDefault();
    setUnlockError("");
    const phone = phoneUnlock.trim();
    if (!phone) {
      setUnlockError("أدخل رقم الهاتف المستخدم في الطلب");
      return;
    }
    try {
      const res = await fetch(
        `/api/orders/${encodeURIComponent(params.id)}?phone=${encodeURIComponent(phone)}`
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "تعذر التحقق");
      if (data.access !== "full") {
        setUnlockError("رقم الهاتف غير مطابق لهذا الطلب");
        return;
      }
      setOrder(data.order);
      setAccess("full");
    } catch (err) {
      setUnlockError(err instanceof Error ? err.message : "تعذر التحقق");
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center text-muted">
        جارٍ تحميل الطلب...
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <h1 className="font-display text-2xl font-bold">ما لقينا الطلب</h1>
        <p className="mt-2 text-muted">{error}</p>
        <Link href="/track" className="mt-4 inline-block text-brand">
          جرّب رقم تاني
        </Link>
      </div>
    );
  }

  const currentIndex =
    order.status === "cancelled" ? -1 : STATUS_ORDER.indexOf(order.status);
  const isRedacted = access !== "full";

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      {isNew && (
        <div className="mb-6 rounded-2xl border border-success/40 bg-success/10 px-4 py-3 text-sm text-success">
          تم إرسال طلبك بنجاح! احفظ رابط التتبع أو رقم الطلب للمتابعة.
        </div>
      )}

      <div className="rounded-3xl border border-border bg-surface p-6 space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-sm text-muted">رقم الطلب</p>
            <p className="font-mono text-2xl font-bold text-brand">{order.id}</p>
          </div>
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${
              order.status === "cancelled"
                ? "bg-danger/15 text-danger"
                : order.status === "delivered"
                  ? "bg-success/15 text-success"
                  : "bg-brand/15 text-brand"
            }`}
          >
            {order.status === "cancelled"
              ? "ملغي"
              : STATUS_STEPS.find((s) => s.key === order.status)?.label}
          </span>
        </div>

        <div>
          <p className="text-sm text-muted mb-1">من</p>
          <p className="font-semibold">{order.storeName}</p>
          <p className="text-sm text-muted mt-2">
            {order.customerName} • {order.phone}
          </p>
          <p className="text-sm text-muted">
            {order.village}
            {isRedacted ? " — عنوان مخفي لحماية الخصوصية" : ` — ${order.address}`}
          </p>
        </div>

        {isRedacted && (
          <form
            onSubmit={onUnlock}
            className="rounded-2xl border border-border bg-surface-2 p-4 space-y-3"
          >
            <p className="text-sm text-muted">
              لعرض الاسم والعنوان ورقم الهاتف كاملًا، أدخل رقم الهاتف المستخدم عند الطلب.
            </p>
            <input
              value={phoneUnlock}
              onChange={(e) => setPhoneUnlock(e.target.value)}
              placeholder="رقم الهاتف"
              inputMode="tel"
              autoComplete="tel"
              className="field w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-sm"
            />
            {unlockError && (
              <p className="text-xs text-danger">{unlockError}</p>
            )}
            <button
              type="submit"
              className="btn-press rounded-xl bg-brand px-4 py-2 text-sm font-bold text-white"
            >
              إظهار التفاصيل
            </button>
          </form>
        )}

        {order.status !== "cancelled" && (
          <ol className="space-y-3">
            {STATUS_STEPS.map((step, index) => {
              const done = index <= currentIndex;
              const active = index === currentIndex;
              return (
                <li key={step.key} className="flex items-center gap-3">
                  <span
                    className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
                      done
                        ? active
                          ? "bg-brand text-white"
                          : "bg-success text-white"
                        : "bg-surface-3 text-soft"
                    }`}
                  >
                    {done && !active ? "✓" : index + 1}
                  </span>
                  <span className={done ? "text-ink" : "text-soft"}>
                    {step.label}
                  </span>
                </li>
              );
            })}
          </ol>
        )}

        <ul className="space-y-2 border-t border-border pt-4">
          {order.items.map((line) => (
            <li
              key={line.lineId || line.itemId}
              className="flex justify-between text-sm text-muted"
            >
              <span>
                {line.priceAtDelivery
                  ? `${line.name} — ${formatCartLineRequest(line)}`
                  : `${line.quantity}× ${line.name}${
                      line.sizeLabel ? ` (${line.sizeLabel})` : ""
                    }`}
              </span>
              <span className="font-mono text-ink">
                {line.priceAtDelivery
                  ? "عند التوصيل"
                  : formatPrice(line.price * line.quantity)}
              </span>
            </li>
          ))}
        </ul>

        <div className="flex justify-between font-bold gap-3">
          <span>الإجمالي (كاش عند الاستلام)</span>
          <span className="font-mono text-brand text-left">
            {order.items.some((l) => l.priceAtDelivery)
              ? `توصيل ${formatPrice(order.deliveryFee)} + الأصناف عند التوصيل`
              : formatPrice(order.total)}
          </span>
        </div>
      </div>
    </div>
  );
}
