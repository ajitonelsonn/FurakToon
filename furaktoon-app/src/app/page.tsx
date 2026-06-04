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
    // Fetch last 6 generations for the dashboard preview
    const { data } = await supabase
      .from("generations")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(6);

    const recent = (data ?? []) as Generation[];
    return <LoggedInHome email={user.email ?? ""} recent={recent} />;
  }

  return <MarketingHome />;
}

/* ── Logged-in dashboard view ── */
function LoggedInHome({ email, recent }: { email: string; recent: Generation[] }) {
  const firstName = email.split("@")[0];

  return (
    <div className="flex-1 px-4 py-10 max-w-5xl mx-auto w-full space-y-10">
      {/* Welcome banner */}
      <div className="bg-linear-to-r from-fuchsia-500 to-violet-500 rounded-3xl p-7 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-lg">
        <div className="text-white text-center sm:text-left">
          <p className="text-sm font-medium opacity-80">Welcome back 👋</p>
          <h1 className="text-2xl sm:text-3xl font-extrabold mt-1">{firstName}</h1>
          <p className="text-sm opacity-70 mt-1">Ready to create something beautiful?</p>
        </div>
        <Link
          href="/create"
          className="shrink-0 bg-white text-fuchsia-600 hover:bg-fuchsia-50 font-bold px-7 py-3 rounded-2xl shadow-md active:scale-95 transition-all duration-150 text-base"
        >
          ✨ Create new toon
        </Link>
      </div>

      {/* Quick action cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link
          href="/create"
          className="bg-white rounded-3xl shadow-md hover:shadow-lg p-6 flex items-center gap-4 transition-all group"
        >
          <span className="text-4xl">🎨</span>
          <div>
            <h2 className="font-bold text-gray-800 text-base group-hover:text-fuchsia-600 transition-colors">
              Generate
            </h2>
            <p className="text-sm text-gray-400">Turn your idea into anime or cartoon art</p>
          </div>
        </Link>
        <Link
          href="/gallery"
          className="bg-white rounded-3xl shadow-md hover:shadow-lg p-6 flex items-center gap-4 transition-all group"
        >
          <span className="text-4xl">🖼️</span>
          <div>
            <h2 className="font-bold text-gray-800 text-base group-hover:text-fuchsia-600 transition-colors">
              My Gallery
            </h2>
            <p className="text-sm text-gray-400">Browse all your past creations</p>
          </div>
        </Link>
      </div>

      {/* Recent creations */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-800">Recent creations</h2>
          {recent.length > 0 && (
            <Link href="/gallery" className="text-sm text-fuchsia-600 hover:underline font-medium">
              View all →
            </Link>
          )}
        </div>

        {recent.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-md p-12 text-center text-gray-400">
            <p className="text-4xl mb-3">🌟</p>
            <p className="font-medium">No creations yet</p>
            <p className="text-sm mt-1">Hit Generate above to make your first toon!</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {recent.map((gen) => (
              <div
                key={gen.id}
                className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-lg transition-shadow group"
              >
                <div className="relative aspect-square">
                  <Image
                    src={gen.image_url}
                    alt={gen.prompt}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    unoptimized
                  />
                  <span
                    className={`absolute top-2 left-2 text-xs font-semibold px-2 py-0.5 rounded-full shadow ${
                      gen.style === "anime"
                        ? "bg-fuchsia-500 text-white"
                        : "bg-violet-500 text-white"
                    }`}
                  >
                    {gen.style}
                  </span>
                </div>
                <p className="p-2 text-xs text-gray-500 truncate">{gen.prompt}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Marketing / logged-out view ── */
function MarketingHome() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 py-20 text-center">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex justify-center">
          <Image
            src="/logo-with-text.png"
            alt="FurakToon — Beautiful AI Cartoons"
            width={280}
            height={280}
            className="w-56 sm:w-64 h-auto"
            priority
          />
        </div>

        <div className="inline-flex items-center gap-2 bg-fuchsia-50 border border-fuchsia-100 text-fuchsia-600 text-xs font-semibold px-4 py-1.5 rounded-full">
          ✨ Powered by Together AI
        </div>

        <h1 className="text-5xl sm:text-6xl font-extrabold leading-tight tracking-tight text-gray-900">
          Beautiful{" "}
          <span className="text-transparent bg-clip-text bg-linear-to-r from-fuchsia-500 to-violet-500">
            cartoons
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
            className="inline-flex items-center justify-center gap-2 bg-linear-to-r from-fuchsia-500 to-pink-500 hover:from-fuchsia-600 hover:to-pink-600 text-white font-bold text-base px-8 py-4 rounded-2xl shadow-lg hover:shadow-xl active:scale-95 transition-all duration-150"
          >
            Start creating for free →
          </Link>
          <Link
            href="/auth/login"
            className="inline-flex items-center justify-center bg-white border border-gray-200 hover:border-gray-300 text-gray-700 font-semibold text-base px-8 py-4 rounded-2xl hover:bg-gray-50 transition-all duration-150"
          >
            Sign in
          </Link>
        </div>
      </div>

      {/* Feature cards */}
      <div className="mt-20 grid grid-cols-1 sm:grid-cols-3 gap-5 max-w-3xl mx-auto w-full">
        {[
          { icon: "🎌", title: "Anime & Cartoon", desc: "Switch between Anime and Cartoon styles with a single toggle." },
          { icon: "⚡", title: "2 AI Models", desc: "Choose from Flux Fast and Stable Diffusion XL." },
          { icon: "🛡️", title: "Safety First", desc: "Every prompt is checked before generation so the app stays safe." },
        ].map((f) => (
          <div key={f.title} className="bg-white rounded-3xl shadow-md p-6 text-left hover:shadow-lg transition-shadow">
            <div className="text-3xl mb-3">{f.icon}</div>
            <h3 className="font-bold text-gray-800 text-base mb-1">{f.title}</h3>
            <p className="text-sm text-gray-400">{f.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
