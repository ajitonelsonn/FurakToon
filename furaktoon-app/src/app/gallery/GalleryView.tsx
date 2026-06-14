"use client";

import Image from "next/image";
import Link from "next/link";
import type { Generation } from "@/lib/supabase/types";
import { IMAGE_MODELS } from "@/lib/models";
import DownloadButton from "@/components/DownloadButton";
import { useI18n, useT } from "@/lib/i18n/context";

export function GalleryView({ items }: Readonly<{ items: Generation[] }>) {
  const t = useT();

  const countLabel =
    items.length === 0
      ? t("gallery.noToons")
      : t("gallery.countCreated", {
          count: items.length,
          // Used by locales (e.g. English/Portuguese) that pluralize with "s".
          plural: items.length === 1 ? "" : "s",
        });

  return (
    <div className="flex-1 px-4 sm:px-6 py-10 max-w-6xl mx-auto w-full">

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-navy">{t("gallery.title")}</h1>
          <p className="text-gray-400 text-sm mt-1">{countLabel}</p>
        </div>
        <Link
          href="/create"
          className="flex items-center gap-2 bg-navy hover:bg-[#2a3f8f] text-white font-bold px-5 py-2.5 rounded-2xl shadow-lg hover:shadow-xl active:scale-95 transition-all duration-150 text-sm"
        >
          ✨ {t("gallery.createNew")}
        </Link>
      </div>

      {items.length === 0 ? (
        /* Empty state */
        <div className="bg-white rounded-3xl border-2 border-dashed border-sky/30 p-16 text-center">
          <div className="text-5xl mb-4 float inline-block">🎨</div>
          <p className="font-extrabold text-navy text-xl mt-2">{t("gallery.emptyTitle")}</p>
          <p className="text-sm text-gray-400 mt-2 mb-6">{t("gallery.emptyHint")}</p>
          <Link
            href="/create"
            className="inline-flex items-center gap-2 bg-sky hover:bg-[#3a9fd6] text-white font-bold px-7 py-3.5 rounded-2xl shadow-lg active:scale-95 transition-all glow-sky"
          >
            ✨ {t("gallery.makeFirst")}
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {items.map((gen) => <GalleryCard key={gen.id} gen={gen} />)}
        </div>
      )}
    </div>
  );
}

function GalleryCard({ gen }: Readonly<{ gen: Generation }>) {
  const t = useT();
  const { locale } = useI18n();
  const modelName = IMAGE_MODELS.find((m) => m.id === gen.model)?.name ?? gen.model;
  // pt_pt is not a valid BCP-47 tag for Intl; map it to pt-PT.
  const intlLocale = locale === "pt_pt" ? "pt-PT" : locale;
  const date = new Date(gen.created_at).toLocaleDateString(intlLocale, {
    month: "short", day: "numeric", year: "numeric",
  });

  return (
    <div className="group bg-white rounded-3xl shadow-md hover:shadow-xl transition-all duration-200 overflow-hidden border border-gray-100 hover:border-sky/20">

      {/* Image */}
      <div className="relative aspect-square overflow-hidden">
        <Image
          src={gen.image_url}
          alt={gen.prompt}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          unoptimized
        />
        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-linear-to-t from-navy/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />

        {/* Style badge */}
        <span className={`absolute top-3 left-3 text-xs font-bold px-3 py-1 rounded-full shadow-md ${
          gen.style === "anime" ? "bg-sky text-white" : "bg-orange text-white"
        }`}>
          {gen.style === "anime" ? `🎌 ${t("create.anime")}` : `🎨 ${t("create.cartoon")}`}
        </span>

        {/* Download on hover */}
        <DownloadButton imageUrl={gen.image_url} style={gen.style} model={gen.model} />
      </div>

      {/* Info */}
      <div className="p-4 space-y-2">
        <p className="text-sm text-ink font-semibold line-clamp-2 leading-snug">{gen.prompt}</p>
        <div className="flex items-center justify-between text-xs text-gray-400 pt-1 border-t border-gray-50">
          <span className="bg-navy/5 text-navy font-semibold px-2.5 py-1 rounded-lg">{modelName}</span>
          <span>{date}</span>
        </div>
      </div>
    </div>
  );
}
