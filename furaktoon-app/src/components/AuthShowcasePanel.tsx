import Image from "next/image";

// Decorative artwork panel shown beside auth forms on large screens.
// `image` lets login and register show different sample art.
export default function AuthShowcasePanel({
  image,
  headline,
  sub,
}: Readonly<{ image: string; headline: string; sub: string }>) {
  return (
    <div className="relative hidden lg:block overflow-hidden rounded-4xl shadow-lift min-h-140">
      <Image
        src={image}
        alt=""
        fill
        sizes="50vw"
        className="object-cover"
        priority
      />
      <div className="absolute inset-0 bg-linear-to-t from-navy/90 via-navy/30 to-navy/10" />

      <div className="absolute inset-x-0 bottom-0 p-8">
        <h3 className="font-display text-2xl font-extrabold text-white leading-snug">
          {headline}
        </h3>
        <p className="mt-2 text-sm text-white/75 max-w-sm">{sub}</p>
        <div className="mt-4 flex gap-2">
          <span className="rounded-full bg-sky/90 px-3 py-1 text-xs font-bold text-white">🎌 Anime</span>
          <span className="rounded-full bg-orange/90 px-3 py-1 text-xs font-bold text-white">🎨 Cartoon</span>
        </div>
      </div>
    </div>
  );
}
