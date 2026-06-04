"use client";

export default function DownloadButton({
  imageUrl,
  style,
  model,
}: {
  imageUrl: string;
  style: string;
  model: string;
}) {
  function handleDownloadClick() {
    if (typeof window !== "undefined" && typeof pendo !== "undefined") {
      pendo.track("image_downloaded", {
        source: "gallery",
        style,
        modelId: model,
      });
    }
  }

  return (
    <a
      href={imageUrl}
      download="furaktoon.png"
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleDownloadClick}
      className="mt-2 block text-center text-xs bg-gray-100 hover:bg-gray-200 text-gray-600 font-medium py-2 rounded-xl transition"
    >
      ↓ Download
    </a>
  );
}
