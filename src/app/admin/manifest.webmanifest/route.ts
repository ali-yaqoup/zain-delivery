import { NextResponse } from "next/server";
import { getSiteUrl } from "@/lib/seo";

export const dynamic = "force-static";

export function GET() {
  const origin = getSiteUrl().replace(/\/$/, "");
  const manifest = {
    id: `${origin}/admin`,
    name: "أدمن زين دليفري",
    short_name: "أدمن زين",
    description: "لوحة تحكم طلبات وإعدادات زين دليفري.",
    start_url: "/admin",
    scope: "/admin",
    display: "standalone",
    orientation: "portrait",
    background_color: "#0b0b0b",
    theme_color: "#0b0b0b",
    lang: "ar",
    dir: "rtl",
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
      "Cache-Control": "public, max-age=3600",
    },
  });
}
