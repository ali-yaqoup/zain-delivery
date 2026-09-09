import Link from "next/link";
import { BrandMark } from "@/components/icons";

export default function OfflinePage() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-lg flex-col items-center justify-center gap-5 px-4 text-center">
      <BrandMark size={64} iconSize={44} className="rounded-2xl" />
      <h1 className="text-2xl font-extrabold text-ink">أنت غير متصل</h1>
      <p className="text-muted leading-relaxed">
        تحقق من الإنترنت ثم حاول مرة أخرى. بعض الصفحات المحفوظة قد تبقى متاحة بدون
        اتصال.
      </p>
      <Link
        href="/"
        className="btn-press rounded-xl bg-brand px-5 py-3 font-bold text-white"
      >
        العودة للرئيسية
      </Link>
    </div>
  );
}
