import type { Metadata, Viewport } from "next";
import { JetBrains_Mono, Noto_Kufi_Arabic, Tajawal } from "next/font/google";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next";
import { SiteSettingsProvider } from "@/context/SiteSettingsContext";
import { CartProvider } from "@/context/CartContext";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { CartDrawer } from "@/components/CartDrawer";
import { MobileCartBar } from "@/components/MobileCartBar";
import { AddToast } from "@/components/AddToast";
import { ConditionalSerwist } from "@/components/ConditionalSerwist";
import { JsonLd } from "@/components/JsonLd";
import {
  SITE_DESCRIPTION,
  SITE_KEYWORDS,
  SITE_NAME_AR,
  absoluteUrl,
  getSiteUrl,
  localBusinessJsonLd,
  websiteJsonLd,
} from "@/lib/seo";
import "./globals.css";

const tajawal = Tajawal({
  variable: "--font-tajawal",
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "700", "800"],
});

const notoKufi = Noto_Kufi_Arabic({
  variable: "--font-noto-kufi",
  subsets: ["arabic"],
  weight: ["500", "600", "700", "800"],
});

const mono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["500", "600"],
});

const TITLE = `${SITE_NAME_AR} | توصيل كفل حارس والقرى المجاورة`;

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  applicationName: SITE_NAME_AR,
  title: {
    default: TITLE,
    template: `%s | ${SITE_NAME_AR}`,
  },
  description: SITE_DESCRIPTION,
  keywords: SITE_KEYWORDS,
  authors: [{ name: SITE_NAME_AR }],
  creator: SITE_NAME_AR,
  publisher: SITE_NAME_AR,
  category: "food delivery",
  classification: "Local Delivery Service",
  referrer: "origin-when-cross-origin",
  formatDetection: {
    email: false,
    address: true,
    telephone: true,
  },
  alternates: {
    canonical: "/",
    languages: {
      "ar-PS": "/",
      ar: "/",
    },
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black",
    title: SITE_NAME_AR,
  },
  icons: {
    icon: [
      { url: "/icons/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180" }],
    shortcut: ["/icons/icon-192.png"],
  },
  openGraph: {
    type: "website",
    siteName: SITE_NAME_AR,
    title: TITLE,
    description: SITE_DESCRIPTION,
    locale: "ar_PS",
    url: absoluteUrl("/"),
    images: [
      {
        url: absoluteUrl("/zain-hero-delivery.jpg"),
        width: 1200,
        height: 630,
        alt: "زين دليفري — توصيل كفل حارس",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: SITE_DESCRIPTION,
    images: [absoluteUrl("/zain-hero-delivery.jpg")],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  other: {
    "geo.region": "PS",
    "geo.placename": "كفل حارس",
  },
};

export const viewport: Viewport = {
  themeColor: "#0b0b0b",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ar"
      dir="rtl"
      className={`${tajawal.variable} ${notoKufi.variable} ${mono.variable} h-full`}
    >
      <body className="min-h-full flex flex-col antialiased atmosphere">
        <JsonLd data={localBusinessJsonLd()} />
        <JsonLd data={websiteJsonLd()} />
        <ConditionalSerwist>
          <SiteSettingsProvider>
            <CartProvider>
              <SiteHeader />
              <main className="flex-1 w-full pb-[calc(6rem+env(safe-area-inset-bottom,0px))] md:pb-0">
                {children}
              </main>
              <SiteFooter />
              <CartDrawer />
              <MobileCartBar />
              <AddToast />
            </CartProvider>
          </SiteSettingsProvider>
        </ConditionalSerwist>
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  );
}
