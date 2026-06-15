"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";

// User preference. "system" follows the OS; light/dark are explicit overrides.
export type ThemePref = "light" | "dark" | "system";
// The actually-applied theme after resolving "system".
export type ResolvedTheme = "light" | "dark";

export const THEME_STORAGE_KEY = "furaktoon.theme";

type ThemeContextValue = {
  /** Stored preference (may be "system"). */
  preference: ThemePref;
  /** Resolved light/dark currently applied to <html>. */
  resolved: ResolvedTheme;
  /** Set an explicit preference. */
  setPreference: (pref: ThemePref) => void;
  /** Convenience: flip between light and dark (drops "system"). */
  toggle: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

function isPref(value: string | null | undefined): value is ThemePref {
  return value === "light" || value === "dark" || value === "system";
}

function systemPrefersDark(): boolean {
  return (
    typeof globalThis.matchMedia === "function" &&
    globalThis.matchMedia("(prefers-color-scheme: dark)").matches
  );
}

function resolve(pref: ThemePref): ResolvedTheme {
  if (pref === "system") return systemPrefersDark() ? "dark" : "light";
  return pref;
}

function applyTheme(resolved: ResolvedTheme) {
  if (typeof document === "undefined") return;
  document.documentElement.classList.toggle("dark", resolved === "dark");
  document.documentElement.style.colorScheme = resolved;
}

// ── localStorage + system-preference external store ──
const listeners = new Set<() => void>();

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  const onStorage = (e: StorageEvent) => {
    if (e.key === THEME_STORAGE_KEY) onChange();
  };
  globalThis.addEventListener("storage", onStorage);

  // React to OS theme changes while preference is "system".
  const mql = globalThis.matchMedia?.("(prefers-color-scheme: dark)");
  const onSystem = () => onChange();
  mql?.addEventListener("change", onSystem);

  return () => {
    listeners.delete(onChange);
    globalThis.removeEventListener("storage", onStorage);
    mql?.removeEventListener("change", onSystem);
  };
}

// Default preference for visitors who haven't chosen one yet. Dark by default.
const DEFAULT_PREF: ThemePref = "dark";

function getPrefSnapshot(): ThemePref {
  const stored = localStorage.getItem(THEME_STORAGE_KEY);
  return isPref(stored) ? stored : DEFAULT_PREF;
}

// SSR/first render: use the default preference to match the anti-flash script
// and avoid a hydration mismatch on the markup.
function getServerSnapshot(): ThemePref {
  return DEFAULT_PREF;
}

function persistPref(pref: ThemePref) {
  localStorage.setItem(THEME_STORAGE_KEY, pref);
  applyTheme(resolve(pref));
  listeners.forEach((l) => l());
}

export function ThemeProvider({ children }: Readonly<{ children: ReactNode }>) {
  const preference = useSyncExternalStore(
    subscribe,
    getPrefSnapshot,
    getServerSnapshot
  );
  const resolved = resolve(preference);

  const setPreference = useCallback((pref: ThemePref) => {
    persistPref(pref);
  }, []);

  const toggle = useCallback(() => {
    // Toggle relative to what's currently shown.
    persistPref(resolve(getPrefSnapshot()) === "dark" ? "light" : "dark");
  }, []);

  const value = useMemo<ThemeContextValue>(
    () => ({ preference, resolved, setPreference, toggle }),
    [preference, resolved, setPreference, toggle]
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return ctx;
}

/**
 * Inline script (stringified) that runs before paint to set the `dark` class
 * from the stored preference / system setting — prevents a flash of the wrong
 * theme. Injected via a <script> in the document <head>/<body> top.
 */
export const THEME_INIT_SCRIPT = `
(function(){
  try {
    var k = '${THEME_STORAGE_KEY}';
    var p = localStorage.getItem(k);
    var sysDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    // No saved preference defaults to dark; 'system' follows the OS.
    var dark = p === 'dark' || p === null || (p === 'system' && sysDark);
    var el = document.documentElement;
    el.classList.toggle('dark', dark);
    el.style.colorScheme = dark ? 'dark' : 'light';
  } catch (e) {}
})();
`;
