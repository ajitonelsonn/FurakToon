"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { logout } from "@/app/actions/auth";
import type { User } from "@supabase/supabase-js";

export default function Navbar({ user }: { user: User | null }) {
  const pathname = usePathname();

  const navLink = (href: string, label: string) => (
    <Link
      href={href}
      className={`text-sm font-medium transition-colors ${
        pathname === href
          ? "text-fuchsia-600"
          : "text-gray-500 hover:text-gray-800"
      }`}
    >
      {label}
    </Link>
  );

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center">
          <Image
            src="/logo-with-text.png"
            alt="FurakToon"
            width={120}
            height={40}
            className="h-9 w-auto object-contain"
            priority
          />
        </Link>

        <div className="flex items-center gap-5">
          {user ? (
            <>
              {navLink("/create", "Create")}
              {navLink("/gallery", "Gallery")}
              <form action={logout}>
                <button
                  type="submit"
                  className="text-sm text-gray-400 hover:text-gray-700 transition-colors"
                >
                  Sign out
                </button>
              </form>
            </>
          ) : (
            <>
              {navLink("/auth/login", "Sign in")}
              <Link
                href="/auth/register"
                className="text-sm font-semibold bg-fuchsia-500 hover:bg-fuchsia-600 text-white px-4 py-2 rounded-xl transition-colors"
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
