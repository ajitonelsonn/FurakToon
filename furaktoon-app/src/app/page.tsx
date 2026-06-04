import Link from "next/link";
import Image from "next/image";

export default function HomePage() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 py-20 text-center">
      {/* Hero */}
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
          Type an idea, pick a style, and let AI bring your anime or cartoon character to life in
          seconds.
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
          {
            icon: "🎌",
            title: "Anime & Cartoon",
            desc: "Switch between Anime and Cartoon styles with a single toggle.",
          },
          {
            icon: "⚡",
            title: "5 AI Models",
            desc: "Choose from Flux Fast, SDXL, Dreamshaper and more.",
          },
          {
            icon: "🛡️",
            title: "Safety First",
            desc: "Every prompt is checked before generation so the app stays safe.",
          },
        ].map((f) => (
          <div
            key={f.title}
            className="bg-white rounded-3xl shadow-md p-6 text-left hover:shadow-lg transition-shadow"
          >
            <div className="text-3xl mb-3">{f.icon}</div>
            <h3 className="font-bold text-gray-800 text-base mb-1">{f.title}</h3>
            <p className="text-sm text-gray-400">{f.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
