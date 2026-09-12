import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

function isAdminHost(host: string) {
  const hostname = host.split(":")[0]?.toLowerCase() || "";
  return hostname === "admin.localhost" || hostname.startsWith("admin.");
}

export function GET(request: Request) {
  const host = request.headers.get("host") || "";
  const onAdminHost = isAdminHost(host);

  // On admin.* subdomain the app owns the whole origin → start at "/".
  // On the main domain, use a distinct id + /admin start so it can install
  // separately from the customer PWA (id: /zain-shop).
  const manifest = onAdminHost
    ? {
        id: "/zain-admin",
        name: "أدمن زين دليفري",
        short_name: "أدمن زين",
        description: "لوحة تحكم طلبات وإعدادات زين دليفري.",
        start_url: "/?source=pwa",
        scope: "/",
        display: "standalone" as const,
        orientation: "portrait" as const,
        background_color: "#0b0b0b",
        theme_color: "#0b0b0b",
        lang: "ar",
        dir: "rtl" as const,
        categories: ["business", "productivity"],
        icons: [
          {
            src: "/icons/icon-192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/icons/icon-512.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "/icons/icon-512-maskable.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      }
    : {
        id: "/zain-admin",
        name: "أدمن زين دليفري",
        short_name: "أدمن زين",
        description: "لوحة تحكم طلبات وإعدادات زين دليفري.",
        start_url: "/admin?source=pwa",
        scope: "/admin",
        display: "standalone" as const,
        orientation: "portrait" as const,
        background_color: "#0b0b0b",
        theme_color: "#0b0b0b",
        lang: "ar",
        dir: "rtl" as const,
        categories: ["business", "productivity"],
        icons: [
          {
            src: "/icons/icon-192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/icons/icon-512.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "/icons/icon-512-maskable.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      };

  return NextResponse.json(manifest, {
    headers: {
      "Content-Type": "application/manifest+json; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
