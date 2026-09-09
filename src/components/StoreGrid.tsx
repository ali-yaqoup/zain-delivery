"use client";

import { StoreCard } from "@/components/StoreCard";
import { useSiteSettings } from "@/context/SiteSettingsContext";

export function StoreGrid({ className }: { className?: string }) {
  const { stores } = useSiteSettings();

  return (
    <div className={className ?? "grid gap-6 md:grid-cols-2"}>
      {stores.map((store, i) => (
        <div
          key={store.id}
          className={`animate-fade-up animate-delay-${Math.min(i + 1, 3)}`}
        >
          <StoreCard store={store} />
        </div>
      ))}
    </div>
  );
}
