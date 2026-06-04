"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { login } from "@/app/actions/auth";

export default function LoginPage() {
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
    <div className="min-h-screen bg-linear-to-br from-cream via-sky/5 to-navy/5 flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="flex flex-col items-center mb-8 gap-3">
          <Image src="/logo-no-text.png" alt="FurakToon" width={80} height={80} className="w-20 h-20 object-contain float" priority />
          <div>
            <p className="text-center font-extrabold text-2xl text-navy">
              Furak<span className="text-sky">Toon</span>
            </p>
            <p className="text-center text-xs text-gray-400 mt-0.5">Beautiful AI Cartoons</p>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-xl border border-navy/5 p-8">
          <h2 className="text-2xl font-extrabold text-navy mb-1 text-center">Welcome back!</h2>
          <p className="text-center text-sm text-gray-400 mb-7">Sign in to continue creating</p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 rounded-2xl p-3 mb-5 text-sm font-medium">
              {error}
            </div>
          )}

          <form action={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-navy mb-1.5">Email</label>
              <input
                id="email" name="email" type="email" required
                placeholder="you@example.com"
                className="w-full border-2 border-gray-100 hover:border-sky/30 focus:border-sky rounded-2xl px-4 py-3 text-ink text-sm focus:outline-none transition-colors bg-cream/50"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-navy mb-1.5">Password</label>
              <input
                id="password" name="password" type="password" required
                placeholder="••••••••"
                className="w-full border-2 border-gray-100 hover:border-sky/30 focus:border-sky rounded-2xl px-4 py-3 text-ink text-sm focus:outline-none transition-colors bg-cream/50"
              />
            </div>

            <button
              type="submit" disabled={loading}
              className="w-full mt-2 bg-navy hover:bg-[#2a3f8f] text-white font-bold py-3.5 rounded-2xl shadow-lg hover:shadow-xl active:scale-95 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Signing in…" : "Sign in →"}
            </button>
          </form>

          <div className="mt-4 pt-4 border-t border-gray-100 text-center text-sm text-gray-400">
            Don&apos;t have an account?{" "}
            <Link href="/auth/register" className="text-sky font-bold hover:underline">Create one</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
