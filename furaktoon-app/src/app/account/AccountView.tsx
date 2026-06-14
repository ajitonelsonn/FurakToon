"use client";

import Link from "next/link";
import { useT } from "@/lib/i18n/context";
import { CREDIT_COST, nextResetDate } from "@/lib/credits";

export default function AccountView({
  email,
  balance,
  allowance,
}: Readonly<{ email: string; balance: number; allowance: number }>) {
  const t = useT();
  const pct = allowance > 0 ? Math.round((balance / allowance) * 100) : 0;
  const resetLabel = nextResetDate().toLocaleDateString(undefined, {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="flex-1 px-4 sm:px-6 py-10 max-w-2xl mx-auto w-full space-y-6">
      {/* Header */}
      <div className="animate-rise">
        <h1 className="font-display text-4xl font-extrabold text-navy">{t("account.title")}</h1>
        <p className="text-navy/55 text-sm mt-1.5">{t("account.subtitle")}</p>
      </div>

      {/* Credit balance card */}
      <div className="surface rounded-4xl p-7 animate-rise">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky/12 text-2xl">⚡</div>
          <div>
            <p className="text-xs font-bold text-navy/45 uppercase tracking-widest">
              {t("credits.label")}
            </p>
            <p className="font-display text-3xl font-extrabold text-navy leading-tight">
              {balance}
              <span className="text-base font-semibold text-navy/45">
                {" "}
                {t("account.ofAllowance", { allowance })}
              </span>
            </p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-5 h-2.5 w-full overflow-hidden rounded-full bg-navy/8">
          <div
            className="aurora h-full rounded-full transition-[width] duration-700"
            style={{ width: `${pct}%` }}
          />
        </div>

        <div className="mt-3 flex items-center justify-between text-xs text-navy/55">
          <span>{t("account.creditsLeft")}</span>
          <span>🔄 {t("credits.resetsOn", { date: resetLabel })}</span>
        </div>

        <p className="mt-4 text-sm text-navy/60">
          {t("credits.monthlyNote", { allowance })}
        </p>
      </div>

      {/* Usage breakdown */}
      <div className="surface rounded-4xl p-7 animate-rise">
        <p className="font-display font-bold text-navy mb-4">{t("account.usage")}</p>
        <ul className="space-y-3">
          <li className="flex items-center justify-between rounded-2xl border border-sky/20 bg-sky/10 px-4 py-3">
            <span className="text-sm font-semibold text-navy">🎨 {t("account.usageNormal")}</span>
            <span className="text-sm font-bold text-sky shrink-0">
              {CREDIT_COST.normal} {t("credits.label").toLowerCase()}
            </span>
          </li>
          <li className="flex items-center justify-between rounded-2xl border border-orange/20 bg-orange/10 px-4 py-3">
            <span className="text-sm font-semibold text-navy">🧑‍🎨 {t("account.usageReference")}</span>
            <span className="text-sm font-bold text-orange shrink-0">
              {CREDIT_COST.reference} {t("credits.label").toLowerCase()}
            </span>
          </li>
        </ul>
      </div>

      {/* Email + CTA */}
      <div className="surface rounded-4xl p-7 flex flex-col sm:flex-row items-center justify-between gap-4 animate-rise">
        <div className="text-center sm:text-left">
          <p className="text-xs font-bold text-navy/45 uppercase tracking-widest">Email</p>
          <p className="text-sm font-semibold text-navy mt-0.5 break-all">{email}</p>
        </div>
        <Link
          href="/create"
          className="btn-gradient shrink-0 font-bold px-6 py-3 rounded-2xl"
        >
          ✨ {t("account.startCreating")}
        </Link>
      </div>
    </div>
  );
}
