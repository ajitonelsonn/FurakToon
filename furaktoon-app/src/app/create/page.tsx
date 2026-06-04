"use client";

import { useState } from "react";
import Image from "next/image";
import { IMAGE_MODELS } from "@/lib/models";

type Style = "anime" | "cartoon";

export default function CreatePage() {
  const [prompt, setPrompt] = useState("");
  const [style, setStyle] = useState<Style>("anime");
  const [selectedModel, setSelectedModel] = useState<string>(IMAGE_MODELS[0].id);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [enhancing, setEnhancing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleEnhance() {
    if (!prompt.trim()) return;
    setEnhancing(true);
    setError(null);
    try {
      const res = await fetch("/api/enhance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, style }),
      });
      const data = await res.json();
      if (data.enhanced) {
        const originalLength = prompt.length;
        setPrompt(data.enhanced);
        if (typeof pendo !== "undefined") {
          pendo.track("prompt_enhanced", {
            style,
            originalPromptLength: originalLength,
            enhancedPromptLength: data.enhanced.length,
          });
        }
      } else {
        setError(data.error ?? "Enhancement failed");
      }
    } catch {
      setError("Enhancement failed. Please try again.");
    } finally {
      setEnhancing(false);
    }
  }

  async function handleGenerate() {
    if (!prompt.trim()) return;
    setLoading(true);
    setError(null);
    setImageUrl(null);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, style, modelId: selectedModel }),
      });
      const data = await res.json();
      if (data.imageUrl) {
        setImageUrl(data.imageUrl);
        if (typeof pendo !== "undefined") {
          const modelName = IMAGE_MODELS.find((m) => m.id === selectedModel)?.name ?? selectedModel;
          pendo.track("image_generated", {
            style,
            modelId: selectedModel,
            modelName,
            promptLength: prompt.length,
          });
        }
      } else {
        setError(data.error ?? "Generation failed");
        if (typeof pendo !== "undefined") {
          pendo.track("image_generation_failed", {
            style,
            modelId: selectedModel,
            errorMessage: (data.error ?? "Generation failed").substring(0, 100),
            promptLength: prompt.length,
          });
        }
      }
    } catch {
      setError("Generation failed. Please try again.");
      if (typeof pendo !== "undefined") {
        pendo.track("image_generation_failed", {
          style,
          modelId: selectedModel,
          errorMessage: "Network error",
          promptLength: prompt.length,
        });
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-800">Create Your Toon</h1>
        <p className="text-gray-400 text-sm mt-1">Describe your idea and watch it come to life</p>
      </div>

      {/* Style Toggle */}
      <div className="flex items-center justify-center gap-2">
        <span className="text-sm text-gray-500 font-medium">Style:</span>
        <div className="relative flex bg-gray-100 rounded-full p-1">
          {(["anime", "cartoon"] as Style[]).map((s) => {
            let activeClass = "text-gray-500 hover:text-gray-700";
            if (style === s) {
              activeClass = s === "anime"
                ? "bg-fuchsia-500 text-white shadow-md"
                : "bg-violet-500 text-white shadow-md";
            }
            return (
              <button
                key={s}
                onClick={() => setStyle(s)}
                className={`relative px-5 py-2 text-sm font-semibold rounded-full transition-all duration-200 capitalize ${activeClass}`}
              >
                {s === "anime" ? "✨ Anime" : "🎨 Cartoon"}
              </button>
            );
          })}
        </div>
      </div>

      {/* Prompt Input */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Your prompt</label>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe your character or scene… e.g. 'a fox warrior standing in a glowing forest'"
          rows={4}
          className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-gray-800 resize-none focus:outline-none focus:ring-2 focus:ring-fuchsia-400 transition text-sm"
        />
        <button
          onClick={handleEnhance}
          disabled={enhancing || !prompt.trim()}
          className="text-xs text-fuchsia-600 hover:text-fuchsia-800 font-medium disabled:opacity-40 flex items-center gap-1"
        >
          {enhancing ? (
            <>
              <span className="animate-spin">✦</span> Enhancing…
            </>
          ) : (
            "✦ Enhance my prompt with AI"
          )}
        </button>
      </div>

      {/* Model Picker */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Model</label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {IMAGE_MODELS.map((m) => (
            <button
              key={m.id}
              onClick={() => setSelectedModel(m.id)}
              className={`text-left rounded-2xl border-2 p-3 transition-all duration-150 ${
                selectedModel === m.id
                  ? "border-fuchsia-400 bg-fuchsia-50"
                  : "border-gray-100 bg-white hover:border-gray-200"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-sm text-gray-800">{m.name}</span>
                {"default" in m && m.default && (
                  <span className="text-xs bg-fuchsia-100 text-fuchsia-600 px-2 py-0.5 rounded-full font-medium">
                    Default
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-400 mt-0.5">{m.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Generate Button */}
      <button
        onClick={handleGenerate}
        disabled={loading || !prompt.trim()}
        className={`w-full py-4 rounded-2xl font-bold text-white text-lg transition-all duration-150 shadow-lg hover:shadow-xl active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${
          style === "anime"
            ? "bg-linear-to-r from-fuchsia-500 to-pink-500 hover:from-fuchsia-600 hover:to-pink-600"
            : "bg-linear-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600"
        }`}
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <LoadingDots />
            Generating your toon…
          </span>
        ) : (
          "✨ Generate"
        )}
      </button>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-2xl p-4 text-sm">
          {error}
        </div>
      )}

      {/* Result */}
      {imageUrl && (
        <div className="rounded-3xl overflow-hidden shadow-2xl border border-gray-100 bg-white">
          <Image
            src={imageUrl}
            alt="Generated toon"
            width={1024}
            height={1024}
            className="w-full h-auto"
            unoptimized
          />
          <div className="p-4 flex justify-between items-center">
            <p className="text-xs text-gray-400 truncate max-w-xs">{prompt}</p>
            <a
              href={imageUrl}
              download="furaktoon.png"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => {
                if (typeof pendo !== "undefined") {
                  pendo.track("image_downloaded", {
                    source: "create",
                    style,
                    modelId: selectedModel,
                  });
                }
              }}
              className="text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium px-4 py-2 rounded-xl transition"
            >
              ↓ Download
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

function LoadingDots() {
  return (
    <span className="flex gap-1 items-center">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="w-2 h-2 bg-white rounded-full animate-bounce"
          style={{ animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </span>
  );
}
