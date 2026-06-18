"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import type { Generation } from "@/lib/supabase/types";
import { useT } from "@/lib/i18n/context";
import ShowcaseMarquee from "@/components/ShowcaseMarquee";
import ImageLightbox from "@/components/ImageLightbox";

/* ── Logged-in dashboard ── */
export function LoggedInHome({
  email,
  recent,
}: Readonly<{ email: string; recent: Generation[] }>) {
  const t = useT();
  const name = email.split("@")[0];
  const [active, setActive] = useState<Generation | null>(null);

  return (
    <div className="flex-1 px-4 sm:px-6 py-10 max-w-6xl mx-auto w-full space-y-8">

      {/* Welcome banner (anime2 artwork backdrop) */}
      <div className="relative overflow-hidden rounded-4xl p-7 sm:p-9 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-lift animate-rise">
        <Image
          src="/bg/anime2.jpeg"
          alt=""
          fill
          sizes="(max-width: 1152px) 100vw, 1152px"
          className="object-cover object-right -z-20"
        />
        <div className="absolute inset-0 -z-10 bg-linear-to-r from-navy/95 via-navy/80 to-navy/50" />

        <div className="relative text-white text-center sm:text-left">
          <p className="text-sm font-semibold text-sky">{t("home.welcomeBack")}</p>
          <h1 className="font-display text-3xl sm:text-4xl font-extrabold mt-1 capitalize">{name}</h1>
          <p className="text-sm text-white/70 mt-1">{t("home.welcomePrompt")}</p>
        </div>

        <Link
          href="/create"
          className="btn-gradient relative shrink-0 font-bold px-7 py-3.5 rounded-2xl text-base"
        >
          ✨ {t("home.createNew")}
        </Link>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link href="/create" className="group surface border-2 border-transparent hover:border-sky/40 rounded-3xl p-6 flex items-center gap-5 transition-all duration-200 hover:-translate-y-1 hover:shadow-lift">
          <div className="w-14 h-14 rounded-2xl bg-sky/12 flex items-center justify-center text-3xl shrink-0 group-hover:scale-110 transition-transform">🎨</div>
          <div>
            <h2 className="font-display font-bold text-navy text-base">{t("home.generate")}</h2>
            <p className="text-sm text-navy/55 mt-0.5">{t("home.generateDesc")}</p>
          </div>
          <span className="ml-auto text-navy/25 group-hover:text-sky transition-colors text-xl">→</span>
        </Link>

        <Link href="/gallery" className="group surface border-2 border-transparent hover:border-orange/40 rounded-3xl p-6 flex items-center gap-5 transition-all duration-200 hover:-translate-y-1 hover:shadow-lift">
          <div className="w-14 h-14 rounded-2xl bg-orange/12 flex items-center justify-center text-3xl shrink-0 group-hover:scale-110 transition-transform">🖼️</div>
          <div>
            <h2 className="font-display font-bold text-navy text-base">{t("home.myGallery")}</h2>
            <p className="text-sm text-navy/55 mt-0.5">{t("home.myGalleryDesc")}</p>
          </div>
          <span className="ml-auto text-navy/25 group-hover:text-orange transition-colors text-xl">→</span>
        </Link>
      </div>

      {/* Recent creations */}
      <div>
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display text-xl font-extrabold text-navy">{t("home.recent")}</h2>
          {recent.length > 0 && (
            <Link href="/gallery" className="text-sm text-sky hover:underline font-semibold">
              {t("home.viewAll")} →
            </Link>
          )}
        </div>

        {recent.length === 0 ? (
          <div className="surface rounded-3xl border-2 border-dashed border-sky/30 p-14 text-center">
            <div className="text-5xl mb-3 float inline-block">🌟</div>
            <p className="font-display font-bold text-navy text-lg mt-2">{t("home.noCreations")}</p>
            <p className="text-sm text-navy/55 mt-1 mb-5">{t("home.noCreationsHint")}</p>
            <Link href="/create" className="btn-gradient inline-flex items-center gap-2 font-bold px-6 py-3 rounded-2xl">
              ✨ {t("home.makeFirst")}
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {recent.map((gen) => (
              <div key={gen.id} className="group surface rounded-2xl overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:shadow-lift hover:border-sky/30">
                <button
                  type="button"
                  onClick={() => setActive(gen)}
                  aria-label={t("gallery.viewImage")}
                  className="relative aspect-square w-full overflow-hidden block cursor-zoom-in"
                >
                  <Image src={gen.image_url} alt={gen.prompt} fill className="object-cover group-hover:scale-105 transition-transform duration-300" unoptimized />
                  <div className="absolute inset-0 bg-linear-to-t from-navy/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <span className={`absolute top-2 left-2 text-xs font-bold px-2.5 py-1 rounded-full shadow-md ${gen.style === "anime" ? "bg-sky text-white" : "bg-orange text-white"}`}>
                    {gen.style === "anime" ? t("create.anime") : t("create.cartoon")}
                  </span>
                  <span className="absolute bottom-2 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-navy shadow-md opacity-0 group-hover:opacity-100 transition-opacity">
                    ⤢
                  </span>
                </button>
                <p className="px-3 py-2 text-xs text-navy/60 truncate font-medium">{gen.prompt}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {active && (
        <ImageLightbox gen={active} onClose={() => setActive(null)} source="dashboard_recent" />
      )}
    </div>
  );
}

/* ── Marketing / logged-out ── */
export function MarketingHome() {
  const t = useT();

  const features = [
    { icon: "🎌", title: t("marketing.featAnimeTitle"), desc: t("marketing.featAnimeDesc"), color: "bg-sky/20" },
    { icon: "⚡", title: t("marketing.featFastTitle"), desc: t("marketing.featFastDesc"), color: "bg-orange/20" },
    { icon: "🛡️", title: t("marketing.featSafeTitle"), desc: t("marketing.featSafeDesc"), color: "bg-grape/15" },
  ];

  return (
    <div className="flex-1 flex flex-col">
      {/* ── Cinematic hero (walpaper.jpg background) ── */}
      <section className="relative flex flex-col items-center justify-center text-center px-4 pt-24 pb-28 overflow-hidden">
        {/* Background artwork */}
        <Image
          src="/bg/walpaper.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-center -z-20 scale-105"
        />
        {/* Readability + brand gradient overlay */}
        <div className="absolute inset-0 -z-10 bg-linear-to-b from-navy/85 via-navy/75 to-navy/90" />
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(50rem_30rem_at_50%_0%,rgba(61,169,245,0.25),transparent_70%)]" />

        <div className="relative max-w-3xl mx-auto space-y-6 animate-rise">
          <span className="inline-flex items-center gap-2 rounded-full glass-dark px-4 py-1.5 text-xs font-semibold text-white/90">
            <span className="aurora h-2 w-2 rounded-full" />
            {t("marketing.furakMeans")}
          </span>

          <Image
            src="/logo-with-text.png"
            alt="FurakToon"
            width={220}
            height={220}
            className="w-40 sm:w-48 h-auto mx-auto float drop-shadow-2xl"
            priority
          />

          <h1 className="font-display text-5xl sm:text-7xl font-extrabold leading-[1.05] tracking-tight text-white">
            {t("marketing.beautiful")}{" "}
            <span className="text-gradient">{t("marketing.cartoons")}</span>
            ,<br />
            {t("marketing.madeByYou")}
          </h1>

          <p className="text-lg text-white/75 max-w-xl mx-auto leading-relaxed">
            {t("marketing.subtitle")}
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Link
              href="/auth/register"
              className="btn-gradient inline-flex items-center justify-center gap-2 font-bold text-base px-8 py-4 rounded-2xl"
            >
              {t("marketing.startFree")} →
            </Link>
            <Link
              href="/auth/login"
              className="inline-flex items-center justify-center glass text-navy font-bold text-base px-8 py-4 rounded-2xl hover:bg-white/80 transition-all duration-150"
            >
              {t("marketing.signIn")}
            </Link>
          </div>
        </div>
      </section>

      {/* ── Showcase strip (all bg sample artwork) ── */}
      <section className="relative -mt-12 z-10">
        <ShowcaseMarquee />
      </section>

      {/* ── Feature strip ── */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-5">
          {features.map((f) => (
            <div key={f.title} className="surface flex items-start gap-4 p-6 rounded-3xl hover:shadow-lift hover:-translate-y-1 transition-all duration-200">
              <div className={`w-12 h-12 rounded-2xl ${f.color} flex items-center justify-center text-2xl shrink-0`}>{f.icon}</div>
              <div>
                <h3 className="font-display font-bold text-navy text-base">{f.title}</h3>
                <p className="text-sm text-navy/55 mt-1">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA bottom (cartoon2 accent background) ── */}
      <section className="px-4 pb-16">
        <div className="relative max-w-4xl mx-auto overflow-hidden rounded-4xl p-12 text-center">
          <Image
            src="/bg/cartoon2.jpeg"
            alt=""
            fill
            sizes="(max-width: 896px) 100vw, 896px"
            className="object-cover -z-20"
          />
          <div className="absolute inset-0 -z-10 bg-navy/80 backdrop-blur-[2px]" />
          <div className="relative space-y-5">
            <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-white">{t("marketing.ctaTitle")}</h2>
            <p className="text-white/75 max-w-md mx-auto">{t("marketing.ctaSubtitle")}</p>
            <Link
              href="/auth/register"
              className="btn-gradient inline-flex items-center gap-2 font-bold px-8 py-4 rounded-2xl"
            >
              {t("marketing.ctaButton")} ✨
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
