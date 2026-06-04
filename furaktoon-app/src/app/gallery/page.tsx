import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import type { Generation } from "@/lib/supabase/types";
import { IMAGE_MODELS } from "@/lib/models";

export default async function GalleryPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: generations } = await supabase
    .from("generations")
    .select("*")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false });

  const items = (generations ?? []) as Generation[];

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Your Gallery</h1>
        <p className="text-gray-400 text-sm mt-1">
          All {items.length} of your generated toons
        </p>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-5xl mb-4">🎨</p>
          <p className="text-lg font-medium">No toons yet!</p>
          <p className="text-sm mt-1">Head to Create to generate your first one.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {items.map((gen) => (
            <GalleryCard key={gen.id} gen={gen} />
          ))}
        </div>
      )}
    </div>
  );
}

function GalleryCard({ gen }: { gen: Generation }) {
  const modelName =
    IMAGE_MODELS.find((m) => m.id === gen.model)?.name ?? gen.model;

  const date = new Date(gen.created_at).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="bg-white rounded-3xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-200 group">
      <div className="relative aspect-square overflow-hidden">
        <Image
          src={gen.image_url}
          alt={gen.prompt}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          unoptimized
        />
        <div className="absolute top-2 right-2 flex gap-1">
          <span
            className={`text-xs font-semibold px-2 py-1 rounded-full shadow ${
              gen.style === "anime"
                ? "bg-fuchsia-500 text-white"
                : "bg-violet-500 text-white"
            }`}
          >
            {gen.style}
          </span>
        </div>
      </div>

      <div className="p-4 space-y-1">
        <p className="text-sm text-gray-700 font-medium line-clamp-2">{gen.prompt}</p>
        <div className="flex items-center justify-between text-xs text-gray-400 pt-1">
          <span>{modelName}</span>
          <span>{date}</span>
        </div>
        <a
          href={gen.image_url}
          download="furaktoon.png"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 block text-center text-xs bg-gray-100 hover:bg-gray-200 text-gray-600 font-medium py-2 rounded-xl transition"
        >
          ↓ Download
        </a>
      </div>
    </div>
  );
}
