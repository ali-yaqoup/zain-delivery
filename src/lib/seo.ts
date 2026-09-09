import type { Metadata } from "next";
import { stores } from "@/lib/stores";

export const SITE_NAME_AR = "زين دليفري";
export const SITE_NAME_EN = "Zain Delivery";
export const SITE_TAGLINE = "توصيل كفل حارس والقرى المجاورة";

export const SITE_DESCRIPTION =
  "زين دليفري خدمة توصيل محلية في كفل حارس وقيرة وديراستيا وحارس. اطلب من كينج بيتزا وميني ماركت مطاوع بدون تسجيل — الدفع عند الاستلام.";

export const SITE_KEYWORDS = [
  "زين دليفري",
  "توصيل كفل حارس",
  "دليفري كفل حارس",
  "كينج بيتزا",
  "ميني ماركت مطاوع",
  "طلب طعام كفل حارس",
  "توصيل بيتزا",
  "توصيل بقالة",
  "قيرة",
  "ديراستيا",
  "حارس",
  "Zain Delivery",
];

export function getSiteUrl() {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (explicit) return explicit.replace(/\/$/, "");
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}

export function absoluteUrl(path = "/") {
  const base = getSiteUrl();
  if (!path || path === "/") return base;
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

export function buildPageMetadata({
  title,
  description,
  path = "/",
  image,
  noIndex = false,
}: {
  title: string;
  description: string;
  path?: string;
  image?: string;
  noIndex?: boolean;
}): Metadata {
  const url = absoluteUrl(path);
  const ogImage = image?.startsWith("http")
    ? image
    : absoluteUrl(image || "/zain-hero-delivery.jpg");

  return {
    title,
    description,
    alternates: { canonical: url },
    robots: noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true },
    openGraph: {
      type: "website",
      locale: "ar_PS",
      url,
      siteName: SITE_NAME_AR,
      title,
      description,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: SITE_NAME_AR,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}

export function localBusinessJsonLd() {
  const url = getSiteUrl();
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": `${url}/#business`,
    name: SITE_NAME_AR,
    alternateName: SITE_NAME_EN,
    description: SITE_DESCRIPTION,
    url,
    image: absoluteUrl("/icons/icon-512.png"),
    logo: absoluteUrl("/icons/icon-512.png"),
    telephone: stores.find((s) => s.phones?.length)?.phones?.[0],
    priceRange: "₪",
    currenciesAccepted: "ILS",
    paymentAccepted: "Cash",
    areaServed: [
      { "@type": "Place", name: "كفل حارس" },
      { "@type": "Place", name: "قيرة" },
      { "@type": "Place", name: "ديراستيا" },
      { "@type": "Place", name: "حارس" },
    ],
    address: {
      "@type": "PostalAddress",
      addressLocality: "كفل حارس",
      addressRegion: "سلفيت",
      addressCountry: "PS",
    },
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ],
      opens: "16:00",
      closes: "02:00",
    },
    sameAs: [],
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "محلات زين دليفري",
      itemListElement: stores.map((store, index) => ({
        "@type": "OfferCatalog",
        position: index + 1,
        name: store.name,
        url: absoluteUrl(`/store/${store.slug}`),
      })),
    },
  };
}

export function websiteJsonLd() {
  const url = getSiteUrl();
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${url}/#website`,
    name: SITE_NAME_AR,
    alternateName: SITE_NAME_EN,
    url,
    inLanguage: "ar",
    description: SITE_DESCRIPTION,
    publisher: { "@id": `${url}/#business` },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${url}/stores`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export function storeJsonLd(store: (typeof stores)[number]) {
  const url = absoluteUrl(`/store/${store.slug}`);
  const type =
    store.category === "restaurant" ? "FoodEstablishment" : "Store";

  return {
    "@context": "https://schema.org",
    "@type": type,
    name: store.name,
    alternateName: store.nameEn,
    description: store.description,
    url,
    image: store.coverImage.startsWith("http")
      ? store.coverImage
      : absoluteUrl(store.coverImage),
    telephone: store.phones?.[0],
    servesCuisine: store.category === "restaurant" ? "Pizza" : undefined,
    areaServed: "كفل حارس",
    address: {
      "@type": "PostalAddress",
      addressLocality: "كفل حارس",
      addressCountry: "PS",
    },
  };
}
