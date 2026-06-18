"use client";

import { useEffect } from "react";
import Image from "next/image";
import type { Generation } from "@/lib/supabase/types";
import { IMAGE_MODELS } from "@/lib/models";
import { useI18n, useT } from "@/lib/i18n/context";

// pt_pt is not a valid BCP-47 tag for Intl; map it to pt-PT.
function formatDate(createdAt: string, locale: string): string {
  const intlLocale = locale === "pt_pt" ? "pt-PT" : locale;
  return new Date(createdAt).toLocaleDateString(intlLocale, {
    month: "short", day: "numeric", year: "numeric",
  });
}

// Shared wide-image viewer with download. Used by the gallery and the
// logged-in dashboard's recent creations. `source` tags the download event.
export default function ImageLightbox({
  gen,
  onClose,
  source = "lightbox",
}: Readonly<{ gen: Generation; onClose: () => void; source?: string }>) {
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
                  source,
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
