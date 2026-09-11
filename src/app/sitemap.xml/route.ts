import { getSiteUrl } from "@/lib/seo";
import { stores } from "@/lib/stores";

export const runtime = "nodejs";
export const dynamic = "force-static";

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  const base = getSiteUrl().replace(/\/$/, "");
  const lastmod = new Date().toISOString();

  const urls = [
    { loc: `${base}/`, changefreq: "daily", priority: "1.0" },
    { loc: `${base}/stores`, changefreq: "daily", priority: "0.9" },
    { loc: `${base}/track`, changefreq: "monthly", priority: "0.5" },
    ...stores.map((store) => ({
      loc: `${base}/store/${store.slug}`,
      changefreq: "daily",
      priority: "0.8",
    })),
  ];

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) => `<url>
<loc>${escapeXml(u.loc)}</loc>
<lastmod>${lastmod}</lastmod>
<changefreq>${u.changefreq}</changefreq>
<priority>${u.priority}</priority>
</url>`
  )
  .join("\n")}
</urlset>
`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/xml; charset=utf-8",
      "Cache-Control": "public, max-age=0, must-revalidate",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
