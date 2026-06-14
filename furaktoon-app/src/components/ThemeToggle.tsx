"use client";

import { useSyncExternalStore } from "react";
import { useTheme } from "@/lib/theme/context";
import { useT } from "@/lib/i18n/context";

// Tiny external store that is `false` on the server / first hydration render and
// `true` afterwards — lets us avoid a hydration mismatch without setState-in-
// effect (which the lint rules disallow).
const emptySubscribe = () => () => {};

// Sun/moon icon button that flips between light and dark.
export default function ThemeToggle() {
  const { resolved, toggle } = useTheme();
  const t = useT();

  // The server (and first client render) can't know the resolved theme, so we
  // render a neutral state until mounted to avoid a hydration mismatch.
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
  const isDark = mounted && resolved === "dark";

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={t("theme.toggle")}
      title={isDark ? t("theme.light") : t("theme.dark")}
      className="relative flex h-9 w-9 items-center justify-center rounded-full border border-navy/10 text-navy/70 hover:text-sky hover:border-sky/40 transition-colors"
    >
      {/* Sun */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        className={`absolute h-4.5 w-4.5 transition-all duration-300 ${
          isDark ? "scale-0 -rotate-90 opacity-0" : "scale-100 rotate-0 opacity-100"
        }`}
      >
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
      </svg>
      {/* Moon */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        className={`absolute h-4.5 w-4.5 transition-all duration-300 ${
          isDark ? "scale-100 rotate-0 opacity-100" : "scale-0 rotate-90 opacity-0"
        }`}
      >
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
      </svg>
    </button>
  );
}
