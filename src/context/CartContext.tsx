"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { DEFAULT_VILLAGE, type VillageName } from "@/lib/stores";
import { useSiteSettings } from "@/context/SiteSettingsContext";
import type {
  CartLine,
  FlexibleOrderMode,
  MenuItem,
  MenuSize,
  Store,
} from "@/lib/types";

export type FlexibleAddOptions = {
  size?: MenuSize;
  orderMode?: FlexibleOrderMode;
  quantity?: number;
  budgetAmount?: number;
  requestNote?: string;
};

type CartContextValue = {
  store: Store | null;
  items: CartLine[];
  itemCount: number;
  subtotal: number;
  deliveryFee: number;
  total: number;
  village: VillageName;
  setVillage: (village: VillageName) => void;
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  addItem: (store: Store, item: MenuItem, options?: FlexibleAddOptions) => void;
  setQuantity: (lineId: string, quantity: number) => void;
  updateLine: (lineId: string, patch: Partial<CartLine>) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "zain-cart-v4";

type PersistedCart = {
  storeId: string | null;
  items: CartLine[];
  village?: VillageName;
};

function clampQty(value: number) {
  if (!Number.isFinite(value) || value <= 0) return 0;
  return Math.min(99, Math.round(value * 100) / 100);
}

function clampBudget(value: number) {
  if (!Number.isFinite(value) || value <= 0) return 0;
  return Math.min(500, Math.round(value * 100) / 100);
}

function makeLine(
  store: Store,
  item: MenuItem,
  options?: FlexibleAddOptions
): CartLine | null {
  const size = options?.size;

  if (item.sizes?.length) {
    if (!size) return null;
    return {
      lineId: `${item.id}:${size.id}`,
      itemId: item.id,
      storeId: store.id,
      name: item.name,
      sizeLabel: size.labelAr,
      price: size.price,
      quantity: 1,
      image: item.image,
    };
  }

  if (item.priceAtDelivery) {
    const orderMode: FlexibleOrderMode =
      options?.orderMode === "budget" ? "budget" : "quantity";
    const requestNote = options?.requestNote?.trim().slice(0, 80) || undefined;

    if (orderMode === "budget") {
      const budgetAmount = clampBudget(options?.budgetAmount ?? 0);
      if (budgetAmount <= 0) return null;
      return {
        lineId: item.id,
        itemId: item.id,
        storeId: store.id,
        name: item.name,
        price: 0,
        quantity: 1,
        image: item.image,
        priceAtDelivery: true,
        unit: item.unit,
        orderMode: "budget",
        budgetAmount,
        requestNote,
      };
    }

    const quantity = clampQty(options?.quantity ?? 1);
    if (quantity <= 0) return null;
    return {
      lineId: item.id,
      itemId: item.id,
      storeId: store.id,
      name: item.name,
      price: 0,
      quantity,
      image: item.image,
      priceAtDelivery: true,
      unit: item.unit,
      orderMode: "quantity",
      requestNote,
    };
  }

  if (typeof item.price !== "number") return null;
  return {
    lineId: item.id,
    itemId: item.id,
    storeId: store.id,
    name: item.name,
    price: item.price,
    quantity: 1,
    image: item.image,
  };
}

export function CartProvider({ children }: { children: ReactNode }) {
  const { stores, getDeliveryFee, settings } = useSiteSettings();
  const [storeId, setStoreId] = useState<string | null>(null);
  const [items, setItems] = useState<CartLine[]>([]);
  const [village, setVillageState] = useState<VillageName>(
    settings.defaultVillage || DEFAULT_VILLAGE
  );
  const [isOpen, setIsOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw =
        localStorage.getItem(STORAGE_KEY) ||
        localStorage.getItem("zain-cart-v3");
      if (raw) {
        const parsed = JSON.parse(raw) as PersistedCart;
        setStoreId(parsed.storeId);
        setItems(parsed.items ?? []);
        if (parsed.village) setVillageState(parsed.village);
      }
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    const zones = settings.deliveryZones;
    if (!zones.some((z) => z.name === village) && zones[0]) {
      setVillageState(zones[0].name);
    }
  }, [settings.deliveryZones, village]);

  useEffect(() => {
    if (!hydrated) return;
    const payload: PersistedCart = { storeId, items, village };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  }, [storeId, items, village, hydrated]);

  const store = useMemo(
    () => stores.find((s) => s.id === storeId) ?? null,
    [stores, storeId]
  );

  const setVillage = useCallback((next: VillageName) => {
    setVillageState(next);
  }, []);

  const addItem = useCallback(
    (nextStore: Store, item: MenuItem, options?: FlexibleAddOptions) => {
      const line = makeLine(nextStore, item, options);
      if (!line) return;

      setStoreId((currentStoreId) => {
        if (currentStoreId && currentStoreId !== nextStore.id) {
          const ok = window.confirm(
            "سلتك من محل آخر. هل تريد مسحها والطلب من هذا المحل؟"
          );
          if (!ok) return currentStoreId;
          setItems([{ ...line }]);
          if (!line.priceAtDelivery) setIsOpen(true);
          return nextStore.id;
        }

        setItems((prev) => {
          const existing = prev.find((l) => l.lineId === line.lineId);
          if (existing) {
            // Flexible items replace request; priced items increment qty
            if (line.priceAtDelivery) {
              return prev.map((l) =>
                l.lineId === line.lineId ? { ...line } : l
              );
            }
            return prev.map((l) =>
              l.lineId === line.lineId
                ? { ...l, quantity: clampQty(l.quantity + 1) || 1 }
                : l
            );
          }
          return [...prev, line];
        });
        if (!line.priceAtDelivery) setIsOpen(true);
        return nextStore.id;
      });
    },
    []
  );

  const setQuantity = useCallback((lineId: string, quantity: number) => {
    setItems((prev) => {
      const nextQty = clampQty(quantity);
      if (nextQty <= 0) {
        const next = prev.filter((line) => line.lineId !== lineId);
        if (next.length === 0) setStoreId(null);
        return next;
      }
      return prev.map((line) => {
        if (line.lineId !== lineId) return line;
        if (line.orderMode === "budget") {
          return { ...line, quantity: 1 };
        }
        return { ...line, quantity: nextQty };
      });
    });
  }, []);

  const updateLine = useCallback((lineId: string, patch: Partial<CartLine>) => {
    setItems((prev) => {
      const next = prev
        .map((line) => {
          if (line.lineId !== lineId) return line;
          const merged: CartLine = { ...line, ...patch };
          if (merged.orderMode === "budget") {
            const budgetAmount = clampBudget(
              Number(merged.budgetAmount ?? line.budgetAmount ?? 0)
            );
            if (budgetAmount <= 0) return null;
            return {
              ...merged,
              quantity: 1,
              budgetAmount,
              orderMode: "budget" as const,
              requestNote: merged.requestNote?.trim().slice(0, 80) || undefined,
            };
          }
          if (merged.priceAtDelivery) {
            const quantity = clampQty(Number(merged.quantity ?? line.quantity));
            if (quantity <= 0) return null;
            return {
              ...merged,
              quantity,
              orderMode: "quantity" as const,
              budgetAmount: undefined,
              requestNote: merged.requestNote?.trim().slice(0, 80) || undefined,
            };
          }
          const quantity = clampQty(Number(merged.quantity ?? line.quantity));
          if (quantity <= 0) return null;
          return { ...merged, quantity };
        })
        .filter(Boolean) as CartLine[];

      if (next.length === 0) setStoreId(null);
      return next;
    });
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
    setStoreId(null);
  }, []);

  const subtotal = items.reduce(
    (sum, line) => sum + line.price * line.quantity,
    0
  );
  const deliveryFee =
    store && items.length > 0 ? getDeliveryFee(village) : 0;
  const total = subtotal + deliveryFee;
  const itemCount = items.reduce((sum, line) => {
    if (line.orderMode === "budget") return sum + 1;
    return sum + line.quantity;
  }, 0);

  const value: CartContextValue = {
    store,
    items,
    itemCount,
    subtotal,
    deliveryFee,
    total,
    village,
    setVillage,
    isOpen,
    openCart: () => setIsOpen(true),
    closeCart: () => setIsOpen(false),
    toggleCart: () => setIsOpen((v) => !v),
    addItem,
    setQuantity,
    updateLine,
    clearCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
