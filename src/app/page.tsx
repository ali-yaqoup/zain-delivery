import { HomePage } from "@/components/HomePage";
import { buildPageMetadata, SITE_DESCRIPTION, SITE_NAME_AR } from "@/lib/seo";

export const metadata = buildPageMetadata({
  title: `${SITE_NAME_AR} | توصيل كفل حارس والقرى المجاورة`,
  description: SITE_DESCRIPTION,
  path: "/",
});

export default function Page() {
  return <HomePage />;
}
