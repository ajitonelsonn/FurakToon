"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { IMAGE_MODELS } from "@/lib/models";

type Style = "anime" | "cartoon";
type Phase =
  | "idle"
  | "safety"
  | "safety_failed"
  | "safety_done"
  | "enhance"
  | "enhance_done"
  | "painting"
  | "finalizing"
  | "done"
  | "error";

const STEPS: { phase: Phase; icon: string; label: string; sublabel: string }[] = [
  { phase: "safety",    icon: "🛡️", label: "Safety Check",     sublabel: "Scanning your prompt…"         },
  { phase: "enhance",   icon: "✦",  label: "Polishing Prompt", sublabel: "Adding style & detail…"        },
  { phase: "painting",  icon: "🎨", label: "Painting",         sublabel: "AI is drawing your toon…"      },
  { phase: "finalizing",icon: "✨", label: "Finalizing",       sublabel: "Saving to your gallery…"       },
];

const PHASE_ORDER: Phase[] = ["safety", "safety_done", "enhance", "enhance_done", "painting", "finalizing", "done"];

function stepIndex(phase: Phase) {
  if (phase === "safety" || phase === "safety_done") return 0;
  if (phase === "enhance" || phase === "enhance_done") return 1;
  if (phase === "painting") return 2;
  if (phase === "finalizing") return 3;
  return -1;
}

type StepState = {
  isFailed: boolean;
  isDone: boolean;
  isActive: boolean;
  isPending: boolean;
  wrapCls: string;
  iconCls: string;
  labelCls: string;
  icon: string;
};

function resolveStepState(i: number, phase: Phase, stepIcon: string): StepState {
  const current  = stepIndex(phase);
  const isFailed = i === 0 && phase === "safety_failed";
  const isDone   = !isFailed && (i < current || (i === current && (phase === "safety_done" || phase === "enhance_done")));
  const isActive = i === current && !isDone && !isFailed;
  const isPending = i > current && !isFailed;

  let wrapCls = "border-gray-100 bg-white opacity-40";
  if (isFailed)      wrapCls = "border-red-300 bg-red-50 scale-[1.02]";
  else if (isActive) wrapCls = "border-sky bg-sky/5 shadow-lg scale-[1.02]";
  else if (isDone)   wrapCls = "border-green-200 bg-green-50";

  let iconCls = "bg-gray-100 text-gray-300";
  if (isFailed)      iconCls = "bg-red-100 text-red-500";
  else if (isActive) iconCls = "bg-sky text-white shadow-md animate-pulse";
  else if (isDone)   iconCls = "bg-green-100 text-green-600";

  let labelCls = "text-gray-300";
  if (isFailed)      labelCls = "text-red-600";
  else if (isActive) labelCls = "text-navy";
  else if (isDone)   labelCls = "text-green-700";

  let icon = stepIcon;
  if (isFailed) icon = "✕";
  else if (isDone) icon = "✓";

  return { isFailed, isDone, isActive, isPending, wrapCls, iconCls, labelCls, icon };
}

/* Returns null on success, error string on failure */
async function runSafetyCheck(prompt: string): Promise<string | null> {
  try {
    const res = await fetch("/api/safety", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    });
    const data = await res.json() as { safe?: boolean; reason?: string; error?: string };
    if (data.error) return "Safety check failed. Please try again.";
    if (!data.safe) {
      return "That prompt isn't allowed. Please try a different idea!" +
        (data.reason ? ` (${data.reason})` : "");
    }
    return null;
  } catch {
    return "Safety check failed. Please try again.";
  }
}

/* Returns { imageUrl } on success, { error } on failure */
async function runImageGeneration(
  prompt: string, style: string, modelId: string
): Promise<{ imageUrl?: string; warning?: string; error?: string }> {
  try {
    const res = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt, style, modelId }),
    });
    return await res.json();
  } catch {
    return { error: "Generation failed. Please try again." };
  }
}

