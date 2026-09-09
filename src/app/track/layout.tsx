import { buildPageMetadata } from "@/lib/seo";

export const metadata = buildPageMetadata({
  title: "تتبع الطلب",
  description:
    "تتبع طلبك من زين دليفري برقم الطلب — اعرف حالة التحضير والتوصيل لطلبات كفل حارس والقرى المجاورة.",
  path: "/track",
});

export default function TrackLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
