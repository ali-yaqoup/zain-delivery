"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function TrackSearchPage() {
  const router = useRouter();
  const [orderId, setOrderId] = useState("");

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const id = orderId.trim();
    if (!id) return;
    router.push(`/track/${encodeURIComponent(id)}`);
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-16 sm:px-6">
      <div className="rounded-3xl border border-border bg-surface p-8 text-center">
        <p className="text-4xl mb-4">📦</p>
        <h1 className="font-display text-2xl font-bold text-ink">تتبع طلبك</h1>
        <p className="mt-2 text-sm text-muted">
          أدخل رقم الطلب اللي وصلك بعد التأكيد
        </p>
        <form onSubmit={onSubmit} className="mt-6 space-y-3 text-right">
          <input
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
            placeholder="مثال: ZN-ABC12"
            className="w-full rounded-xl border border-border bg-surface-2 px-4 py-3 text-center font-mono outline-none focus:border-brand"
          />
          <button
            type="submit"
            className="w-full rounded-xl bg-brand py-3 text-sm font-bold text-white hover:bg-brand-hover"
          >
            عرض حالة الطلب
          </button>
        </form>
        <Link href="/stores" className="mt-6 inline-block text-sm text-brand">
          اطلب من جديد
        </Link>
      </div>
    </div>
  );
}
