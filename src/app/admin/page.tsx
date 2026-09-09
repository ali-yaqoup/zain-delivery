"use client";

import Link from "next/link";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { formatPrice } from "@/lib/stores";
import type { Order, OrderStatus } from "@/lib/types";
import {
  AdminSettingsPanel,
  ADMIN_SETTINGS_SECTIONS,
  type AdminSettingsSection,
} from "@/components/AdminSettingsPanel";
import { BrandMark } from "@/components/icons";

const ADMIN_KEY_STORAGE = "zain-admin-key";

function readAdminKey() {
  try {
    return sessionStorage.getItem(ADMIN_KEY_STORAGE) || "";
  } catch {
    return "";
  }
}

function writeAdminKey(value: string) {
  try {
    sessionStorage.setItem(ADMIN_KEY_STORAGE, value);
  } catch {
    /* ignore */
  }
}

function clearAdminKey() {
  try {
    sessionStorage.removeItem(ADMIN_KEY_STORAGE);
    localStorage.removeItem(ADMIN_KEY_STORAGE);
  } catch {
    /* ignore */
  }
}

type AdminTab = "orders" | "settings";

const STATUS_LABELS: Record<OrderStatus, string> = {
  new: "جديد",
  confirmed: "مؤكد",
  preparing: "تحضير",
  on_the_way: "في الطريق",
  delivered: "تم التسليم",
  cancelled: "ملغي",
};

const NEXT_STATUSES: OrderStatus[] = [
  "new",
  "confirmed",
  "preparing",
  "on_the_way",
  "delivered",
  "cancelled",
];

function navBtnClass(active: boolean) {
  return `flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-sm transition ${
    active
      ? "bg-brand text-white font-semibold"
      : "text-muted hover:bg-surface-2 hover:text-ink"
  }`;
}

