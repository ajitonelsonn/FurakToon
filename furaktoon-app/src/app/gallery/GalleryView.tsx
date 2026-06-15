"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Generation } from "@/lib/supabase/types";
import { IMAGE_MODELS } from "@/lib/models";
import DownloadButton from "@/components/DownloadButton";
import { useI18n, useT } from "@/lib/i18n/context";

function formatDate(createdAt: string, locale: string): string {
  // pt_pt is not a valid BCP-47 tag for Intl; map it to pt-PT.
  const intlLocale = locale === "pt_pt" ? "pt-PT" : locale;
  return new Date(createdAt).toLocaleDateString(intlLocale, {
    month: "short", day: "numeric", year: "numeric",
  });
}

export function GalleryView({ items }: Readonly<{ items: Generation[] }>) {
  const t = useT();
  const [active, setActive] = useState<Generation | null>(null);

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
          <h1 className="font-display text-4xl font-extrabold text-navy">{t("gallery.title")}</h1>
          <p className="text-navy/55 text-sm mt-1">{countLabel}</p>
        </div>
        <Link
          href="/create"
          className="btn-gradient flex items-center gap-2 font-bold px-5 py-2.5 rounded-2xl text-sm"
        >
          ✨ {t("gallery.createNew")}
        </Link>
      </div>

      {items.length === 0 ? (
        /* Empty state */
        <div className="surface rounded-4xl border-2 border-dashed border-sky/30 p-16 text-center">
          <div className="text-5xl mb-4 float inline-block">🎨</div>
          <p className="font-display font-extrabold text-navy text-xl mt-2">{t("gallery.emptyTitle")}</p>
          <p className="text-sm text-navy/55 mt-2 mb-6">{t("gallery.emptyHint")}</p>
          <Link
            href="/create"
            className="btn-gradient inline-flex items-center gap-2 font-bold px-7 py-3.5 rounded-2xl"
          >
            ✨ {t("gallery.makeFirst")}
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {items.map((gen) => (
            <GalleryCard key={gen.id} gen={gen} onOpen={() => setActive(gen)} />
          ))}
        </div>
      )}

      {active && (
        <Lightbox gen={active} onClose={() => setActive(null)} />
      )}
    </div>
  );
}

function GalleryCard({
  gen,
  onOpen,
}: Readonly<{ gen: Generation; onOpen: () => void }>) {
  const t = useT();
  const { locale } = useI18n();
  const modelName = IMAGE_MODELS.find((m) => m.id === gen.model)?.name ?? gen.model;
  const date = formatDate(gen.created_at, locale);

  return (
    <div className="group surface rounded-3xl hover:shadow-lift hover:-translate-y-1 transition-all duration-200 overflow-hidden hover:border-sky/20">

      {/* Image — click to open wide */}
      <button
        type="button"
        onClick={onOpen}
        aria-label={t("gallery.viewImage")}
        className="relative aspect-square w-full overflow-hidden block cursor-zoom-in"
      >
        <Image
          src={gen.image_url}
          alt={gen.prompt}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          unoptimized
        />
        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-linear-to-t from-navy/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />

        {/* Expand hint */}
        <span className="absolute bottom-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-navy shadow-md opacity-0 group-hover:opacity-100 transition-opacity">
          ⤢
        </span>

        {/* Style badge */}
        <span className={`absolute top-3 left-3 text-xs font-bold px-3 py-1 rounded-full shadow-md ${
          gen.style === "anime" ? "bg-sky text-white" : "bg-orange text-white"
        }`}>
          {gen.style === "anime" ? `🎌 ${t("create.anime")}` : `🎨 ${t("create.cartoon")}`}
        </span>
      </button>

      {/* Info */}
      <div className="p-4 space-y-2">
        <p className="text-sm text-ink font-semibold line-clamp-2 leading-snug">{gen.prompt}</p>
        <div className="flex items-center justify-between text-xs text-navy/45 pt-1 border-t border-navy/8">
          <span className="bg-navy/8 text-navy font-semibold px-2.5 py-1 rounded-lg">{modelName}</span>
          <span>{date}</span>
        </div>
        <DownloadButton imageUrl={gen.image_url} style={gen.style} model={gen.model} />
      </div>
    </div>
  );
}

function Lightbox({
  gen,
  onClose,
}: Readonly<{ gen: Generation; onClose: () => void }>) {
  const t = useT();
  const { locale } = useI18n();
  const modelName = IMAGE_MODELS.find((m) => m.id === gen.model)?.name ?? gen.model;
  const date = formatDate(gen.created_at, locale);

  // Close on Escape + lock body scroll while open.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      {/* Backdrop — click to close */}
      <button
        type="button"
        aria-label={t("gallery.close")}
        onClick={onClose}
        className="absolute inset-0 bg-navy/70 backdrop-blur-sm cursor-zoom-out"
      />

      {/* Content */}
      <div className="relative z-10 w-full max-w-3xl max-h-[90vh] overflow-y-auto glass rounded-4xl p-4 sm:p-5">
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          aria-label={t("gallery.close")}
          className="absolute top-3 right-3 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-navy font-bold shadow-md hover:bg-white transition-colors"
        >
          ✕
        </button>

        {/* Wide image */}
        <div className="rounded-3xl overflow-hidden bg-navy/5">
          <Image
            src={gen.image_url}
            alt={gen.prompt}
            width={1024}
            height={1024}
            className="w-full h-auto object-contain"
            unoptimized
            priority
          />
        </div>

        {/* Details */}
        <div className="mt-4 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`text-xs font-bold px-3 py-1 rounded-full text-white ${
              gen.style === "anime" ? "bg-sky" : "bg-orange"
            }`}>
              {gen.style === "anime" ? `🎌 ${t("create.anime")}` : `🎨 ${t("create.cartoon")}`}
            </span>
            <span className="text-xs font-semibold bg-navy/8 text-navy px-2.5 py-1 rounded-lg">{modelName}</span>
            <span className="text-xs text-navy/45">{date}</span>
          </div>

          <p className="text-sm text-ink leading-relaxed">{gen.prompt}</p>

          {/* Download */}
          <a
            href={gen.image_url}
            download="furaktoon.png"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => {
              if (typeof pendo !== "undefined") {
                pendo.track("image_downloaded", {
                  source: "gallery_lightbox",
                  style: gen.style,
                  modelId: gen.model,
                });
              }
            }}
            className="btn-gradient inline-flex w-full items-center justify-center gap-2 font-bold py-3.5 rounded-2xl"
          >
            ↓ {t("create.download")}
          </a>
        </div>
      </div>
    </div>
  );
}
