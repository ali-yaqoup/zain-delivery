import { buildPageMetadata } from "@/lib/seo";
import StoresPageClient from "./StoresPageClient";

export const metadata = buildPageMetadata({
  title: "المحلات والمطاعم",
  description:
    "تصفح محلات ومطاعم زين دليفري في كفل حارس: كينج بيتزا وميني ماركت مع توصيل سريع والدفع عند الاستلام.",
  path: "/stores",
});

export default function StoresPage() {
  return <StoresPageClient />;
}
