"use client";

import { useEffect, useState } from "react";
import type { CartLine, FlexibleOrderMode, MenuItem, Store } from "@/lib/types";
import { formatCartLineRequest, formatQty } from "@/lib/stores";

type Props = {
  store: Store;
  item: MenuItem;
  existing?: CartLine;
  onAdd: (payload: {
    orderMode: FlexibleOrderMode;
    quantity?: number;
    budgetAmount?: number;
    requestNote?: string;
  }) => void;
  onRemove?: () => void;
};

const QTY_PRESETS = [0.5, 1, 2, 3, 5];
const BUDGET_PRESETS = [5, 10, 15, 20, 30];

export function FlexibleItemOrder({
  store: _store,
  item,
  existing,
  onAdd,
  onRemove,
}: Props) {
  const [mode, setMode] = useState<FlexibleOrderMode>(
    existing?.orderMode === "budget" ? "budget" : "quantity"
  );
  const [qty, setQty] = useState(
    existing?.orderMode === "budget" ? 1 : existing?.quantity || 1
  );
  const [budget, setBudget] = useState(existing?.budgetAmount || 10);
  const [note, setNote] = useState(existing?.requestNote || "");

  useEffect(() => {
    if (!existing) return;
    setMode(existing.orderMode === "budget" ? "budget" : "quantity");
    setQty(existing.orderMode === "budget" ? 1 : existing.quantity || 1);
    setBudget(existing.budgetAmount || 10);
    setNote(existing.requestNote || "");
  }, [existing]);

  const unit = item.unit || "وحدة";
  const activeValue = mode === "budget" ? budget : qty;
  const presets = mode === "budget" ? BUDGET_PRESETS : QTY_PRESETS;

  function submit() {
    const requestNote = note.trim() || undefined;
    if (mode === "budget") {
      if (!Number.isFinite(budget) || budget < 1) return;
      onAdd({ orderMode: "budget", budgetAmount: budget, requestNote });
      return;
    }
    if (!Number.isFinite(qty) || qty <= 0) return;
    onAdd({ orderMode: "quantity", quantity: qty, requestNote });
  }

  function onValueChange(raw: string) {
    const cleaned = raw.replace(/[^\d.]/g, "");
    if (cleaned === "" || cleaned === ".") {
      if (mode === "budget") setBudget(1);
      else setQty(0.25);
      return;
    }
    const n = Number(cleaned);
    if (!Number.isFinite(n)) return;
    if (mode === "budget") {
      setBudget(Math.min(500, Math.max(1, Math.round(n * 100) / 100)));
    } else {
      setQty(Math.min(99, Math.max(0.25, Math.round(n * 100) / 100)));
    }
  }

  return (
    <div className="mt-2 space-y-2.5 border-t border-border/70 pt-2.5">
      <div className="flex gap-4 text-xs">
        <button
          type="button"
          onClick={() => setMode("quantity")}
          className={`pb-0.5 font-semibold transition ${
            mode === "quantity"
              ? "border-b-2 border-brand text-brand"
              : "text-soft hover:text-ink"
          }`}
        >
          كمية تقريبية
        </button>
        <button
          type="button"
          onClick={() => setMode("budget")}
          className={`pb-0.5 font-semibold transition ${
            mode === "budget"
              ? "border-b-2 border-brand text-brand"
              : "text-soft hover:text-ink"
          }`}
        >
          بمبلغ
        </button>
      </div>

      <div className="relative">
        <input
          type="text"
          inputMode="decimal"
          value={formatQty(activeValue)}
          onChange={(e) => onValueChange(e.target.value)}
          className="field w-full rounded-xl border border-border bg-surface-2 py-2.5 pr-3 pl-16 text-sm font-mono font-semibold text-ink outline-none"
          aria-label={mode === "budget" ? "المبلغ" : "الكمية"}
        />
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs font-medium text-muted">
          {mode === "budget" ? "₪" : unit}
        </span>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {presets.map((p) => {
          const selected =
            mode === "budget"
              ? budget === p
              : Math.abs(qty - p) < 0.001;
          return (
            <button
              key={p}
              type="button"
              onClick={() =>
                mode === "budget" ? setBudget(p) : setQty(p)
              }
              className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold transition ${
                selected
                  ? "bg-brand text-white"
                  : "bg-surface-2 text-muted hover:text-ink"
              }`}
            >
              {mode === "budget"
                ? `${p} ₪`
                : p === 0.5
                  ? `نص ${unit}`
                  : `${formatQty(p)} ${unit}`}
            </button>
          );
        })}
      </div>

      <input
        type="text"
        value={note}
        onChange={(e) => setNote(e.target.value.slice(0, 80))}
        placeholder="ملاحظة (اختياري)"
        className="field w-full rounded-xl border border-border bg-surface px-3 py-2 text-xs outline-none"
      />

      {existing && (
        <p className="text-[11px] text-brand">
          في السلة: {formatCartLineRequest(existing)}
        </p>
      )}

      <div className="flex gap-2">
        <button
          type="button"
          onClick={submit}
          className="btn-press flex-1 rounded-xl bg-brand py-2 text-xs font-bold text-white hover:bg-brand-hover"
        >
          {existing ? "تحديث" : "أضف للسلة"}
        </button>
        {existing && onRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="rounded-xl border border-border px-3 py-2 text-xs text-soft hover:text-danger"
          >
            حذف
          </button>
        )}
      </div>
    </div>
  );
}
