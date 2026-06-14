"use client";

import { useEffect, useRef, useState } from "react";
import { useI18n } from "@/lib/i18n/context";
import { LOCALES } from "@/lib/i18n/translations";

export default function LanguageSwitcher() {
  const { locale, setLocale, t } = useI18n();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const current = LOCALES.find((l) => l.code === locale);

  // Close on outside click.
  useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={t("language.label")}
        className="flex items-center gap-1.5 rounded-full border border-navy/15 px-3 py-1.5 text-sm font-medium text-navy/70 hover:border-sky/40 hover:text-sky transition-colors"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="h-4 w-4"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        </svg>
        <span>{current?.nativeName ?? "Language"}</span>
      </button>

      {open && (
        <ul
          role="listbox"
          className="glass absolute end-0 z-50 mt-2 max-h-80 w-56 overflow-y-auto rounded-2xl py-1 shadow-lift"
        >
          {LOCALES.map((l) => (
            <li key={l.code}>
              <button
                type="button"
                role="option"
                aria-selected={l.code === locale}
                onClick={() => {
                  setLocale(l.code);
                  setOpen(false);
                }}
                className={`flex w-full items-center justify-between px-4 py-2 text-start text-sm hover:bg-sky/10 transition-colors ${
                  l.code === locale
                    ? "font-semibold text-sky"
                    : "text-navy/70"
                }`}
              >
                <span>{l.nativeName}</span>
                <span className="text-xs text-navy/40">{l.name}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
