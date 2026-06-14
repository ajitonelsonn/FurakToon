"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { login } from "@/app/actions/auth";
import { useT } from "@/lib/i18n/context";
import AuthShowcasePanel from "@/components/AuthShowcasePanel";

export default function LoginPage() {
  const t = useT();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);
    const result = await login(formData);
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  }

  return (
    <div className="flex-1 flex items-center justify-center p-4 sm:p-8">
      <div className="grid w-full max-w-5xl gap-8 lg:grid-cols-2 items-stretch">

        {/* Artwork side */}
        <AuthShowcasePanel
          image="/bg/anime1.jpeg"
          headline={t("auth.loginTitle")}
          sub={t("marketing.subtitle")}
        />

        {/* Form side */}
        <div className="flex items-center animate-rise">
          <div className="w-full max-w-md mx-auto">
            {/* Logo */}
            <div className="flex flex-col items-center mb-8 gap-3">
              <Image src="/logo-no-text.png" alt="FurakToon" width={80} height={80} className="w-20 h-20 object-contain float" priority />
              <div>
                <p className="text-center font-display font-extrabold text-2xl text-navy">
                  Furak<span className="text-gradient">Toon</span>
                </p>
                <p className="text-center text-xs text-navy/50 mt-0.5">{t("auth.tagline")}</p>
              </div>
            </div>

            <div className="glass rounded-4xl p-8">
              <h2 className="font-display text-2xl font-extrabold text-navy mb-1 text-center">{t("auth.loginTitle")}</h2>
              <p className="text-center text-sm text-navy/55 mb-7">{t("auth.loginSubtitle")}</p>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 rounded-2xl p-3 mb-5 text-sm font-medium animate-fade-in">
                  {error}
                </div>
              )}

              <form action={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-navy mb-1.5">{t("auth.emailLabel")}</label>
                  <input
                    id="email" name="email" type="email" required
                    placeholder={t("auth.emailPlaceholder")}
                    className="w-full border-2 border-navy/10 hover:border-sky/40 focus:border-sky rounded-2xl px-4 py-3 text-ink text-sm focus:outline-none transition-colors bg-white/70"
                  />
                </div>
                <div>
                  <label htmlFor="password" className="block text-sm font-semibold text-navy mb-1.5">{t("auth.passwordLabel")}</label>
                  <input
                    id="password" name="password" type="password" required
                    placeholder={t("auth.loginPasswordPlaceholder")}
                    className="w-full border-2 border-navy/10 hover:border-sky/40 focus:border-sky rounded-2xl px-4 py-3 text-ink text-sm focus:outline-none transition-colors bg-white/70"
                  />
                </div>

                <button
                  type="submit" disabled={loading}
                  className="btn-gradient w-full mt-2 font-bold py-3.5 rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? t("auth.signingIn") : `${t("auth.signInCta")} →`}
                </button>
              </form>

              <div className="mt-4 pt-4 border-t border-navy/10 text-center text-sm text-navy/55">
                {t("auth.noAccount")}{" "}
                <Link href="/auth/register" className="text-sky font-bold hover:underline">{t("auth.createOne")}</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
