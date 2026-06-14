"use client";

import Link from "next/link";
import Image from "next/image";
import type { Generation } from "@/lib/supabase/types";
import { useT } from "@/lib/i18n/context";

/* ── Logged-in dashboard ── */
export function LoggedInHome({
  email,
  recent,
}: Readonly<{ email: string; recent: Generation[] }>) {
  const t = useT();
  const name = email.split("@")[0];

  return (
    <div className="flex-1 px-4 sm:px-6 py-10 max-w-6xl mx-auto w-full space-y-8">

      {/* Welcome banner */}
      <div className="relative overflow-hidden rounded-3xl bg-navy p-7 sm:p-9 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-sky/10 rounded-full -translate-y-1/2 translate-x-1/4 pointer-events-none" />
        <div className="absolute bottom-0 left-20 w-40 h-40 bg-orange/10 rounded-full translate-y-1/2 pointer-events-none" />

        <div className="relative text-white text-center sm:text-left">
          <p className="text-sm font-medium text-sky">{t("home.welcomeBack")}</p>
          <h1 className="text-2xl sm:text-3xl font-extrabold mt-1 capitalize">{name}</h1>
          <p className="text-sm text-white/60 mt-1">{t("home.welcomePrompt")}</p>
        </div>

        <Link
          href="/create"
          className="relative shrink-0 bg-sky hover:bg-[#3a9fd6] text-white font-bold px-7 py-3.5 rounded-2xl shadow-lg active:scale-95 transition-all duration-150 text-base glow-sky"
        >
          ✨ {t("home.createNew")}
        </Link>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link href="/create" className="group bg-white border-2 border-transparent hover:border-sky/40 rounded-3xl shadow-md hover:shadow-xl p-6 flex items-center gap-5 transition-all duration-200">
          <div className="w-14 h-14 rounded-2xl bg-sky/10 flex items-center justify-center text-3xl shrink-0 group-hover:scale-110 transition-transform">🎨</div>
          <div>
            <h2 className="font-bold text-navy text-base">{t("home.generate")}</h2>
            <p className="text-sm text-gray-400 mt-0.5">{t("home.generateDesc")}</p>
          </div>
          <span className="ml-auto text-gray-300 group-hover:text-sky transition-colors text-xl">→</span>
        </Link>

        <Link href="/gallery" className="group bg-white border-2 border-transparent hover:border-orange/40 rounded-3xl shadow-md hover:shadow-xl p-6 flex items-center gap-5 transition-all duration-200">
          <div className="w-14 h-14 rounded-2xl bg-orange/10 flex items-center justify-center text-3xl shrink-0 group-hover:scale-110 transition-transform">🖼️</div>
          <div>
            <h2 className="font-bold text-navy text-base">{t("home.myGallery")}</h2>
            <p className="text-sm text-gray-400 mt-0.5">{t("home.myGalleryDesc")}</p>
          </div>
          <span className="ml-auto text-gray-300 group-hover:text-orange transition-colors text-xl">→</span>
        </Link>
      </div>

      {/* Recent creations */}
      <div>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-extrabold text-navy">{t("home.recent")}</h2>
          {recent.length > 0 && (
            <Link href="/gallery" className="text-sm text-sky hover:underline font-semibold">
              {t("home.viewAll")} →
            </Link>
          )}
        </div>

        {recent.length === 0 ? (
          <div className="bg-white rounded-3xl border-2 border-dashed border-sky/30 p-14 text-center">
            <div className="text-5xl mb-3 float inline-block">🌟</div>
            <p className="font-bold text-navy text-lg mt-2">{t("home.noCreations")}</p>
            <p className="text-sm text-gray-400 mt-1 mb-5">{t("home.noCreationsHint")}</p>
            <Link href="/create" className="inline-flex items-center gap-2 bg-navy text-white font-bold px-6 py-3 rounded-2xl hover:bg-[#2a3f8f] transition-all active:scale-95 shadow-md">
              ✨ {t("home.makeFirst")}
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {recent.map((gen) => (
              <div key={gen.id} className="group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-200 border border-gray-100 hover:border-sky/30">
                <div className="relative aspect-square overflow-hidden">
                  <Image src={gen.image_url} alt={gen.prompt} fill className="object-cover group-hover:scale-105 transition-transform duration-300" unoptimized />
                  <div className="absolute inset-0 bg-linear-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <span className={`absolute top-2 left-2 text-xs font-bold px-2.5 py-1 rounded-full shadow-md ${gen.style === "anime" ? "bg-sky text-white" : "bg-orange text-white"}`}>
                    {gen.style === "anime" ? t("create.anime") : t("create.cartoon")}
                  </span>
                </div>
                <p className="px-3 py-2 text-xs text-gray-500 truncate font-medium">{gen.prompt}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Marketing / logged-out ── */
export function MarketingHome() {
  const t = useT();

  const features = [
    { icon: "🎌", title: t("marketing.featAnimeTitle"), desc: t("marketing.featAnimeDesc"), color: "bg-sky/20" },
    { icon: "⚡", title: t("marketing.featFastTitle"), desc: t("marketing.featFastDesc"), color: "bg-orange/20" },
    { icon: "🛡️", title: t("marketing.featSafeTitle"), desc: t("marketing.featSafeDesc"), color: "bg-white/10" },
  ];

  return (
    <div className="flex-1 flex flex-col">
      {/* Hero */}
      <section className="relative flex flex-col items-center justify-center text-center px-4 pt-16 pb-20 overflow-hidden">
        {/* Background blobs */}
        <div className="absolute top-10 left-1/4 w-72 h-72 bg-sky/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-56 h-56 bg-orange/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-3xl mx-auto space-y-6">
          <Image
            src="/logo-with-text.png"
            alt="FurakToon"
            width={220}
            height={220}
            className="w-44 sm:w-52 h-auto mx-auto float"
            priority
          />

          <h1 className="text-5xl sm:text-6xl font-extrabold leading-tight tracking-tight text-ink">
            {t("marketing.beautiful")}{" "}
            <span className="relative inline-block">
              <span className="relative z-10 text-sky">{t("marketing.cartoons")}</span>
              <span className="absolute -bottom-1 left-0 w-full h-3 bg-orange/20 rounded-full -z-0" />
            </span>
            ,<br />
            {t("marketing.madeByYou")}
          </h1>

          <p className="text-lg text-gray-500 max-w-md mx-auto leading-relaxed">
            {t("marketing.subtitle")}
          </p>

          <p className="text-xs text-gray-400">{t("marketing.furakMeans")}</p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Link
              href="/auth/register"
              className="inline-flex items-center justify-center gap-2 bg-navy hover:bg-[#2a3f8f] text-white font-bold text-base px-8 py-4 rounded-2xl shadow-xl hover:shadow-2xl active:scale-95 transition-all duration-150"
            >
              {t("marketing.startFree")} →
            </Link>
            <Link
              href="/auth/login"
              className="inline-flex items-center justify-center bg-white border-2 border-navy/20 hover:border-sky/60 text-navy font-bold text-base px-8 py-4 rounded-2xl hover:bg-sky/5 transition-all duration-150"
            >
              {t("marketing.signIn")}
            </Link>
          </div>
        </div>
      </section>

      {/* Feature strip */}
      <section className="bg-navy py-14 px-4">
        <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-6">
          {features.map((f) => (
            <div key={f.title} className="flex items-start gap-4 p-6 rounded-3xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all">
              <div className={`w-12 h-12 rounded-2xl ${f.color} flex items-center justify-center text-2xl shrink-0`}>{f.icon}</div>
              <div>
                <h3 className="font-bold text-white text-base">{f.title}</h3>
                <p className="text-sm text-white/50 mt-1">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA bottom */}
      <section className="py-16 px-4 text-center bg-cream">
        <div className="max-w-lg mx-auto space-y-5">
          <h2 className="text-3xl font-extrabold text-navy">{t("marketing.ctaTitle")}</h2>
          <p className="text-gray-400">{t("marketing.ctaSubtitle")}</p>
          <Link
            href="/auth/register"
            className="inline-flex items-center gap-2 bg-sky hover:bg-[#3a9fd6] text-white font-bold px-8 py-4 rounded-2xl shadow-lg active:scale-95 transition-all glow-sky"
          >
            {t("marketing.ctaButton")} ✨
          </Link>
        </div>
      </section>
    </div>
  );
}
