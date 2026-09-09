"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSiteSettings } from "@/context/SiteSettingsContext";
import { BrandMark } from "@/components/icons";
import { PartnerInvite } from "@/components/PartnerInvite";
import { DEVELOPER_CREDIT } from "@/lib/developer-credit";

function toWhatsAppNumber(phone: string) {
  const digits = phone.replace(/\D/g, "");
  if (!digits) return "";
  if (digits.startsWith("972") || digits.startsWith("970")) return digits;
  if (digits.startsWith("0")) return `972${digits.slice(1)}`;
  return digits;
}

export function SiteFooter() {
  const pathname = usePathname();
  const { settings, stores } = useSiteSettings();
  const c = settings.content;

  if (pathname.startsWith("/admin")) return null;

  const wa = toWhatsAppNumber(DEVELOPER_CREDIT.phone);
  const waHref = `https://wa.me/${wa}?text=${encodeURIComponent(
    DEVELOPER_CREDIT.whatsappText
  )}`;

  return (
    <footer className="mt-auto border-t border-border bg-surface">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-3">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <BrandMark
              size={36}
              iconSize={26}
              className="rounded-lg shadow-none"
            />
            <div>
              <p className="font-display font-bold text-ink">{c.brandNameAr}</p>
              <p className="text-xs text-soft">{c.brandNameEn}</p>
            </div>
          </div>
          <p className="text-sm leading-relaxed text-muted">{c.footerBlurb}</p>
        </div>

        <div>
          <p className="mb-3 text-sm font-semibold text-ink">روابط سريعة</p>
          <ul className="space-y-2 text-sm text-muted">
            <li>
              <Link href="/stores" className="hover:text-brand">
                المحلات والمطاعم
              </Link>
            </li>
            {stores.map((store) => (
              <li key={store.id}>
                <Link href={`/store/${store.slug}`} className="hover:text-brand">
                  {store.name}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/track" className="hover:text-brand">
                تتبع الطلب
              </Link>
            </li>
            <li>
              <PartnerInvite compact />
            </li>
          </ul>
        </div>

        <div>
          <p className="mb-3 text-sm font-semibold text-ink">خدمة التوصيل</p>
          <ul className="space-y-2 text-sm text-muted">
            {c.footerServiceLines.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-border">
        <div className="mx-auto max-w-6xl px-4 py-5 text-center sm:px-6 sm:text-start">
          <p className="text-xs text-soft">
            © {new Date().getFullYear()} {c.brandNameAr} — {c.copyrightSuffix}
          </p>
          <p className="mt-1 text-sm text-muted">
            برمجة وتطوير:{" "}
            <a
              href={waHref}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-brand hover:underline"
            >
              {DEVELOPER_CREDIT.name}
            </a>
            <span className="text-soft"> — {DEVELOPER_CREDIT.note}</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
