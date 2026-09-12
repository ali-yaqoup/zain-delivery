import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/seo";

export default function manifest(): MetadataRoute.Manifest {
  const origin = getSiteUrl().replace(/\/$/, "");

  return {
    // Distinct from the admin PWA so both can be installed separately
    id: `${origin}/`,
    name: "زين دليفري",
    short_name: "زين دليفري",
    description:
      "خدمة توصيل محلية — اطلب من المطاعم والميني ماركت والخضار والفواكه في كفل حارس والقرى المجاورة.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#0b0b0b",
    theme_color: "#0b0b0b",
    lang: "ar",
    dir: "rtl",
    categories: ["food", "shopping"],
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
}
