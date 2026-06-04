"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { logout } from "@/app/actions/auth";
import type { User } from "@supabase/supabase-js";

export default function Navbar({ user }: Readonly<{ user: User | null }>) {
  const pathname = usePathname();

  const isActive = (href: string) => pathname === href;

  return (
    <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-navy/10 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <Image
            src="/logo-no-text.png"
            alt="FurakToon"
            width={38}
            height={38}
            className="h-9 w-9 object-contain"
            priority
          />
          <span className="font-extrabold text-xl tracking-tight text-navy">
            Furak<span className="text-sky">Toon</span>
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
                    ? "bg-sky/10 text-navy"
                    : "text-gray-500 hover:text-navy hover:bg-gray-100"
                }`}
              >
                <span>✨</span> Create
              </Link>
              <Link
                href="/gallery"
                className={`flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-xl transition-all duration-150 ${
                  isActive("/gallery")
                    ? "bg-sky/10 text-navy"
                    : "text-gray-500 hover:text-navy hover:bg-gray-100"
                }`}
              >
                <span>🖼️</span> Gallery
              </Link>
              <form action={logout} className="ml-1">
                <button
                  type="submit"
                  className="text-sm text-gray-400 hover:text-red-400 px-3 py-2 rounded-xl hover:bg-red-50 transition-all duration-150 font-medium"
                >
                  Sign out
                </button>
              </form>
            </>
          ) : (
            <>
              <Link
                href="/auth/login"
                className="text-sm font-semibold text-gray-500 hover:text-navy px-4 py-2 rounded-xl hover:bg-gray-100 transition-all"
              >
                Sign in
              </Link>
              <Link
                href="/auth/register"
                className="text-sm font-bold bg-navy hover:bg-[#2a3f8f] text-white px-5 py-2.5 rounded-xl shadow-md hover:shadow-lg active:scale-95 transition-all duration-150"
              >
                Get started
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
