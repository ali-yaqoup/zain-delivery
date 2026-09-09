"use client";

import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { formatPrice } from "@/lib/stores";
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

export default function TrackOrderClient() {
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const isNew = searchParams.get("new") === "1";
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;
    let first = true;
    async function load() {
      if (first) setLoading(true);
      try {
        const res = await fetch(`/api/orders/${encodeURIComponent(params.id)}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "الطلب غير موجود");
        if (alive) {
          setOrder(data.order);
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
  }, [params.id]);

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

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      {isNew && (
        <div className="mb-6 rounded-2xl border border-success/40 bg-success/10 px-4 py-3 text-sm text-success">
          تم إرسال طلبك بنجاح! احفظ رقم الطلب للمتابعة.
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
            {order.village} — {order.address}
          </p>
        </div>

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
                {line.quantity}× {line.name}
                {line.sizeLabel ? ` (${line.sizeLabel})` : ""}
              </span>
              <span className="font-mono text-ink">
                {formatPrice(line.price * line.quantity)}
              </span>
            </li>
          ))}
        </ul>

        <div className="flex justify-between font-bold">
          <span>الإجمالي (كاش عند الاستلام)</span>
          <span className="font-mono text-brand">{formatPrice(order.total)}</span>
        </div>
      </div>
    </div>
  );
}
