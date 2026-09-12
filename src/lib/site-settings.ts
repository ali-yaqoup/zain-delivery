import type { MenuItem, Store } from "./types";

export type DeliveryZone = {
  name: string;
  fee: number;
};

export type VillageName = string;

export type HomeStep = {
  title: string;
  text: string;
  icon: string;
};

export type StoreProfilePatch = {
  enabled?: boolean;
  name?: string;
  nameEn?: string;
  tagline?: string;
  description?: string;
  rating?: number;
  deliveryMinutes?: string;
  minOrder?: number;
  openHours?: string;
  opensAt?: string;
  closesAt?: string;
  phones?: string[];
  coverImage?: string;
  tags?: string[];
};

export type MutawaOverride = {
  name?: string;
  description?: string;
  price?: number;
  category?: string;
  hidden?: boolean;
};

export type SiteContent = {
  brandNameAr: string;
  brandNameEn: string;
  headerSubtitle: string;
  footerBlurb: string;
  footerServiceLines: string[];
  copyrightSuffix: string;
  heroEyebrow: string;
  heroHeadline: string;
  heroSubcopy: string;
  heroImage: string;
  ctaPrimary: string;
  ctaSecondary: string;
  homeSectionEyebrow: string;
  homeSectionTitle: string;
  homeSectionSubtitle: string;
  homeViewAll: string;
  homeSteps: HomeStep[];
  storesPageEyebrow: string;
  storesPageTitle: string;
  storesPageSubtitle: string;
  paymentNote: string;
  /** Invite shops to join the platform */
  partnerTitle: string;
  partnerText: string;
  partnerCta: string;
  partnerPhone: string;
  partnerWhatsappText: string;
};

export type SiteSettings = {
  content: SiteContent;
  deliveryZones: DeliveryZone[];
  defaultVillage: string;
  /** Full King Pizza menu override; null = use code defaults */
  kingMenu: MenuItem[] | null;
  /** Mutawa item overrides by id */
  mutawaOverrides: Record<string, MutawaOverride>;
  storeProfiles: {
    "king-pizza"?: StoreProfilePatch;
    "mutawa-market"?: StoreProfilePatch;
    vegetables?: StoreProfilePatch;
  };
};

/** @deprecated kept for older drafts during migrate */
export type KingItemPrices = {
  price?: number;
  sizes?: Partial<Record<"s" | "m" | "l" | "xl", number>>;
};

export const DEFAULT_DELIVERY_ZONES: DeliveryZone[] = [
  { name: "كفل حارس", fee: 5 },
  { name: "قيرة", fee: 7 },
  { name: "ديراستيا", fee: 8 },
  { name: "حارس", fee: 10 },
];

export function defaultContent(): SiteContent {
  return {
    brandNameAr: "زين دليفري",
    brandNameEn: "Zain Delivery",
    headerSubtitle: "كفل حارس والقرى المجاورة",
    footerBlurb:
      "توصيل سريع من محلات ومطاعم كفل حارس إلى باب بيتك — بدون تسجيل دخول، والدفع عند الاستلام.",
    footerServiceLines: [
      "كفل حارس والقرى المجاورة",
      "الدفع عند الاستلام فقط",
      "بدون حساب أو تسجيل",
    ],
    copyrightSuffix: "كفل حارس، فلسطين",
    heroEyebrow: "Zain Delivery",
    heroHeadline: "زين دليفري",
    heroSubcopy: "من المحل لباب بيتك — توصيل سريع لكفل حارس والقرى المجاورة.",
    heroImage: "/zain-hero-delivery.jpg",
    ctaPrimary: "ابدأ الطلب الآن",
    ctaSecondary: "تتبع طلبك",
    homeSectionEyebrow: "المتاح الآن",
    homeSectionTitle: "محلات ومطاعم كفل حارس",
    homeSectionSubtitle: "اضغط على المحل، اختار، واطلب خلال دقائق",
    homeViewAll: "عرض الكل",
    homeSteps: [
      {
        icon: "1",
        title: "اطلب بسهولة",
        text: "اختر المنتجات، أضف للسلة، وأكمل بياناتك خلال دقائق.",
      },
      {
        icon: "2",
        title: "زين يستلم الطلب",
        text: "الطلب يظهر مباشرة في لوحة التحكم عند زين الدليفري.",
      },
      {
        icon: "3",
        title: "ادفع عند الباب",
        text: "كاش عند الاستلام — بدون بطاقات وبدون تعقيد.",
      },
    ],
    storesPageEyebrow: "دليل المتاجر",
    storesPageTitle: "المحلات والمطاعم",
    storesPageSubtitle: "حالياً متاح: مطعم واحد وميني ماركت واحد في كفل حارس",
    paymentNote: "الدفع عند الاستلام",
    partnerTitle: "عندك محل أو مطعم؟ انضم لزين دليفري",
    partnerText:
      "إذا بدك توصل طلباتك لزبائن كفل حارس والقرى المجاورة، تواصل معنا ونعرض محلك على الموقع.",
    partnerCta: "تواصل واتساب",
    partnerPhone: "+972 59-434-8757",
    partnerWhatsappText:
      "مرحبا علي يعقوب، بدي أضيف محلي/مطعمي على موقع زين دليفري",
  };
}

