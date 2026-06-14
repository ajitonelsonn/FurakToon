"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { logout } from "@/app/actions/auth";
import { useT } from "@/lib/i18n/context";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import ThemeToggle from "@/components/ThemeToggle";
import type { User } from "@supabase/supabase-js";

export default function Navbar({ user }: Readonly<{ user: User | null }>) {
  const pathname = usePathname();
  const t = useT();

  const isActive = (href: string) => pathname === href;

  return (
    <nav className="sticky top-0 z-50 glass border-b border-white/40">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0 group">
          <Image
            src="/logo-no-text.png"
            alt="FurakToon"
            width={38}
            height={38}
            className="h-9 w-9 object-contain transition-transform duration-300 group-hover:rotate-[-8deg] group-hover:scale-110"
            priority
          />
          <span className="font-display font-extrabold text-xl tracking-tight text-navy">
            Furak<span className="text-gradient">Toon</span>
          </span>
        </Link>

        {/* Nav links */}
        <div className="flex items-center gap-1 sm:gap-2">
          {user ? (
            <>
              <Link
                href="/create"
                className={`flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-xl transition-all duration-150 ${
                  isActive("/create")
                    ? "bg-sky/15 text-navy shadow-sm"
                    : "text-navy/55 hover:text-navy hover:bg-white/60"
                }`}
              >
                <span>✨</span> {t("nav.create")}
              </Link>
              <Link
                href="/gallery"
                className={`flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-xl transition-all duration-150 ${
                  isActive("/gallery")
                    ? "bg-sky/15 text-navy shadow-sm"
                    : "text-navy/55 hover:text-navy hover:bg-white/60"
                }`}
              >
                <span>🖼️</span> {t("nav.gallery")}
              </Link>
              <ThemeToggle />
              <LanguageSwitcher />
              <form action={logout} className="ml-1">
                <button
                  type="submit"
                  className="text-sm text-navy/45 hover:text-red-500 px-3 py-2 rounded-xl hover:bg-red-50 transition-all duration-150 font-medium"
                >
                  {t("nav.signOut")}
                </button>
              </form>
            </>
          ) : (
            <>
              <Link
                href="/auth/login"
                className="text-sm font-semibold text-navy/55 hover:text-navy px-4 py-2 rounded-xl hover:bg-white/60 transition-all"
              >
                {t("nav.signIn")}
              </Link>
              <Link
                href="/auth/register"
                className="btn-gradient text-sm font-bold px-5 py-2.5 rounded-xl transition-all duration-150"
              >
                {t("nav.getStarted")}
              </Link>
              <ThemeToggle />
              <LanguageSwitcher />
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