export default function AdminPage() {
  const [key, setKey] = useState("");
  const [authed, setAuthed] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<"all" | "active" | "done">("active");
  const [tab, setTab] = useState<AdminTab>("orders");
  const [settingsSection, setSettingsSection] =
    useState<AdminSettingsSection>("brand");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const loadOrders = useCallback(
    async (adminKey: string) => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch("/api/orders", {
          headers: { "x-admin-key": adminKey },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "فشل التحميل");
        setOrders(data.orders);
        setAuthed(true);
        writeAdminKey(adminKey);
      } catch (err) {
        setAuthed(false);
        setError(err instanceof Error ? err.message : "خطأ");
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    const saved = readAdminKey();
    if (saved) {
      setKey(saved);
      loadOrders(saved);
    }
  }, [loadOrders]);

  useEffect(() => {
    if (!authed) return;
    const timer = setInterval(() => loadOrders(key), 10000);
    return () => clearInterval(timer);
  }, [authed, key, loadOrders]);

  async function onLogin(e: FormEvent) {
    e.preventDefault();
    await loadOrders(key.trim());
  }

  async function updateStatus(id: string, status: OrderStatus) {
    const res = await fetch(`/api/orders/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "x-admin-key": key,
      },
      body: JSON.stringify({ status }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "فشل التحديث");
      return;
    }
    setOrders((prev) => prev.map((o) => (o.id === id ? data.order : o)));
  }

  const filtered = useMemo(() => {
    if (filter === "all") return orders;
    if (filter === "done") {
      return orders.filter(
        (o) => o.status === "delivered" || o.status === "cancelled"
      );
    }
    return orders.filter(
      (o) => o.status !== "delivered" && o.status !== "cancelled"
    );
  }, [orders, filter]);

  const todayStats = useMemo(() => {
    const now = new Date();
    const isToday = (iso: string) => {
      const d = new Date(iso);
      return (
        d.getFullYear() === now.getFullYear() &&
        d.getMonth() === now.getMonth() &&
        d.getDate() === now.getDate()
      );
    };

    const todayOrders = orders.filter(
      (o) => isToday(o.createdAt) && o.status !== "cancelled"
    );
    const profit = todayOrders.reduce((sum, o) => sum + o.deliveryFee, 0);

    return {
      count: todayOrders.length,
      profit,
    };
  }, [orders]);

  const newCount = orders.filter((o) => o.status === "new").length;

  function goOrders() {
    setTab("orders");
    setMobileNavOpen(false);
  }

  function goSettings(section: AdminSettingsSection = "brand") {
    setTab("settings");
    setSettingsSection(section);
    setMobileNavOpen(false);
  }

  function logout() {
    clearAdminKey();
    setKey("");
    setOrders([]);
    setAuthed(false);
  }

  const sidebarNav = (
    <nav className="flex flex-1 flex-col gap-1 p-3">
      <p className="mb-1 px-3 text-[11px] font-semibold uppercase tracking-wide text-soft">
        الرئيسية
      </p>
      <button type="button" onClick={goOrders} className={navBtnClass(tab === "orders")}>
        <span>الطلبات</span>
        {newCount > 0 && (
          <span
            className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${
              tab === "orders" ? "bg-white/20 text-white" : "bg-brand/20 text-brand"
            }`}
          >
            {newCount}
          </span>
        )}
      </button>

      <p className="mb-1 mt-4 px-3 text-[11px] font-semibold uppercase tracking-wide text-soft">
        تعديل الموقع
      </p>
      {ADMIN_SETTINGS_SECTIONS.map((s) => (
        <button
          key={s.id}
          type="button"
          onClick={() => goSettings(s.id)}
          className={navBtnClass(tab === "settings" && settingsSection === s.id)}
        >
          <span>{s.label}</span>
        </button>
      ))}

      <div className="mt-auto space-y-1 border-t border-border pt-3">
        <Link
          href="/"
          className="flex w-full rounded-xl px-3 py-2.5 text-sm text-muted hover:bg-surface-2 hover:text-ink"
        >
          عرض الموقع
        </Link>
        <button
          type="button"
          onClick={logout}
          className="flex w-full rounded-xl px-3 py-2.5 text-sm text-danger hover:bg-danger/10"
        >
          خروج
        </button>
      </div>
    </nav>
  );

  if (!authed) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <form
          onSubmit={onLogin}
          className="w-full max-w-md space-y-4 rounded-3xl border border-border bg-surface p-8"
        >
          <div className="text-center">
            <BrandMark size={48} iconSize={34} className="mx-auto mb-3" />
            <h1 className="font-display text-2xl font-bold">لوحة زين</h1>
            <p className="mt-1 text-sm text-muted">
              إدارة طلبات التوصيل — للكابتن فقط
            </p>
          </div>
          <input
            type="password"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            placeholder="كلمة مرور اللوحة"
            className="w-full rounded-xl border border-border bg-surface-2 px-4 py-3 outline-none focus:border-brand"
          />
          {error && <p className="text-sm text-danger">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-brand py-3 font-bold text-white hover:bg-brand-hover disabled:opacity-60"
          >
            {loading ? "جارٍ الدخول..." : "دخول"}
          </button>
          <Link href="/" className="block text-center text-xs text-soft">
            العودة للموقع
          </Link>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-canvas lg:flex">
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-e border-border bg-surface lg:flex">
        <div className="border-b border-border px-4 py-5">
          <div className="flex items-center gap-3">
            <BrandMark size={40} iconSize={28} className="shadow-none" />
            <div>
              <p className="font-display text-sm font-bold">لوحة زين</p>
              <p className="text-[11px] text-soft">إدارة الموقع والطلبات</p>
            </div>
          </div>
        </div>
        {sidebarNav}
      </aside>

      {/* Mobile drawer */}
      {mobileNavOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/60"
            aria-label="إغلاق القائمة"
            onClick={() => setMobileNavOpen(false)}
          />
          <aside className="absolute inset-y-0 end-0 flex h-full w-[min(18rem,88vw)] flex-col border-s border-border bg-surface shadow-2xl">
            <div className="flex items-center justify-between border-b border-border px-4 py-4">
              <p className="font-display font-bold">القائمة</p>
              <button
                type="button"
                onClick={() => setMobileNavOpen(false)}
                className="rounded-lg border border-border px-2.5 py-1 text-sm text-muted"
              >
                إغلاق
              </button>
            </div>
            {sidebarNav}
          </aside>
        </div>
      )}

      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-30 border-b border-border bg-surface/95 backdrop-blur">
          <div className="flex items-center justify-between gap-3 px-4 py-3 sm:px-6">
            <div className="flex min-w-0 items-center gap-3">
              <button
                type="button"
                onClick={() => setMobileNavOpen(true)}
                className="rounded-xl border border-border bg-surface-2 px-3 py-2 text-sm lg:hidden"
              >
                القائمة
              </button>
              <div className="min-w-0">
                <h1 className="truncate font-display text-lg font-bold sm:text-xl">
                  {tab === "orders"
                    ? "الطلبات"
                    : ADMIN_SETTINGS_SECTIONS.find((s) => s.id === settingsSection)
                        ?.label || "تعديل الموقع"}
                </h1>
                <p className="truncate text-xs text-muted">
                  {tab === "orders"
                    ? newCount > 0
                      ? `${newCount} طلب جديد بانتظارك`
                      : "ما في طلبات جديدة"
                    : "عدّل محتوى الموقع من السايدبار"}
                </p>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              {tab === "orders" && (
                <button
                  type="button"
                  onClick={() => loadOrders(key)}
                  className="rounded-xl border border-border bg-surface-2 px-3 py-2 text-sm"
                >
                  تحديث
                </button>
              )}
              <button
                type="button"
                onClick={logout}
                className="hidden rounded-xl border border-border px-3 py-2 text-sm text-muted sm:inline-flex"
              >
                خروج
              </button>
            </div>
          </div>

          {/* Mobile quick tabs */}
          <div className="chip-scroll flex gap-1.5 overflow-x-auto border-t border-border/70 px-4 py-2 lg:hidden">
            <button
              type="button"
              onClick={goOrders}
              className={`whitespace-nowrap rounded-full px-3.5 py-1.5 text-xs ${
                tab === "orders"
                  ? "bg-brand text-white"
                  : "bg-surface-2 text-muted"
              }`}
            >
              الطلبات
              {newCount > 0 ? ` (${newCount})` : ""}
            </button>
            {ADMIN_SETTINGS_SECTIONS.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => goSettings(s.id)}
                className={`whitespace-nowrap rounded-full px-3.5 py-1.5 text-xs ${
                  tab === "settings" && settingsSection === s.id
                    ? "bg-brand text-white"
                    : "bg-surface-2 text-muted"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </header>

        <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
          {tab === "settings" ? (
            <AdminSettingsPanel
              adminKey={key}
              section={settingsSection}
            />
          ) : (
            <>
              <div className="mb-5 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-border bg-surface p-4">
                  <p className="text-xs text-soft">طلبات اليوم</p>
                  <p className="mt-1 font-display text-3xl font-extrabold text-ink">
                    {todayStats.count}
                  </p>
                  <p className="mt-1 text-xs text-muted">بدون الملغاة</p>
                </div>
                <div className="rounded-2xl border border-brand/30 bg-brand/10 p-4">
                  <p className="text-xs text-soft">أرباح التوصيل اليوم</p>
                  <p className="mt-1 font-display text-3xl font-extrabold text-brand">
                    {formatPrice(todayStats.profit)}
                  </p>
                  <p className="mt-1 text-xs text-muted">
                    مجموع رسوم التوصيل لطلبات اليوم
                  </p>
                </div>
              </div>

              <div className="mb-5 flex flex-wrap gap-2">
                {(
                  [
                    ["active", "نشطة"],
                    ["all", "الكل"],
                    ["done", "منتهية"],
                  ] as const
                ).map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setFilter(value)}
                    className={`rounded-full px-4 py-1.5 text-sm ${
                      filter === value
                        ? "bg-brand text-white"
                        : "bg-surface text-muted border border-border"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {error && (
                <p className="mb-4 rounded-xl border border-danger/30 bg-danger/10 px-4 py-2 text-sm text-danger">
                  {error}
                </p>
              )}

              {filtered.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-border-strong p-12 text-center text-muted">
                  ما في طلبات هنا حالياً
                </div>
              ) : (
                <div className="space-y-4">
                  {filtered.map((order) => (
                    <article
                      key={order.id}
                      className={`rounded-2xl border bg-surface p-5 ${
                        order.status === "new"
                          ? "border-brand/50 shadow-[0_0_24px_rgba(255,107,0,0.12)]"
                          : "border-border"
                      }`}
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="font-mono text-lg font-bold text-brand">
                            {order.id}
                          </p>
                          <p className="text-sm text-ink font-semibold mt-1">
                            {order.storeName}
                          </p>
                          <p className="text-xs text-soft mt-1">
                            {new Date(order.createdAt).toLocaleString("ar-PS")}
                          </p>
                        </div>
                        <span className="rounded-full bg-surface-2 px-3 py-1 text-xs">
                          {STATUS_LABELS[order.status]}
                        </span>
                      </div>

                      <div className="mt-4 grid gap-3 sm:grid-cols-2">
                        <div className="rounded-xl bg-surface-2 p-3 text-sm">
                          <p className="font-semibold">{order.customerName}</p>
                          <a
                            href={`tel:${order.phone}`}
                            className="text-brand hover:underline"
                          >
                            {order.phone}
                          </a>
                          <p className="mt-2 text-muted">
                            {order.village} — {order.address}
                          </p>
                          {order.notes && (
                            <p className="mt-2 text-amber text-xs">
                              ملاحظة: {order.notes}
                            </p>
                          )}
                        </div>
                        <div className="rounded-xl bg-surface-2 p-3 text-sm space-y-1">
                          {order.items.map((line) => (
                            <div
                              key={line.lineId || line.itemId}
                              className="flex justify-between gap-2 text-muted"
                            >
                              <span>
                                {line.quantity}× {line.name}
                                {line.sizeLabel ? ` (${line.sizeLabel})` : ""}
                              </span>
                              <span className="font-mono text-ink">
                                {formatPrice(line.price * line.quantity)}
                              </span>
                            </div>
                          ))}
                          <div className="border-t border-border pt-2 mt-2 flex justify-between font-bold">
                            <span>كاش عند الاستلام</span>
                            <span className="font-mono text-brand">
                              {formatPrice(order.total)}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 flex flex-wrap gap-2">
                        {NEXT_STATUSES.map((status) => (
                          <button
                            key={status}
                            type="button"
                            disabled={order.status === status}
                            onClick={() => updateStatus(order.id, status)}
                            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                              order.status === status
                                ? "bg-brand text-white"
                                : "border border-border bg-surface-2 text-muted hover:text-ink"
                            }`}
                          >
                            {STATUS_LABELS[status]}
                          </button>
                        ))}
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