export function defaultSiteSettings(): SiteSettings {
  return {
    content: defaultContent(),
    deliveryZones: DEFAULT_DELIVERY_ZONES.map((z) => ({ ...z })),
    defaultVillage: "كفل حارس",
    kingMenu: null,
    mutawaOverrides: {},
    storeProfiles: {},
  };
}

function asString(value: unknown, fallback: string) {
  return typeof value === "string" && value.trim() ? value : fallback;
}

function asNumber(value: unknown, fallback: number) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

/** Migrate old settings shape + normalize new shape */
export function normalizeSettings(
  raw: (Partial<SiteSettings> & Record<string, unknown>) | null | undefined
): SiteSettings {
  const base = defaultSiteSettings();
  if (!raw || typeof raw !== "object") return base;

  const rawContent = (raw.content || {}) as Partial<SiteContent>;
  const content: SiteContent = {
    ...base.content,
    ...Object.fromEntries(
      Object.entries(rawContent).filter(([, v]) => v !== undefined && v !== null)
    ),
    homeSteps:
      Array.isArray(rawContent.homeSteps) && rawContent.homeSteps.length
        ? rawContent.homeSteps.map((s, i) => ({
            icon: asString(s?.icon, String(i + 1)),
            title: asString(s?.title, base.content.homeSteps[i]?.title || ""),
            text: asString(s?.text, base.content.homeSteps[i]?.text || ""),
          }))
        : base.content.homeSteps,
    footerServiceLines:
      Array.isArray(rawContent.footerServiceLines) &&
      rawContent.footerServiceLines.length
        ? rawContent.footerServiceLines.map((line) => String(line))
        : base.content.footerServiceLines,
  };

  let deliveryZones: DeliveryZone[] = base.deliveryZones;
  if (Array.isArray(raw.deliveryZones) && raw.deliveryZones.length > 0) {
    deliveryZones = raw.deliveryZones
      .map((z) => ({
        name: asString((z as DeliveryZone)?.name, "").trim(),
        fee: Math.max(0, asNumber((z as DeliveryZone)?.fee, 0)),
      }))
      .filter((z) => z.name);
  }
  if (deliveryZones.length === 0) deliveryZones = base.deliveryZones;

  const defaultVillage = asString(
    raw.defaultVillage,
    deliveryZones[0]?.name || base.defaultVillage
  );

  // Migrate legacy kingPizzaPrices → ignored if kingMenu present
  let kingMenu: MenuItem[] | null = null;
  if (Array.isArray(raw.kingMenu)) {
    kingMenu = raw.kingMenu as MenuItem[];
  }

  // Migrate legacy mutawaPrices into mutawaOverrides
  const mutawaOverrides: Record<string, MutawaOverride> = {};
  const legacyPrices = raw.mutawaPrices as Record<string, number> | undefined;
  if (legacyPrices && typeof legacyPrices === "object") {
    for (const [id, price] of Object.entries(legacyPrices)) {
      mutawaOverrides[id] = { price: Math.max(0, Number(price) || 0) };
    }
  }
  const rawOverrides = raw.mutawaOverrides as
    | Record<string, MutawaOverride>
    | undefined;
  if (rawOverrides && typeof rawOverrides === "object") {
    for (const [id, ov] of Object.entries(rawOverrides)) {
      mutawaOverrides[id] = {
        ...mutawaOverrides[id],
        ...ov,
        price:
          ov.price != null
            ? Math.max(0, Number(ov.price) || 0)
            : mutawaOverrides[id]?.price,
      };
    }
  }

  // Migrate legacy storeMeta → storeProfiles
  const storeProfiles: SiteSettings["storeProfiles"] = {};
  const legacyMeta = raw.storeMeta as SiteSettings["storeProfiles"] | undefined;
  const rawProfiles = raw.storeProfiles as SiteSettings["storeProfiles"] | undefined;
  for (const id of ["king-pizza", "mutawa-market", "vegetables"] as const) {
    storeProfiles[id] = {
      ...(legacyMeta?.[id] || {}),
      ...(rawProfiles?.[id] || {}),
    };
  }

  // Drop legacy Mutawa branding from saved profiles (keep generic Mini Market)
  const market = storeProfiles["mutawa-market"];
  if (market) {
    const name = market.name?.trim() || "";
    const nameEn = market.nameEn?.trim() || "";
    const description = market.description?.trim() || "";
    storeProfiles["mutawa-market"] = {
      ...market,
      name: name.includes("مطاوع") || name === "ميني ماركت مطاوع" ? "ميني ماركت" : market.name,
      nameEn:
        /mutawa/i.test(nameEn) || nameEn === "Mini Market Mutawa"
          ? "Mini Market"
          : market.nameEn,
      description: description.includes("مطاوع")
        ? description.replace(/ميني ماركت مطاوع/g, "ميني ماركت").replace(/مطاوع/g, "").replace(/\s{2,}/g, " ").trim()
        : market.description,
    };
  }

  return {
    content,
    deliveryZones,
    defaultVillage,
    kingMenu,
    mutawaOverrides,
    storeProfiles,
  };
}

