"use client";

import { StoreCard } from "@/components/StoreCard";
import { PartnerInvite } from "@/components/PartnerInvite";
import { useSiteSettings } from "@/context/SiteSettingsContext";

export default function StoresPageClient() {
  const { stores, settings } = useSiteSettings();
  const c = settings.content;

  return (
    <div>
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="mb-8 animate-fade-up">
          <p className="text-sm text-brand mb-1">{c.storesPageEyebrow}</p>
          <h1 className="font-display text-3xl font-bold text-ink">
            {c.storesPageTitle}
          </h1>
          <p className="mt-2 text-muted">{c.storesPageSubtitle}</p>
        </div>

        <div className="mb-6 flex flex-wrap gap-2 animate-fade-up animate-delay-1">
          <span className="rounded-full border border-brand bg-brand/15 px-4 py-1.5 text-sm text-brand">
            الكل ({stores.length})
          </span>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {stores.map((store, i) => (
            <div
              key={store.id}
              className={`animate-fade-up animate-delay-${Math.min(i + 1, 3)}`}
            >
              <StoreCard store={store} />
            </div>
          ))}
        </div>
      </div>
      <PartnerInvite />
    </div>
  );
}
