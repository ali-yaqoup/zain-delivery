import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { StoreMenuPage } from "@/components/StoreMenuPage";
import { JsonLd } from "@/components/JsonLd";
import { getStoreBySlug } from "@/lib/stores";
import { buildPageMetadata, storeJsonLd } from "@/lib/seo";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const { stores } = await import("@/lib/stores");
  return stores.map((store) => ({ slug: store.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const store = getStoreBySlug(slug);
  if (!store) {
    return buildPageMetadata({
      title: "المحل غير موجود",
      description: "هذا المحل غير متاح حالياً على زين دليفري.",
      path: `/store/${slug}`,
      noIndex: true,
    });
  }

  return buildPageMetadata({
    title: `${store.name} — توصيل لكفل حارس`,
    description: `${store.description} ${store.tagline}. اطلب أونلاين عبر زين دليفري والدفع عند الاستلام.`,
    path: `/store/${store.slug}`,
    image: store.coverImage,
  });
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  const store = getStoreBySlug(slug);
  if (!store) notFound();

  return (
    <>
      <JsonLd data={storeJsonLd(store)} />
      <StoreMenuPage />
    </>
  );
}
