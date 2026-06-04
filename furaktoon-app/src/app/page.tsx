import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import type { Generation } from "@/lib/supabase/types";

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const { data } = await supabase
      .from("generations")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(6);

    return <LoggedInHome email={user.email ?? ""} recent={(data ?? []) as Generation[]} />;
  }

  return <MarketingHome />;
}

/* ── Logged-in dashboard ── */
function LoggedInHome({ email, recent }: Readonly<{ email: string; recent: Generation[] }>) {
  const name = email.split("@")[0];

  return (
    <div className="flex-1 px-4 sm:px-6 py-10 max-w-6xl mx-auto w-full space-y-8">

      {/* Welcome banner */}
      <div className="relative overflow-hidden rounded-3xl bg-navy p-7 sm:p-9 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-sky/10 rounded-full -translate-y-1/2 translate-x-1/4 pointer-events-none" />
        <div className="absolute bottom-0 left-20 w-40 h-40 bg-orange/10 rounded-full translate-y-1/2 pointer-events-none" />

        <div className="relative text-white text-center sm:text-left">
          <p className="text-sm font-medium text-sky">Welcome back 👋</p>
          <h1 className="text-2xl sm:text-3xl font-extrabold mt-1 capitalize">{name}</h1>
          <p className="text-sm text-white/60 mt-1">What beautiful toon will you create today?</p>
        </div>

        <Link
          href="/create"
          className="relative shrink-0 bg-sky hover:bg-[#3a9fd6] text-white font-bold px-7 py-3.5 rounded-2xl shadow-lg active:scale-95 transition-all duration-150 text-base glow-sky"
        >
          ✨ Create new toon
        </Link>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link href="/create" className="group bg-white border-2 border-transparent hover:border-sky/40 rounded-3xl shadow-md hover:shadow-xl p-6 flex items-center gap-5 transition-all duration-200">
          <div className="w-14 h-14 rounded-2xl bg-sky/10 flex items-center justify-center text-3xl shrink-0 group-hover:scale-110 transition-transform">🎨</div>
          <div>
            <h2 className="font-bold text-navy text-base">Generate</h2>
            <p className="text-sm text-gray-400 mt-0.5">Turn your idea into anime or cartoon art</p>
          </div>
          <span className="ml-auto text-gray-300 group-hover:text-sky transition-colors text-xl">→</span>
        </Link>

        <Link href="/gallery" className="group bg-white border-2 border-transparent hover:border-orange/40 rounded-3xl shadow-md hover:shadow-xl p-6 flex items-center gap-5 transition-all duration-200">
          <div className="w-14 h-14 rounded-2xl bg-orange/10 flex items-center justify-center text-3xl shrink-0 group-hover:scale-110 transition-transform">🖼️</div>
          <div>
            <h2 className="font-bold text-navy text-base">My Gallery</h2>
            <p className="text-sm text-gray-400 mt-0.5">Browse all your past creations</p>
          </div>
          <span className="ml-auto text-gray-300 group-hover:text-orange transition-colors text-xl">→</span>
        </Link>
      </div>

      {/* Recent creations */}
      <div>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-extrabold text-navy">Recent creations</h2>
          {recent.length > 0 && (
            <Link href="/gallery" className="text-sm text-sky hover:underline font-semibold">
              View all →
            </Link>
          )}
        </div>

        {recent.length === 0 ? (
          <div className="bg-white rounded-3xl border-2 border-dashed border-sky/30 p-14 text-center">
            <div className="text-5xl mb-3 float inline-block">🌟</div>
            <p className="font-bold text-navy text-lg mt-2">No creations yet</p>
            <p className="text-sm text-gray-400 mt-1 mb-5">Hit Generate above to make your first toon!</p>
            <Link href="/create" className="inline-flex items-center gap-2 bg-navy text-white font-bold px-6 py-3 rounded-2xl hover:bg-[#2a3f8f] transition-all active:scale-95 shadow-md">
              ✨ Make your first toon
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {recent.map((gen) => (
              <div key={gen.id} className="group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-200 border border-gray-100 hover:border-sky/30">
                <div className="relative aspect-square overflow-hidden">
                  <Image src={gen.image_url} alt={gen.prompt} fill className="object-cover group-hover:scale-105 transition-transform duration-300" unoptimized />
                  <div className="absolute inset-0 bg-linear-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <span className={`absolute top-2 left-2 text-xs font-bold px-2.5 py-1 rounded-full shadow-md ${gen.style === "anime" ? "bg-sky text-white" : "bg-orange text-white"}`}>
                    {gen.style}
                  </span>
                </div>
                <p className="px-3 py-2 text-xs text-gray-500 truncate font-medium">{gen.prompt}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Marketing / logged-out ── */
function MarketingHome() {
  return (
    <div className="flex-1 flex flex-col">
      {/* Hero */}
      <section className="relative flex flex-col items-center justify-center text-center px-4 pt-16 pb-20 overflow-hidden">
        {/* Background blobs */}
        <div className="absolute top-10 left-1/4 w-72 h-72 bg-sky/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-56 h-56 bg-orange/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-3xl mx-auto space-y-6">
          <Image
            src="/logo-with-text.png"
            alt="FurakToon"
            width={220}
            height={220}
            className="w-44 sm:w-52 h-auto mx-auto float"
            priority
          />

          <div className="inline-flex items-center gap-2 bg-sky/10 border border-sky/30 text-navy text-xs font-bold px-4 py-1.5 rounded-full">
            ✨ Powered by Together AI
          </div>

          <h1 className="text-5xl sm:text-6xl font-extrabold leading-tight tracking-tight text-ink">
            Beautiful{" "}
            <span className="relative inline-block">
              <span className="relative z-10 text-sky">cartoons</span>
              <span className="absolute -bottom-1 left-0 w-full h-3 bg-orange/20 rounded-full -z-0" />
            </span>
            ,<br />
            made by you.
          </h1>

          <p className="text-lg text-gray-500 max-w-md mx-auto leading-relaxed">
            Type an idea, pick a style, and let AI bring your anime or cartoon character to life in seconds.
          </p>

          <p className="text-xs text-gray-400">
            <em>furak</em> means &ldquo;beautiful&rdquo; in Tetum 🇹🇱
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Link
              href="/auth/register"
              className="inline-flex items-center justify-center gap-2 bg-navy hover:bg-[#2a3f8f] text-white font-bold text-base px-8 py-4 rounded-2xl shadow-xl hover:shadow-2xl active:scale-95 transition-all duration-150"
            >
              Start creating for free →
            </Link>
            <Link
              href="/auth/login"
              className="inline-flex items-center justify-center bg-white border-2 border-navy/20 hover:border-sky/60 text-navy font-bold text-base px-8 py-4 rounded-2xl hover:bg-sky/5 transition-all duration-150"
            >
              Sign in
            </Link>
          </div>
        </div>
      </section>

      {/* Feature strip */}
      <section className="bg-navy py-14 px-4">
        <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[
            { icon: "🎌", title: "Anime & Cartoon", desc: "One-tap toggle between Anime and Cartoon styles.", color: "bg-sky/20" },
            { icon: "⚡", title: "Fast AI Models", desc: "Flux Fast & Stable Diffusion XL — results in seconds.", color: "bg-orange/20" },
            { icon: "🛡️", title: "Safety First", desc: "Every prompt is checked before generation.", color: "bg-white/10" },
          ].map((f) => (
            <div key={f.title} className="flex items-start gap-4 p-6 rounded-3xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all">
              <div className={`w-12 h-12 rounded-2xl ${f.color} flex items-center justify-center text-2xl shrink-0`}>{f.icon}</div>
              <div>
                <h3 className="font-bold text-white text-base">{f.title}</h3>
                <p className="text-sm text-white/50 mt-1">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA bottom */}
      <section className="py-16 px-4 text-center bg-cream">
        <div className="max-w-lg mx-auto space-y-5">
          <h2 className="text-3xl font-extrabold text-navy">Ready to create?</h2>
          <p className="text-gray-400">Join and start generating beautiful toons for free.</p>
          <Link
            href="/auth/register"
            className="inline-flex items-center gap-2 bg-sky hover:bg-[#3a9fd6] text-white font-bold px-8 py-4 rounded-2xl shadow-lg active:scale-95 transition-all glow-sky"
          >
            Get started — it&apos;s free ✨
          </Link>
        </div>
      </section>
    </div>
  );
}
