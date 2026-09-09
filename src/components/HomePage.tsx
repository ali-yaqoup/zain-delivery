"use client";

import Image from "next/image";
import Link from "next/link";
import { StoreGrid } from "@/components/StoreGrid";
import { PartnerInvite } from "@/components/PartnerInvite";
import { useSiteSettings } from "@/context/SiteSettingsContext";

export function HomePage() {
  const { settings, stores } = useSiteSettings();
  const c = settings.content;

  return (
    <div>
      <section className="relative isolate min-h-[78vh] overflow-hidden border-b border-border sm:min-h-[85vh]">
        <Image
          src={c.heroImage || "/zain-hero-delivery.jpg"}
          alt={c.brandNameAr}
          fill
          priority
          sizes="100vw"
          className="object-cover object-[center_40%] scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-l from-canvas via-canvas/75 to-canvas/35" />
        <div className="absolute inset-0 bg-gradient-to-t from-canvas via-transparent to-canvas/50" />

        <div className="relative mx-auto flex min-h-[78vh] max-w-6xl flex-col justify-center px-4 py-16 sm:min-h-[85vh] sm:px-6 lg:py-24">
          <div className="max-w-2xl space-y-6 animate-fade-up">
            <p className="font-display text-sm font-semibold tracking-wide text-brand">
              {c.heroEyebrow}
            </p>
            <h1 className="font-display text-5xl font-extrabold leading-[1.1] text-white drop-shadow-[0_8px_30px_rgba(0,0,0,0.55)] sm:text-6xl lg:text-7xl">
              {c.heroHeadline}
            </h1>
            <p className="max-w-lg text-lg font-medium text-white/90 sm:text-xl">
              {c.heroSubcopy}
            </p>
            <div className="flex flex-wrap gap-3 pt-1">
              <Link
                href="/stores"
                className="btn-press rounded-xl bg-brand px-7 py-3.5 text-sm font-bold text-white glow-brand hover:bg-brand-hover"
              >
                {c.ctaPrimary}
              </Link>
              <Link
                href="/track"
                className="btn-press rounded-xl border border-white/20 bg-black/35 px-7 py-3.5 text-sm font-semibold text-white backdrop-blur-md hover:border-brand/50 hover:bg-black/50"
              >
                {c.ctaSecondary}
              </Link>
            </div>
            <div className="flex flex-wrap gap-2 pt-2">
              {stores.map((store) => (
                <Link
                  key={store.id}
                  href={`/store/${store.slug}`}
                  className="btn-press rounded-full border border-white/15 bg-black/40 px-4 py-2 text-sm text-white/90 backdrop-blur-md hover:border-brand/50 hover:text-brand transition"
                >
                  {store.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div className="animate-fade-up">
            <p className="text-sm text-brand mb-1">{c.homeSectionEyebrow}</p>
            <h2 className="font-display text-2xl font-bold text-ink sm:text-3xl">
              {c.homeSectionTitle}
            </h2>
            <p className="mt-2 text-sm text-muted">{c.homeSectionSubtitle}</p>
          </div>
          <Link
            href="/stores"
            className="text-sm font-semibold text-brand hover:underline"
          >
            {c.homeViewAll}
          </Link>
        </div>
        <StoreGrid />
      </section>

      <section className="border-y border-border bg-surface/40">
        <div className="mx-auto grid max-w-6xl gap-5 px-4 py-12 sm:px-6 md:grid-cols-3">
          {c.homeSteps.map((step, i) => (
            <div
              key={`${step.title}-${i}`}
              className={`card-hover rounded-2xl border border-border bg-surface p-6 animate-fade-up animate-delay-${i + 1}`}
            >
              <span className="mb-3 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-brand/15 font-display text-lg font-bold text-brand">
                {step.icon}
              </span>
              <h3 className="font-display text-lg font-bold text-ink">
                {step.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                {step.text}
              </p>
            </div>
          ))}
        </div>
      </section>

      <PartnerInvite />
    </div>
  );
}
