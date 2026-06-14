import Image from "next/image";

// All sample artwork shipped in /public/bg, shown as a looping showcase strip.
export const SHOWCASE_IMAGES = [
  { src: "/bg/anime1.jpeg", alt: "Anime character showcase", tag: "Anime" },
  { src: "/bg/cartoon1.jpeg", alt: "Cartoon character showcase", tag: "Cartoon" },
  { src: "/bg/anime2.jpeg", alt: "Anime portrait showcase", tag: "Anime" },
  { src: "/bg/cartoon2.jpeg", alt: "Cartoon scene showcase", tag: "Cartoon" },
] as const;

/**
 * Infinite horizontal marquee of the showcase artwork. The image list is
 * duplicated so the CSS translateX(-50%) loop is seamless. Pauses on hover.
 */
export default function ShowcaseMarquee() {
  const items = [...SHOWCASE_IMAGES, ...SHOWCASE_IMAGES];

  return (
    <div className="marquee-pause relative w-full overflow-hidden py-2">
      {/* edge fade masks */}
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 sm:w-28 bg-linear-to-r from-cream to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 sm:w-28 bg-linear-to-l from-cream to-transparent" />

      <div className="flex w-max gap-4 animate-marquee">
        {items.map((img, i) => (
          <div
            key={`${img.src}-${i}`}
            className="group relative h-40 w-64 sm:h-48 sm:w-80 shrink-0 overflow-hidden rounded-3xl border border-white/60 shadow-lift"
          >
            <Image
              src={img.src}
              alt={img.alt}
              fill
              sizes="320px"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-linear-to-t from-navy/40 via-transparent to-transparent" />
            <span
              className={`absolute bottom-3 left-3 rounded-full px-3 py-1 text-xs font-bold text-white shadow-md ${
                img.tag === "Anime" ? "bg-sky/90" : "bg-orange/90"
              }`}
            >
              {img.tag === "Anime" ? "🎌 " : "🎨 "}
              {img.tag}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
