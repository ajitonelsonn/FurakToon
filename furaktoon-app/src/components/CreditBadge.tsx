"use client";

import Link from "next/link";
import { useCredits } from "@/lib/credits/context";
import { useT } from "@/lib/i18n/context";

// Small navbar pill showing the user's remaining credits. Turns amber/red as
// the balance runs low. Links to /create.
export default function CreditBadge() {
  const { balance } = useCredits();
  const t = useT();

  if (balance === null) return null;

  let tone = "border-sky/30 bg-sky/10 text-sky-600";
  if (balance === 0) tone = "border-red-300/50 bg-red-500/10 text-red-500";
  else if (balance <= 2) tone = "border-orange/40 bg-orange/10 text-orange-600";

  return (
    <Link
      href="/account"
      aria-label={t("credits.balance", { count: balance })}
      title={t("credits.balance", { count: balance })}
      className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-bold transition-colors ${tone}`}
    >
      <span aria-hidden="true">⚡</span>
      <span className="tabular-nums">{balance}</span>
    </Link>
  );
}
