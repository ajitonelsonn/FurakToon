"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { register } from "@/app/actions/auth";
import { useT } from "@/lib/i18n/context";

export default function RegisterPage() {
  const t = useT();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);
    const result = await register(formData);
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-cream via-sky/5 to-navy/5 flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="flex flex-col items-center mb-8 gap-3">
          <Image src="/logo-no-text.png" alt="FurakToon" width={80} height={80} className="w-20 h-20 object-contain float" priority />
          <div>
            <p className="text-center font-extrabold text-2xl text-navy">
              Furak<span className="text-sky">Toon</span>
            </p>
            <p className="text-center text-xs text-gray-400 mt-0.5">{t("auth.tagline")}</p>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-xl border border-navy/5 p-8">
          <h2 className="text-2xl font-extrabold text-navy mb-1 text-center">{t("auth.registerTitle")}</h2>
          <p className="text-center text-sm text-gray-400 mb-7">{t("auth.registerSubtitle")}</p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 rounded-2xl p-3 mb-5 text-sm font-medium">
              {error}
            </div>
          )}

          <form action={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-navy mb-1.5">{t("auth.emailLabel")}</label>
              <input
                id="email" name="email" type="email" required
                placeholder={t("auth.emailPlaceholder")}
                className="w-full border-2 border-gray-100 hover:border-sky/30 focus:border-sky rounded-2xl px-4 py-3 text-ink text-sm focus:outline-none transition-colors bg-cream/50"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-navy mb-1.5">{t("auth.passwordLabel")}</label>
              <input
                id="password" name="password" type="password" required minLength={6}
                placeholder={t("auth.registerPasswordPlaceholder")}
                className="w-full border-2 border-gray-100 hover:border-sky/30 focus:border-sky rounded-2xl px-4 py-3 text-ink text-sm focus:outline-none transition-colors bg-cream/50"
              />
            </div>

            <button
              type="submit" disabled={loading}
              className="w-full mt-2 bg-sky hover:bg-[#3a9fd6] text-white font-bold py-3.5 rounded-2xl shadow-lg hover:shadow-xl active:scale-95 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed glow-sky"
            >
              {loading ? t("auth.creatingAccount") : `${t("auth.getStartedCta")} ✨`}
            </button>
          </form>

          {/* Feature pills */}
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            {[
              `🎌 ${t("create.anime")}`,
              `🎨 ${t("create.cartoon")}`,
              `⚡ ${t("marketing.featFastTitle")}`,
              `🛡️ ${t("marketing.featSafeTitle")}`,
            ].map((f) => (
              <span key={f} className="text-xs bg-navy/5 text-navy font-semibold px-3 py-1 rounded-full">{f}</span>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t border-gray-100 text-center text-sm text-gray-400">
            {t("auth.haveAccount")}{" "}
            <Link href="/auth/login" className="text-sky font-bold hover:underline">{t("auth.signInLink")}</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
