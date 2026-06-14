"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import {
  DEFAULT_LOCALE,
  LOCALES,
  RTL_LOCALES,
  translations,
  type Locale,
  type TranslationKey,
} from "./translations";

const STORAGE_KEY = "furaktoon.locale";

// Values substituted into {placeholder} tokens in a translation string.
type TParams = Record<string, string | number>;

type I18nContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: TranslationKey, params?: TParams) => string;
};

// Replace {token} occurrences with the matching param value. Unmatched tokens
// are left as-is so missing data is visible rather than silently dropped.
function interpolate(template: string, params?: TParams): string {
  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in params ? String(params[key]) : match
  );
}

const I18nContext = createContext<I18nContextValue | null>(null);

function isLocale(value: string | null | undefined): value is Locale {
  return !!value && LOCALES.some((l) => l.code === value);
}

function applyDocumentLocale(locale: Locale) {
  if (typeof document === "undefined") return;
  document.documentElement.lang = locale;
  document.documentElement.dir = RTL_LOCALES.includes(locale) ? "rtl" : "ltr";
}

// --- localStorage-backed external store ---
// Using useSyncExternalStore keeps the persisted locale in sync without calling
// setState in an effect, and renders the default locale during SSR/hydration.

const listeners = new Set<() => void>();

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  // Sync across tabs/windows too.
  const onStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) onChange();
  };
  globalThis.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(onChange);
    globalThis.removeEventListener("storage", onStorage);
  };
}

function getSnapshot(): Locale {
  const stored = localStorage.getItem(STORAGE_KEY);
  return isLocale(stored) ? stored : DEFAULT_LOCALE;
}

// The server (and the first client render, before hydration) always uses the
// default locale to avoid a hydration mismatch.
function getServerSnapshot(): Locale {
  return DEFAULT_LOCALE;
}

function persistLocale(next: Locale) {
  localStorage.setItem(STORAGE_KEY, next);
  applyDocumentLocale(next);
  listeners.forEach((l) => l());
}

export function I18nProvider({ children }: Readonly<{ children: ReactNode }>) {
  const locale = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  );

  const setLocale = useCallback((next: Locale) => {
    persistLocale(next);
  }, []);

  const t = useCallback(
    (key: TranslationKey, params?: TParams): string => {
      const template =
        translations[locale]?.[key] ?? translations[DEFAULT_LOCALE][key] ?? key;
      return interpolate(template, params);
    },
    [locale]
  );

  const value = useMemo<I18nContextValue>(
    () => ({ locale, setLocale, t }),
    [locale, setLocale, t]
  );

  return (
    <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
  );
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error("useI18n must be used within an I18nProvider");
  }
  return ctx;
}

// Convenience hook for components that only need the translate function.
export function useT(): I18nContextValue["t"] {
  return useI18n().t;
}
