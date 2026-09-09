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
import type { CartLine, MenuItem, MenuSize, Store } from "@/lib/types";

type AddItemOptions = {
  size?: MenuSize;
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
  addItem: (store: Store, item: MenuItem, options?: AddItemOptions) => void;
  setQuantity: (lineId: string, quantity: number) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "zain-cart-v3";

type PersistedCart = {
  storeId: string | null;
  items: CartLine[];
  village?: VillageName;
};

function makeLine(
  store: Store,
  item: MenuItem,
  size?: MenuSize
): CartLine | null {
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
      const raw = localStorage.getItem(STORAGE_KEY);
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
    (nextStore: Store, item: MenuItem, options?: AddItemOptions) => {
      const line = makeLine(nextStore, item, options?.size);
      if (!line) return;

      setStoreId((currentStoreId) => {
        if (currentStoreId && currentStoreId !== nextStore.id) {
          const ok = window.confirm(
            "سلتك من محل آخر. هل تريد مسحها والطلب من هذا المحل؟"
          );
          if (!ok) return currentStoreId;
          setItems([{ ...line }]);
          setIsOpen(true);
          return nextStore.id;
        }

        setItems((prev) => {
          const existing = prev.find((l) => l.lineId === line.lineId);
          if (existing) {
            return prev.map((l) =>
              l.lineId === line.lineId
                ? { ...l, quantity: l.quantity + 1 }
                : l
            );
          }
          return [...prev, line];
        });
        setIsOpen(true);
        return nextStore.id;
      });
    },
    []
  );

  const setQuantity = useCallback((lineId: string, quantity: number) => {
    setItems((prev) => {
      if (quantity <= 0) {
        const next = prev.filter((line) => line.lineId !== lineId);
        if (next.length === 0) setStoreId(null);
        return next;
      }
      return prev.map((line) =>
        line.lineId === lineId ? { ...line, quantity } : line
      );
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
  const itemCount = items.reduce((sum, line) => sum + line.quantity, 0);

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
    clearCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
