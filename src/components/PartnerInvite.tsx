"use client";

import { useSiteSettings } from "@/context/SiteSettingsContext";
import { PhoneIcon } from "@/components/icons";

function toWhatsAppNumber(phone: string) {
  const digits = phone.replace(/\D/g, "");
  if (!digits) return "";
  if (digits.startsWith("972") || digits.startsWith("970")) return digits;
  // Local 05X… → international as provided by Zain (+972)
  if (digits.startsWith("0")) return `972${digits.slice(1)}`;
  return digits;
}

export function PartnerInvite({ compact = false }: { compact?: boolean }) {
  const { settings } = useSiteSettings();
  const c = settings.content;
  const phone = (c.partnerPhone || "").trim();
  if (!phone) return null;

  const wa = toWhatsAppNumber(phone);
  const waHref = `https://wa.me/${wa}?text=${encodeURIComponent(
    c.partnerWhatsappText ||
      "مرحبا علي يعقوب، بدي أضيف محلي/مطعمي على موقع زين دليفري"
  )}`;
  const telHref = `tel:+${wa}`;

  if (compact) {
    return (
      <a
        href={waHref}
        target="_blank"
        rel="noopener noreferrer"
        className="hover:text-brand"
      >
        أضف محلك معنا
      </a>
    );
  }

  return (
    <section className="border-t border-border">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <div className="relative overflow-hidden rounded-3xl border border-brand/25 bg-gradient-to-l from-brand/15 via-surface to-surface px-6 py-10 sm:px-10">
          <div className="pointer-events-none absolute -left-10 top-0 h-40 w-40 rounded-full bg-brand/10 blur-3xl" />
          <div className="relative max-w-2xl space-y-4">
            <p className="text-sm font-semibold text-brand">لأصحاب المحلات</p>
            <h2 className="font-display text-2xl font-bold text-ink sm:text-3xl">
              {c.partnerTitle}
            </h2>
            <p className="text-sm leading-relaxed text-muted sm:text-base">
              {c.partnerText}
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <a
                href={waHref}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-press inline-flex items-center gap-2 rounded-xl bg-brand px-5 py-3 text-sm font-bold text-white glow-brand hover:bg-brand-hover"
              >
                {c.partnerCta}
              </a>
              <a
                href={telHref}
                className="btn-press inline-flex items-center gap-2 rounded-xl border border-border bg-surface-2 px-5 py-3 text-sm font-semibold text-ink hover:border-brand/40"
              >
                <PhoneIcon size={16} className="text-brand" />
                <span>اتصال</span>
                <span dir="ltr" className="unicode-bidi-isolate font-mono tracking-wide">
                  {phone}
                </span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
