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
  const [warning, setWarning] = useState<string | null>(null);

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
      if (data.enhanced) setPrompt(data.enhanced);
      else setError(data.error ?? "Enhancement failed");
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
    setWarning(null);
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
        if (data.warning) setWarning(data.warning);
      } else {
        setError(data.error ?? "Generation failed");
      }
    } catch {
      setError("Generation failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex-1 px-4 sm:px-6 py-10 max-w-2xl mx-auto w-full">

      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-extrabold text-navy">Create Your Toon</h1>
        <p className="text-gray-400 text-sm mt-1.5">Describe your idea and watch it come to life ✨</p>
      </div>

      <div className="space-y-5">
        {/* Style Toggle */}
        <div className="bg-white rounded-3xl shadow-md border border-gray-100 p-5">
          <p className="text-xs font-bold text-navy/50 uppercase tracking-widest mb-3">Style</p>
          <div className="grid grid-cols-2 gap-3">
            {(["anime", "cartoon"] as Style[]).map((s) => {
              const active = style === s;
              let activeClass = "border-gray-100 bg-gray-50 text-gray-400 hover:border-gray-200";
              if (active) {
                activeClass = s === "anime"
                  ? "border-sky bg-sky/10 text-navy shadow-md"
                  : "border-orange bg-orange/10 text-navy shadow-md";
              }
              return (
                <button
                  key={s}
                  onClick={() => setStyle(s)}
                  className={`flex items-center justify-center gap-2 py-3 rounded-2xl border-2 font-bold text-sm transition-all duration-150 ${activeClass}`}
                >
                  {s === "anime" ? "🎌 Anime" : "🎨 Cartoon"}
                  {active && <span className="w-2 h-2 rounded-full bg-current opacity-60" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Prompt */}
        <div className="bg-white rounded-3xl shadow-md border border-gray-100 p-5">
          <p className="text-xs font-bold text-navy/50 uppercase tracking-widest mb-3">Your Prompt</p>
          <textarea
            id="prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g. 'a fox warrior standing in a glowing enchanted forest at night'"
            rows={4}
            className="w-full border-2 border-gray-100 hover:border-sky/30 focus:border-sky rounded-2xl px-4 py-3 text-ink text-sm resize-none focus:outline-none transition-colors bg-cream/50"
          />
          <button
            onClick={handleEnhance}
            disabled={enhancing || !prompt.trim()}
            className="mt-2 flex items-center gap-1.5 text-xs text-sky hover:text-navy font-bold disabled:opacity-30 transition-colors"
          >
            <span className={enhancing ? "animate-spin" : ""}>✦</span>
            {enhancing ? "Enhancing with AI…" : "Enhance my prompt with AI"}
          </button>
        </div>

        {/* Model Picker */}
        <div className="bg-white rounded-3xl shadow-md border border-gray-100 p-5">
          <p className="text-xs font-bold text-navy/50 uppercase tracking-widest mb-3">AI Model</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {IMAGE_MODELS.map((m) => {
              const active = selectedModel === m.id;
              return (
                <button
                  key={m.id}
                  onClick={() => setSelectedModel(m.id)}
                  className={`text-left rounded-2xl border-2 p-4 transition-all duration-150 ${
                    active ? "border-navy bg-navy/5 shadow-md" : "border-gray-100 hover:border-navy/20 bg-gray-50"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className={`font-bold text-sm ${active ? "text-navy" : "text-gray-600"}`}>{m.name}</span>
                    {"default" in m && m.default && (
                      <span className="text-xs bg-sky/20 text-sky font-bold px-2 py-0.5 rounded-full">Default</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400">{m.description}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Generate Button */}
        <button
          onClick={handleGenerate}
          disabled={loading || !prompt.trim()}
          className={`w-full py-4 rounded-2xl font-extrabold text-white text-lg shadow-xl hover:shadow-2xl active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-150 ${
            style === "anime"
              ? "bg-sky hover:bg-[#3a9fd6] glow-sky"
              : "bg-orange hover:bg-[#d97316] glow-orange"
          }`}
        >
          {loading ? <LoadingDots /> : "✨ Generate Toon"}
        </button>

        {/* Warning */}
        {warning && (
          <div className="bg-orange/10 border border-orange/30 text-orange rounded-2xl p-4 text-sm font-medium">
            ⚠️ {warning}
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 rounded-2xl p-4 text-sm font-medium">
            {error}
          </div>
        )}

        {/* Result */}
        {imageUrl && (
          <div className="rounded-3xl overflow-hidden shadow-2xl border border-navy/10 bg-white">
            <Image src={imageUrl} alt="Generated toon" width={1024} height={1024} className="w-full h-auto" unoptimized />
            <div className="p-4 flex items-center justify-between gap-3">
              <p className="text-xs text-gray-400 truncate">{prompt}</p>
              <a
                href={imageUrl}
                download="furaktoon.png"
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 text-sm bg-navy hover:bg-[#2a3f8f] text-white font-bold px-5 py-2.5 rounded-xl shadow transition-all active:scale-95"
              >
                ↓ Download
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function LoadingDots() {
  return (
    <span className="flex items-center justify-center gap-1.5">
      <span className="text-sm mr-1">Generating your toon</span>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="w-2 h-2 bg-white rounded-full bounce-dot"
          style={{ animationDelay: `${i * 0.2}s` }}
        />
      ))}
    </span>
  );
}
