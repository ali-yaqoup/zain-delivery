import { buildPageMetadata } from "@/lib/seo";

export const metadata = buildPageMetadata({
  title: "إتمام الطلب",
  description: "أكمل طلبك من زين دليفري — الدفع عند الاستلام بدون تسجيل حساب.",
  path: "/checkout",
  noIndex: true,
});

export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
