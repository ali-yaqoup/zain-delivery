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
import { stores as baseStores } from "@/lib/stores";
import {
  applySiteSettingsToStores,
  defaultSiteSettings,
  feeForVillage,
  type DeliveryZone,
  type SiteSettings,
  type VillageName,
} from "@/lib/site-settings";
import type { Store } from "@/lib/types";

type SiteSettingsContextValue = {
  settings: SiteSettings;
  stores: Store[];
  deliveryZones: DeliveryZone[];
  getDeliveryFee: (village: string) => number;
  minDeliveryFee: number;
  loading: boolean;
  refresh: () => Promise<void>;
  saveSettings: (next: SiteSettings, adminKey: string) => Promise<SiteSettings>;
};

const SiteSettingsContext = createContext<SiteSettingsContextValue | null>(null);

export function SiteSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<SiteSettings>(defaultSiteSettings);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/settings", { cache: "no-store" });
      const data = await res.json();
      if (res.ok && data.settings) setSettings(data.settings);
    } catch {
      /* keep defaults */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const saveSettings = useCallback(
    async (next: SiteSettings, adminKey: string) => {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-admin-key": adminKey,
        },
        body: JSON.stringify({ settings: next }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "فشل الحفظ");
      setSettings(data.settings);
      return data.settings as SiteSettings;
    },
    []
  );

  const stores = useMemo(
    () => applySiteSettingsToStores(baseStores, settings),
    [settings]
  );

  const deliveryZones = settings.deliveryZones;

  const value = useMemo<SiteSettingsContextValue>(
    () => ({
      settings,
      stores,
      deliveryZones,
      getDeliveryFee: (village: string) => feeForVillage(village, deliveryZones),
      minDeliveryFee: Math.min(...deliveryZones.map((z) => z.fee)),
      loading,
      refresh,
      saveSettings,
    }),
    [settings, stores, deliveryZones, loading, refresh, saveSettings]
  );

  return (
    <SiteSettingsContext.Provider value={value}>
      {children}
    </SiteSettingsContext.Provider>
  );
}

export function useSiteSettings() {
  const ctx = useContext(SiteSettingsContext);
  if (!ctx) {
    throw new Error("useSiteSettings must be used within SiteSettingsProvider");
  }
  return ctx;
}

export function useOptionalSiteSettings() {
  return useContext(SiteSettingsContext);
}

export type { VillageName };
