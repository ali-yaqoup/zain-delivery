"use client";

import { useEffect, useState } from "react";
import { useCart } from "@/context/CartContext";

export function AddToast() {
  const { itemCount, store } = useCart();
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState("");
  const [prev, setPrev] = useState(0);

  useEffect(() => {
    if (itemCount > prev && itemCount > 0) {
      setMessage(store ? `تمت الإضافة • ${store.name}` : "تمت الإضافة للسلة");
      setVisible(true);
      const t = setTimeout(() => setVisible(false), 1600);
      setPrev(itemCount);
      return () => clearTimeout(t);
    }
    setPrev(itemCount);
  }, [itemCount, prev, store]);

  if (!visible) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 top-[calc(5.75rem+env(safe-area-inset-top,0px))] z-[60] flex justify-center px-4 sm:top-24">
      <div className="animate-toast rounded-full border border-brand/40 bg-surface/95 px-4 py-2 text-sm font-semibold text-brand shadow-xl backdrop-blur-xl">
        ✓ {message}
      </div>
    </div>
  );
}
