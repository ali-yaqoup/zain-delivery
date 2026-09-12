"use client";

import { useEffect, useRef, useState } from "react";
import { useCart } from "@/context/CartContext";

const TOAST_MS = 900;

export function AddToast() {
  const { itemCount, store } = useCart();
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState("");
  const prevCount = useRef(0);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (itemCount > prevCount.current && itemCount > 0) {
      setMessage(store ? `تمت الإضافة • ${store.name}` : "تمت الإضافة للسلة");
      setVisible(true);
      if (hideTimer.current) clearTimeout(hideTimer.current);
      hideTimer.current = setTimeout(() => setVisible(false), TOAST_MS);
    }
    prevCount.current = itemCount;
  }, [itemCount, store]);

  useEffect(() => {
    return () => {
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
  }, []);

  if (!visible) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-[calc(5.5rem+env(safe-area-inset-bottom,0px))] z-[60] flex justify-center px-4 md:bottom-8">
      <div className="animate-toast rounded-full border border-brand/35 bg-surface/90 px-3.5 py-1.5 text-xs font-semibold text-brand shadow-lg backdrop-blur-md sm:text-sm">
        ✓ {message}
      </div>
    </div>
  );
}