export default function CreatePage() {
  const [prompt, setPrompt]             = useState("");
  const [style, setStyle]               = useState<Style>("anime");
  const [selectedModel, setSelectedModel] = useState<string>(IMAGE_MODELS[0].id);
  const [imageUrl, setImageUrl]         = useState<string | null>(null);
  const [phase, setPhase]               = useState<Phase>("idle");
  const [error, setError]               = useState<string | null>(null);
  const [warning, setWarning]           = useState<string | null>(null);
  const [enhancing, setEnhancing]       = useState(false);
  const resultRef = useRef<HTMLDivElement>(null);

  const isGenerating = phase !== "idle" && phase !== "done" && phase !== "error";

  // Scroll to result when done
  useEffect(() => {
    if (phase === "done" && resultRef.current) {
      resultRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [phase]);

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
    setError(null);
    setWarning(null);
    setImageUrl(null);

    // Step 1: real safety check
    setPhase("safety");
    const safetyErr = await runSafetyCheck(prompt);
    if (safetyErr) {
      setError(safetyErr);
      setPhase("safety_failed");
      return;
    }

    // Step 2: visual enhancement step
    setPhase("safety_done");
    await delay(300);
    setPhase("enhance");
    await delay(800);
    setPhase("enhance_done");
    await delay(300);

    // Step 3: image generation
    setPhase("painting");
    const result = await runImageGeneration(prompt, style, selectedModel);
    if (result.imageUrl) {
      setPhase("finalizing");
      await delay(600);
      setImageUrl(result.imageUrl);
      if (result.warning) setWarning(result.warning);
      setPhase("done");
    } else {
      setError(result.error ?? "Generation failed");
      setPhase("error");
    }
  }

  function handleReset() {
    setPhase("idle");
    setImageUrl(null);
    setError(null);
    setWarning(null);
  }

  /* ── GENERATING VIEW (includes safety_failed) ── */
  if (isGenerating) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-16 min-h-[60vh] relative">

        {/* Safety blocked modal */}
        {phase === "safety_failed" && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-navy/40 backdrop-blur-sm" />

            {/* Modal card */}
            <div className="relative bg-white rounded-3xl shadow-2xl border border-red-100 p-8 max-w-sm w-full text-center animate-[fadeIn_0.2s_ease-out]">
              <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4">🚫</div>
              <h2 className="text-xl font-extrabold text-navy mb-2">Prompt Not Allowed</h2>
              <p className="text-sm text-gray-500 leading-relaxed mb-6">{error}</p>

              <div className="flex gap-3">
                <button
                  onClick={handleReset}
                  className="flex-1 py-3 rounded-2xl border-2 border-navy/20 text-navy font-bold text-sm hover:bg-navy/5 transition-all active:scale-95"
                >
                  ← Go back
                </button>
                <button
                  onClick={() => {
                    setPhase("idle");
                    setError(null);
                    setPrompt("");
                  }}
                  className="flex-1 py-3 rounded-2xl bg-sky text-white font-bold text-sm hover:bg-[#3a9fd6] shadow-md transition-all active:scale-95"
                >
                  Try new prompt
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="w-full max-w-sm space-y-10">

          {/* Title */}
          <div className="text-center">
            <p className="text-xs font-bold text-navy/40 uppercase tracking-widest mb-2">
              {phase === "safety_failed" ? "Safety check failed" : "Creating your toon"}
            </p>
            <p className="text-sm text-gray-400 truncate max-w-xs mx-auto">&ldquo;{prompt}&rdquo;</p>
          </div>

          {/* Step progress */}
          <div className="space-y-3">
            {STEPS.map((step, i) => {
              const s = resolveStepState(i, phase, step.icon);
              return (
                <div
                  key={step.phase}
                  className={`flex items-center gap-4 rounded-2xl px-5 py-4 border-2 transition-all duration-500 ${s.wrapCls}`}
                >
                  {/* Icon */}
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0 transition-all duration-300 ${s.iconCls}`}>
                    {s.icon}
                  </div>

                  {/* Text */}
                  <div className="flex-1 min-w-0">
                    <p className={`font-bold text-sm ${s.labelCls}`}>
                      {step.label}
                    </p>
                    {s.isFailed && (
                      <p className="text-xs text-red-400 mt-0.5 font-medium">Blocked — prompt not allowed</p>
                    )}
                    {s.isActive && (
                      <p className="text-xs text-sky mt-0.5 flex items-center gap-1">
                        <span className="inline-block w-1.5 h-1.5 bg-sky rounded-full animate-ping" />
                        {step.sublabel}
                      </p>
                    )}
                    {s.isDone && <p className="text-xs text-green-500 mt-0.5">Complete</p>}
                  </div>

                  {/* Active spinner */}
                  {s.isActive && (
                    <div className="shrink-0 w-5 h-5 border-2 border-sky border-t-transparent rounded-full animate-spin" />
                  )}
                  {s.isPending && (
                    <div className="shrink-0 w-2 h-2 rounded-full bg-gray-200" />
                  )}
                </div>
              );
            })}
          </div>

          {/* Painting animation */}
          {(phase === "painting" || phase === "finalizing") && (
            <div className="flex flex-col items-center gap-4">
              <div className="relative w-48 h-48 rounded-3xl overflow-hidden bg-navy/5 border-2 border-navy/10 flex items-center justify-center">
                {/* Animated paint strokes */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-7xl animate-bounce" style={{ animationDuration: "1.5s" }}>🎨</div>
                </div>
                {/* Shimmer overlay */}
                <div className="absolute inset-0 shimmer opacity-30 rounded-3xl" />
              </div>
              <div className="flex gap-1.5">
                {[0, 1, 2, 3, 4].map((i) => (
                  <span
                    key={i}
                    className="w-2 h-2 rounded-full bg-sky bounce-dot"
                    style={{ animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  /* ── RESULT VIEW ── */
  if (phase === "done" && imageUrl) {
    return (
      <div className="flex-1 px-4 sm:px-6 py-10 max-w-xl mx-auto w-full" ref={resultRef}>
        <div className="space-y-5">
          {/* Header */}
          <div className="text-center">
            <p className="text-2xl font-extrabold text-navy">Your toon is ready! ✨</p>
            <p className="text-sm text-gray-400 mt-1 line-clamp-1">&ldquo;{prompt}&rdquo;</p>
          </div>

          {/* Completed steps summary */}
          <div className="grid grid-cols-4 gap-2">
            {STEPS.map((step) => (
              <div key={step.phase} className="flex flex-col items-center gap-1 bg-green-50 border border-green-100 rounded-2xl py-3 px-1">
                <span className="text-green-500 font-bold text-sm">✓</span>
                <span className="text-xs text-green-600 font-semibold text-center leading-tight">{step.label}</span>
              </div>
            ))}
          </div>

          {/* Image */}
          <div className="rounded-3xl overflow-hidden shadow-2xl border-2 border-navy/10 bg-white">
            <Image
              src={imageUrl}
              alt="Generated toon"
              width={1024}
              height={1024}
              className="w-full h-auto"
              unoptimized
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={handleReset}
              className="flex-1 py-3.5 rounded-2xl border-2 border-navy/20 text-navy font-bold hover:bg-navy/5 transition-all active:scale-95"
            >
              ← Create another
            </button>
            <a
              href={imageUrl}
              download="furaktoon.png"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 py-3.5 rounded-2xl bg-navy hover:bg-[#2a3f8f] text-white font-bold text-center shadow-lg hover:shadow-xl transition-all active:scale-95"
            >
              ↓ Download
            </a>
          </div>

          {warning && (
            <div className="bg-orange/10 border border-orange/30 text-orange rounded-2xl p-3 text-xs font-medium">
              ⚠️ {warning}
            </div>
          )}
        </div>
      </div>
    );
  }

  /* ── ERROR VIEW ── */
  if (phase === "error") {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-16 text-center">
        <div className="text-5xl mb-4">😬</div>
        <p className="text-xl font-extrabold text-navy mb-2">Something went wrong</p>
        <p className="text-sm text-red-500 mb-6 max-w-sm">{error}</p>
        <button
          onClick={handleReset}
          className="bg-navy hover:bg-[#2a3f8f] text-white font-bold px-7 py-3.5 rounded-2xl shadow-lg active:scale-95 transition-all"
        >
          ← Try again
        </button>
      </div>
    );
  }

  /* ── IDLE / FORM VIEW ── */
  return (
    <div className="flex-1 px-4 sm:px-6 py-10 max-w-2xl mx-auto w-full">

      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-extrabold text-navy">Create Your Toon</h1>
        <p className="text-gray-400 text-sm mt-1.5">Describe your idea and watch it come to life</p>
      </div>

      <div className="space-y-5">

        {/* Style Toggle */}
        <div className="bg-white rounded-3xl shadow-md border border-gray-100 p-5">
          <p className="text-xs font-bold text-navy/50 uppercase tracking-widest mb-3">Style</p>
          <div className="grid grid-cols-2 gap-3">
            {(["anime", "cartoon"] as Style[]).map((s) => {
              const active = style === s;
              let cls = "border-gray-100 bg-gray-50 text-gray-400 hover:border-gray-200";
              if (active) {
                cls = s === "anime"
                  ? "border-sky bg-sky/10 text-navy shadow-md"
                  : "border-orange bg-orange/10 text-navy shadow-md";
              }
              return (
                <button
                  key={s}
                  onClick={() => setStyle(s)}
                  className={`flex items-center justify-center gap-2 py-3.5 rounded-2xl border-2 font-bold text-sm transition-all duration-150 ${cls}`}
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
            <span className={enhancing ? "animate-spin inline-block" : ""}>✦</span>
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

        {/* Process preview */}
        <div className="bg-navy/3 border border-navy/8 rounded-3xl p-4">
          <p className="text-xs font-bold text-navy/40 uppercase tracking-widest mb-3 text-center">What happens when you click Generate</p>
          <div className="flex items-center justify-between gap-1">
            {STEPS.map((step, i) => (
              <div key={step.phase} className="flex items-center gap-1 flex-1">
                <div className="flex flex-col items-center gap-1 flex-1">
                  <span className="text-lg">{step.icon}</span>
                  <span className="text-xs text-navy/50 font-semibold text-center leading-tight">{step.label}</span>
                </div>
                {i < STEPS.length - 1 && (
                  <span className="text-gray-200 text-sm shrink-0">→</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Generate Button */}
        <button
          onClick={handleGenerate}
          disabled={!prompt.trim()}
          className={`w-full py-4 rounded-2xl font-extrabold text-white text-lg shadow-xl hover:shadow-2xl active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-150 ${
            style === "anime"
              ? "bg-sky hover:bg-[#3a9fd6] glow-sky"
              : "bg-orange hover:bg-[#d97316] glow-orange"
          }`}
        >
          ✨ Generate Toon
        </button>
      </div>
    </div>
  );
}

function delay(ms: number) {
  return new Promise<void>((r) => setTimeout(r, ms));
}