export function feeForVillage(
  village: string,
  zones: DeliveryZone[] = DEFAULT_DELIVERY_ZONES
) {
  const zone = zones.find((z) => z.name === village);
  return zone?.fee ?? zones[0]?.fee ?? 5;
}

export function applyMutawaOverrides(
  item: MenuItem,
  overrides: Record<string, MutawaOverride>
): MenuItem {
  const ov = overrides[item.id];
  if (!ov) return item;
  return {
    ...item,
    name: ov.name ?? item.name,
    description: ov.description ?? item.description,
    category: ov.category ?? item.category,
    price: typeof ov.price === "number" ? ov.price : item.price,
  };
}

export function isMutawaHidden(
  itemId: string,
  overrides: Record<string, MutawaOverride>
) {
  return Boolean(overrides[itemId]?.hidden);
}

/** @deprecated use applyMutawaOverrides */
export function applyMutawaPrice(
  item: MenuItem,
  overrides: Record<string, number>
): MenuItem {
  const price = overrides[item.id];
  if (typeof price !== "number") return item;
  return { ...item, price };
}

export function applySiteSettingsToStores(
  stores: Store[],
  settings: SiteSettings
): Store[] {
  const minFee = Math.min(...settings.deliveryZones.map((z) => z.fee), 5);

  return stores
    .map((store) => {
      const patch =
        settings.storeProfiles[store.id as keyof SiteSettings["storeProfiles"]] ||
        {};

      if (patch.enabled === false) return null;

      let next: Store = {
        ...store,
        name: patch.name ?? store.name,
        nameEn: patch.nameEn ?? store.nameEn,
        tagline: patch.tagline ?? store.tagline,
        description: patch.description ?? store.description,
        rating: patch.rating ?? store.rating,
        deliveryMinutes: patch.deliveryMinutes ?? store.deliveryMinutes,
        minOrder: patch.minOrder ?? store.minOrder,
        openHours: patch.openHours ?? store.openHours,
        opensAt: patch.opensAt ?? store.opensAt,
        closesAt: patch.closesAt ?? store.closesAt,
        phones: patch.phones ?? store.phones,
        coverImage: patch.coverImage ?? store.coverImage,
        tags: patch.tags ?? store.tags,
        deliveryFee: minFee,
      };

      if (store.id === "king-pizza") {
        next = {
          ...next,
          menu: settings.kingMenu?.length ? settings.kingMenu : store.menu,
        };
      }

      return next;
    })
    .filter(Boolean) as Store[];
}
