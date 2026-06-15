"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { IMAGE_MODELS } from "@/lib/models";
import { useT } from "@/lib/i18n/context";
import { useCredits } from "@/lib/credits/context";
import { creditCost, nextResetDate } from "@/lib/credits";
import type { TranslationKey } from "@/lib/i18n/translations";

type Style = "anime" | "cartoon";

// Translate function type, matching the i18n t() signature.
type T = (key: TranslationKey, params?: Record<string, string | number>) => string;
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

const STEPS: { phase: Phase; icon: string; labelKey: TranslationKey; sublabelKey: TranslationKey }[] = [
  { phase: "safety",    icon: "🛡️", labelKey: "create.stepSafety",     sublabelKey: "create.stepSafetySub"     },
  { phase: "enhance",   icon: "✦",  labelKey: "create.stepEnhance",    sublabelKey: "create.stepEnhanceSub"    },
  { phase: "painting",  icon: "🎨", labelKey: "create.stepPainting",   sublabelKey: "create.stepPaintingSub"   },
  { phase: "finalizing",icon: "✨", labelKey: "create.stepFinalizing", sublabelKey: "create.stepFinalizingSub" },
];

function stepIndex(phase: Phase) {
  if (phase === "safety" || phase === "safety_done") return 0;
  if (phase === "enhance" || phase === "enhance_done") return 1;
  if (phase === "painting") return 2;
  if (phase === "finalizing") return 3;
  return -1;
}

type StepState = {
  isFailed: boolean; isDone: boolean; isActive: boolean; isPending: boolean;
  wrapCls: string; iconCls: string; labelCls: string; icon: string;
};

const WRAP_CLS = {
  failed:  "border-red-300 bg-red-50/80 scale-[1.02] shadow-lg",
  active:  "border-sky/50 bg-white/80 shadow-lift scale-[1.02]",
  done:    "border-emerald-200 bg-emerald-50/70",
  pending: "border-navy/8 bg-white/40 opacity-55",
};
const ICON_CLS = {
  failed:  "bg-red-100 text-red-500",
  active:  "btn-gradient text-white",
  done:    "bg-emerald-100 text-emerald-600",
  pending: "bg-navy/8 text-navy/30",
};
const LABEL_CLS = {
  failed:  "text-red-600",
  active:  "text-navy",
  done:    "text-emerald-700",
  pending: "text-navy/35",
};

// Overall progress (0–100) shown as a top bar in the generating view.
function progressPct(phase: Phase): number {
  switch (phase) {
    case "safety": return 12;
    case "safety_done": return 28;
    case "enhance": return 40;
    case "enhance_done": return 55;
    case "painting": return 78;
    case "finalizing": return 92;
    case "done": return 100;
    default: return 0;
  }
}

function resolveStepState(i: number, phase: Phase, stepIcon: string): StepState {
  const current  = stepIndex(phase);
  const isFailed = i === 0 && phase === "safety_failed";
  const isDone   = !isFailed && (i < current || (i === current && (phase === "safety_done" || phase === "enhance_done")));
  const isActive = i === current && !isDone && !isFailed;
  const isPending = i > current && !isFailed;

  const key = isFailed ? "failed" : isActive ? "active" : isDone ? "done" : "pending";
  const icon = isFailed ? "✕" : isDone ? "✓" : stepIcon;

  return {
    isFailed, isDone, isActive, isPending,
    wrapCls: WRAP_CLS[key], iconCls: ICON_CLS[key], labelCls: LABEL_CLS[key], icon,
  };
}

type Setters = {
  setPrompt: (v: string) => void;
  setEnhancing: (v: boolean) => void;
  setError: (v: string | null) => void;
  setPhase: (v: Phase) => void;
  setImageUrl: (v: string | null) => void;
  setWarning: (v: string | null) => void;
  setCredits: (v: number) => void;
  setOutOfCredits: (v: boolean) => void;
};

async function doEnhance(
  prompt: string, style: Style, hasReference: boolean, s: Setters, t: T,
) {
  s.setEnhancing(true);
  s.setError(null);
  try {
    const res = await fetch("/api/enhance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt, style, hasReference }),
    });
    const data = await res.json();
    if (data.enhanced) s.setPrompt(data.enhanced);
    else s.setError(data.error ?? t("create.errEnhanceFailed"));
  } catch {
    s.setError(t("create.errEnhanceRetry"));
  } finally {
    s.setEnhancing(false);
  }
}

async function doGenerate(
  prompt: string, style: Style, selectedModel: string,
  referenceFile: File | null, s: Setters, t: T,
) {
  s.setError(null);
  s.setWarning(null);
  s.setImageUrl(null);

  s.setPhase("safety");
  const safetyErr = await runSafetyCheck(prompt, t);
  if (safetyErr) { s.setError(safetyErr); s.setPhase("safety_failed"); return; }

  s.setPhase("safety_done");
  await delay(300);
  s.setPhase("enhance");
  await delay(800);
  s.setPhase("enhance_done");
  await delay(300);

  s.setPhase("painting");
  const result = await runImageGeneration(prompt, style, selectedModel, referenceFile, t);
  if (result.outOfCredits) {
    s.setOutOfCredits(true);
    s.setCredits(0);
    s.setPhase("idle");
    return;
  }
  if (result.imageUrl) {
    s.setPhase("finalizing");
    await delay(600);
    s.setImageUrl(result.imageUrl);
    if (result.warning) s.setWarning(result.warning);
    if (typeof result.creditsRemaining === "number") s.setCredits(result.creditsRemaining);
    s.setPhase("done");
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
    s.setError(result.error ?? t("create.errGenFailed"));
    s.setPhase("error");
    if (typeof pendo !== "undefined") {
      pendo.track("image_generation_failed", {
        style,
        modelId: selectedModel,
        errorMessage: (result.error ?? "Generation failed").substring(0, 100),
        promptLength: prompt.length,
      });
    }
  }
}

async function runSafetyCheck(prompt: string, t: T): Promise<string | null> {
  try {
    const res = await fetch("/api/safety", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    });
    const data = await res.json() as { safe?: boolean; reason?: string; error?: string };
    if (data.error) return t("create.errSafetyRetry");
    if (!data.safe) {
      return t("create.errPromptNotAllowed") +
        (data.reason ? ` (${data.reason})` : "");
    }
    return null;
  } catch {
    return t("create.errSafetyRetry");
  }
}

async function runImageGeneration(
  prompt: string,
  style: string,
  modelId: string,
  referenceFile: File | null,
  t: T,
): Promise<{ imageUrl?: string; warning?: string; error?: string; creditsRemaining?: number; outOfCredits?: boolean }> {
  try {
    const form = new FormData();
    form.append("prompt", prompt);
    form.append("style", style);
    form.append("modelId", modelId);
    if (referenceFile) form.append("referenceImage", referenceFile);
    const res = await fetch("/api/generate", { method: "POST", body: form });
    const data = await res.json();
    // 402 → not enough credits.
    if (res.status === 402 || data?.error === "out_of_credits") {
      return { outOfCredits: true };
    }
    return data;
  } catch {
    return { error: t("create.errGenRetry") };
  }
}

function processDroppedFile(
  file: File,
  onFile: (f: File) => void,
  onError: (msg: string) => void,
  t: T,
) {
  if (!file.type.startsWith("image/")) {
    onError(t("create.errBadImage"));
    return;
  }
  if (file.size > MAX_MB * 1024 * 1024) {
    onError(t("create.errImageTooBig", { max: MAX_MB }));
    return;
  }
  onFile(file);
}

const ACCEPTED = "image/jpeg,image/png,image/webp";
const MAX_MB = 5;

export default function CreatePage() {
  const t = useT();
  const { balance, setBalance } = useCredits();
  const [outOfCredits, setOutOfCredits]     = useState(false);
  const [prompt, setPrompt]                 = useState("");
  const [style, setStyle]                   = useState<Style>("anime");
  const [selectedModel, setSelectedModel]   = useState<string>(IMAGE_MODELS[0].id);
  const [referenceFile, setReferenceFile]   = useState<File | null>(null);
  const [referencePreview, setReferencePreview] = useState<string | null>(null);
  const [imageUrl, setImageUrl]             = useState<string | null>(null);
  const [phase, setPhase]                   = useState<Phase>("idle");
  const [error, setError]                   = useState<string | null>(null);
  const [warning, setWarning]               = useState<string | null>(null);
  const [enhancing, setEnhancing]           = useState(false);
  const [dragOver, setDragOver]             = useState(false);
  const [filePickerActive, setFilePickerActive] = useState(false);
  const fileInputRef  = useRef<HTMLInputElement>(null);
  const resultRef     = useRef<HTMLDivElement>(null);

  const isGenerating = phase !== "idle" && phase !== "done" && phase !== "error";

  useEffect(() => {
    if (phase === "done" && resultRef.current) {
      resultRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [phase]);

  function handleReferenceFile(file: File) {
    setFilePickerActive(false);
    processDroppedFile(
      file,
      (f) => {
        setReferenceFile(f);
        const reader = new FileReader();
        reader.onload = (e) => setReferencePreview(e.target?.result as string);
        reader.readAsDataURL(f);
        // Auto-switch to a model that supports reference images
        const refModel = IMAGE_MODELS.find((m) => m.supportsReferenceImage);
        if (refModel) setSelectedModel(refModel.id);
      },
      setError,
      t,
    );
  }

  function removeReference() {
    setReferenceFile(null);
    setReferencePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  const setters: Setters = {
    setPrompt, setEnhancing, setError, setPhase, setImageUrl, setWarning,
    setCredits: setBalance, setOutOfCredits,
  };

  // Cost mirrors the server: 2 credits when a reference image will actually be
  // used (model supports it + a file is attached), otherwise 1.
  const activeModel = IMAGE_MODELS.find((m) => m.id === selectedModel);
  const usesReference = !!(referenceFile && activeModel?.supportsReferenceImage);
  const cost = creditCost(usesReference);
  const cannotAfford = balance !== null && balance < cost;
  const resetDateLabel = nextResetDate().toLocaleDateString(undefined, {
    month: "short", day: "numeric",
  });

  const handleEnhance = () => {
    if (prompt.trim()) doEnhance(prompt, style, !!referenceFile, setters, t);
  };

  const handleGenerate = () => {
    setOutOfCredits(false);
    if (prompt.trim()) doGenerate(prompt, style, selectedModel, referenceFile, setters, t);
  };

  function handleReset() {
    setPhase("idle");
    setImageUrl(null);
    setError(null);
    setWarning(null);
    setPrompt("");
    setReferenceFile(null);
    setReferencePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    setSelectedModel(IMAGE_MODELS[0].id);
  }

  /* ── GENERATING VIEW ── */
  if (isGenerating) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-16 min-h-[60vh] relative">

        {/* Safety blocked modal */}
        {phase === "safety_failed" && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-navy/40 backdrop-blur-sm" />
            <div className="relative glass rounded-4xl shadow-2xl p-8 max-w-sm w-full text-center animate-fade-in">
              <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4">🚫</div>
              <h2 className="font-display text-xl font-extrabold text-navy mb-2">{t("create.promptNotAllowed")}</h2>
              <p className="text-sm text-navy/60 leading-relaxed mb-6">{error}</p>
              <div className="flex gap-3">
                <button onClick={handleReset} className="flex-1 py-3 rounded-2xl glass text-navy font-bold text-sm hover:bg-white/80 transition-all active:scale-95">
                  ← {t("common.goBack")}
                </button>
                <button onClick={() => { setPhase("idle"); setError(null); setPrompt(""); }} className="btn-gradient flex-1 py-3 rounded-2xl font-bold text-sm">
                  {t("create.tryNewPrompt")}
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="surface w-full max-w-md rounded-4xl p-6 sm:p-8 space-y-7 animate-rise">
          {/* Header + overall progress */}
          <div className="text-center space-y-3">
            <p className="text-xs font-bold text-navy/45 uppercase tracking-widest">
              {phase === "safety_failed" ? t("create.safetyFailedTitle") : t("create.creatingTitle")}
            </p>
            <p className="text-sm text-navy/60 truncate max-w-xs mx-auto">&ldquo;{prompt}&rdquo;</p>
            <div className="h-2 w-full overflow-hidden rounded-full bg-navy/8">
              <div
                className="aurora h-full rounded-full transition-[width] duration-700 ease-out"
                style={{ width: `${progressPct(phase)}%` }}
              />
            </div>
          </div>

          {/* Live painting preview */}
          {(phase === "painting" || phase === "finalizing") && (
            <div className="flex flex-col items-center gap-3">
              <div className="relative w-full aspect-square max-w-56 rounded-3xl overflow-hidden border-2 border-sky/20 flex items-center justify-center glow-grape">
                {referencePreview ? (
                  <Image src={referencePreview} alt="Reference" fill className="object-cover opacity-40" unoptimized />
                ) : (
                  <div className="absolute inset-0 aurora opacity-25" />
                )}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-7xl animate-bounce" style={{ animationDuration: "1.5s" }}>🎨</div>
                </div>
                <div className="absolute inset-0 shimmer opacity-30 rounded-3xl" />
              </div>
              <div className="flex gap-1.5">
                {[0, 1, 2, 3, 4].map((i) => (
                  <span key={i} className="w-2 h-2 rounded-full bg-grape bounce-dot" style={{ animationDelay: `${i * 0.15}s` }} />
                ))}
              </div>
            </div>
          )}

          {/* Step rows */}
          <div className="space-y-2.5">
            {STEPS.map((step, i) => {
              const s = resolveStepState(i, phase, step.icon);
              return (
                <div key={step.phase} className={`flex items-center gap-4 rounded-2xl px-4 py-3 border-2 transition-all duration-500 ${s.wrapCls}`}>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0 transition-all duration-300 ${s.iconCls}`}>
                    {s.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`font-bold text-sm ${s.labelCls}`}>{t(step.labelKey)}</p>
                    {s.isFailed && <p className="text-xs text-red-400 mt-0.5 font-medium">{t("create.stepBlocked")}</p>}
                    {s.isActive && (
                      <p className="text-xs text-sky mt-0.5 flex items-center gap-1">
                        <span className="inline-block w-1.5 h-1.5 bg-sky rounded-full animate-ping" />
                        {t(step.sublabelKey)}
                      </p>
                    )}
                    {s.isDone && <p className="text-xs text-emerald-500 mt-0.5">{t("create.stepComplete")}</p>}
                  </div>
                  {s.isActive && <div className="shrink-0 w-5 h-5 border-2 border-sky border-t-transparent rounded-full animate-spin" />}
                  {s.isPending && <div className="shrink-0 w-2 h-2 rounded-full bg-navy/15" />}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  /* ── RESULT VIEW ── */
  if (phase === "done" && imageUrl) {
    return (
      <div className="flex-1 px-4 sm:px-6 py-10 max-w-xl mx-auto w-full" ref={resultRef}>
        <div className="space-y-5 animate-rise">
          <div className="text-center">
            <p className="font-display text-3xl font-extrabold text-navy">{t("create.ready")}</p>
            <p className="text-sm text-navy/55 mt-1 line-clamp-1">&ldquo;{prompt}&rdquo;</p>
          </div>

          <div className="grid grid-cols-4 gap-2">
            {STEPS.map((step) => (
              <div key={step.phase} className="flex flex-col items-center gap-1 bg-emerald-50/80 border border-emerald-100 rounded-2xl py-3 px-1">
                <span className="text-emerald-500 font-bold text-sm">✓</span>
                <span className="text-xs text-emerald-600 font-semibold text-center leading-tight">{t(step.labelKey)}</span>
              </div>
            ))}
          </div>

          {/* Side-by-side if reference was used */}
          {referencePreview ? (
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <p className="text-xs font-bold text-navy/50 uppercase tracking-widest text-center">{t("create.yourReference")}</p>
                <div className="rounded-3xl overflow-hidden border-2 border-navy/10 aspect-square relative shadow-soft">
                  <Image src={referencePreview} alt="Reference" fill className="object-cover" unoptimized />
                </div>
              </div>
              <div className="space-y-1.5">
                <p className="text-xs font-bold text-navy/50 uppercase tracking-widest text-center">{t("create.generatedToon")}</p>
                <div className="rounded-3xl overflow-hidden border-2 border-sky/40 aspect-square relative shadow-lift glow-sky">
                  <Image src={imageUrl} alt="Generated toon" fill className="object-cover" unoptimized />
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-4xl overflow-hidden shadow-lift border-2 border-white/60 glow-grape">
              <Image src={imageUrl} alt="Generated toon" width={1024} height={1024} className="w-full h-auto" unoptimized />
            </div>
          )}

          <div className="flex gap-3">
            <button onClick={handleReset} className="flex-1 py-3.5 rounded-2xl glass text-navy font-bold hover:bg-white/80 transition-all active:scale-95">
              ← {t("create.createAnother")}
            </button>
            <a
              href={imageUrl}
              download="furaktoon.png"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => {
                if (typeof pendo !== "undefined") {
                  pendo.track("image_downloaded", { source: "create", style, modelId: selectedModel });
                }
              }}
              className="btn-gradient flex-1 py-3.5 rounded-2xl font-bold text-center">
              ↓ {t("create.download")}
            </a>
          </div>

          {warning && (
            <div className="bg-orange/10 border border-orange/30 text-orange rounded-2xl p-3 text-xs font-medium">⚠️ {warning}</div>
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
        <p className="font-display text-2xl font-extrabold text-navy mb-2">{t("create.somethingWrong")}</p>
        <p className="text-sm text-red-500 mb-6 max-w-sm">{error}</p>
        <button onClick={handleReset} className="btn-gradient font-bold px-7 py-3.5 rounded-2xl">
          ← {t("common.tryAgain")}
        </button>
      </div>
    );
  }

  /* ── IDLE / FORM VIEW ── */
  return (
    <div className="flex-1 px-4 sm:px-6 py-10 max-w-2xl mx-auto w-full">
      <div className="mb-8 text-center animate-rise">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-grape/10 text-grape px-3 py-1 text-xs font-bold mb-3">
          ✨ AI Studio
        </span>
        <h1 className="font-display text-4xl font-extrabold text-navy">{t("create.title")}</h1>
        <p className="text-navy/55 text-sm mt-1.5">{t("create.subtitle")}</p>
      </div>

      <div className="space-y-5">

        {/* Style Toggle */}
        <div className="surface rounded-3xl p-5">
          <p className="text-xs font-bold text-navy/50 uppercase tracking-widest mb-3">{t("create.styleLabel")}</p>
          <div className="grid grid-cols-2 gap-3">
            {(["anime", "cartoon"] as Style[]).map((s) => {
              const active = style === s;
              let cls = "border-navy/8 bg-white/40 text-navy/45 hover:border-navy/20 hover:text-navy/70";
              if (active) {
                cls = s === "anime"
                  ? "border-sky bg-sky/12 text-navy shadow-lift scale-[1.02]"
                  : "border-orange bg-orange/12 text-navy shadow-lift scale-[1.02]";
              }
              return (
                <button key={s} onClick={() => setStyle(s)}
                  className={`flex items-center justify-center gap-2 py-4 rounded-2xl border-2 font-bold text-base transition-all duration-200 ${cls}`}>
                  {s === "anime" ? `🎌 ${t("create.anime")}` : `🎨 ${t("create.cartoon")}`}
                  {active && <span className="w-2 h-2 rounded-full bg-current opacity-60" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Reference character upload */}
        <div className="surface rounded-3xl p-5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-xs font-bold text-navy/50 uppercase tracking-widest">{t("create.refLabel")}</p>
              <p className="text-xs text-gray-400 mt-0.5">{t("create.refDesc")}</p>
            </div>
            <span className="text-xs bg-navy/5 text-navy font-bold px-2.5 py-1 rounded-full shrink-0">{t("create.refMax")}</span>
          </div>

          {referencePreview ? (
            /* Preview of uploaded image */
            <div className="flex items-center gap-4">
              <div className="relative w-20 h-20 rounded-2xl overflow-hidden border-2 border-sky/30 shrink-0">
                <Image src={referencePreview} alt="Reference" fill className="object-cover" unoptimized />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-navy truncate">{referenceFile?.name}</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {referenceFile ? (referenceFile.size / 1024).toFixed(0) + " KB" : ""}
                </p>
                <p className="text-xs text-sky mt-1 font-medium">✓ {t("create.refReady")}</p>
              </div>
              <button
                onClick={removeReference}
                className="shrink-0 w-8 h-8 rounded-xl bg-red-50 hover:bg-red-100 text-red-400 hover:text-red-600 flex items-center justify-center text-sm font-bold transition-all"
                aria-label={t("create.refRemove")}
              >
                ✕
              </button>
            </div>
          ) : (
            /* Drop zone — label wraps the hidden input for native accessibility */
            <label
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOver(false);
                const file = e.dataTransfer.files[0];
                if (file) handleReferenceFile(file);
              }}
              onClick={() => { setFilePickerActive(true); setTimeout(() => setFilePickerActive(false), 3000); }}
              className={`flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-2xl py-7 px-4 cursor-pointer transition-all duration-150 ${
                dragOver
                  ? "border-sky bg-sky/5 scale-[1.01]"
                  : filePickerActive
                  ? "border-sky/50 bg-sky/5"
                  : "border-gray-200 hover:border-sky/50 hover:bg-gray-50"
              }`}
            >
              <span className="text-3xl">🧑‍🎨</span>
              <p className="text-sm font-semibold text-navy/60">{t("create.dropPhoto")}</p>
              <p className="text-xs text-gray-400">{t("create.dropHint", { max: MAX_MB })}</p>
              <input
                ref={fileInputRef}
                type="file"
                accept={ACCEPTED}
                className="sr-only"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleReferenceFile(file);
                }}
              />
            </label>
          )}
        </div>

        {/* Prompt */}
        <div className="surface rounded-3xl p-5">
          <p className="text-xs font-bold text-navy/50 uppercase tracking-widest mb-3">{t("create.promptLabel")}</p>
          <textarea
            id="prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={t("create.promptPlaceholder")}
            rows={4}
            className="w-full border-2 border-navy/10 hover:border-sky/40 focus:border-sky rounded-2xl px-4 py-3 text-ink text-sm resize-none focus:outline-none transition-colors bg-white/70"
          />
          <button
            onClick={handleEnhance}
            disabled={enhancing || !prompt.trim()}
            className="mt-2 flex items-center gap-1.5 text-xs text-sky hover:text-navy font-bold disabled:opacity-30 transition-colors"
          >
            <span className={enhancing ? "animate-spin inline-block" : ""}>✦</span>
            {enhancing ? t("create.enhancing") : t("create.enhanceCta")}
          </button>
        </div>

        {/* Model Picker */}
        <div className="surface rounded-3xl p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-bold text-navy/50 uppercase tracking-widest">{t("create.modelLabel")}</p>
            {referenceFile && (
              <p className="text-xs text-orange font-semibold">📸 {t("create.refMode")}</p>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {IMAGE_MODELS.map((m) => {
              const active = selectedModel === m.id;
              const locked = !!referenceFile && !m.supportsReferenceImage;
              let cardCls = "border-navy/8 hover:border-navy/25 bg-white/50 hover:-translate-y-0.5";
              if (active) cardCls = "border-grape/50 bg-grape/5 shadow-lift -translate-y-0.5";
              if (locked) cardCls = "border-navy/8 bg-white/40 opacity-40 cursor-not-allowed";
              return (
                <button
                  key={m.id}
                  onClick={() => { if (!locked) setSelectedModel(m.id); }}
                  disabled={locked}
                  className={`text-left rounded-2xl border-2 p-4 transition-all duration-200 ${cardCls}`}
                >
                  <div className="flex items-center justify-between mb-1 gap-1 flex-wrap">
                    <span className={`font-bold text-sm ${active && !locked ? "text-navy" : "text-navy/70"}`}>{m.name}</span>
                    <div className="flex items-center gap-1">
                      {m.supportsReferenceImage && (
                        <span className="text-xs bg-orange/15 text-orange font-bold px-2 py-0.5 rounded-full">📸 Ref</span>
                      )}
                      {"default" in m && m.default && !referenceFile && (
                        <span className="text-xs bg-sky/20 text-sky-600 font-bold px-2 py-0.5 rounded-full">{t("create.default")}</span>
                      )}
                      {locked && (
                        <span className="text-xs bg-navy/8 text-navy/40 font-bold px-2 py-0.5 rounded-full">🔒 {t("create.locked")}</span>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-navy/50">{m.description}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Process preview */}
        <div className="rounded-3xl border border-navy/8 bg-white/40 p-4">
          <p className="text-xs font-bold text-navy/40 uppercase tracking-widest mb-3 text-center">{t("create.processTitle")}</p>
          <div className="flex items-center justify-between gap-1">
            {STEPS.map((step, i) => (
              <div key={step.phase} className="flex items-center gap-1 flex-1">
                <div className="flex flex-col items-center gap-1.5 flex-1">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-navy/5 text-lg">{step.icon}</span>
                  <span className="text-xs text-navy/55 font-semibold text-center leading-tight">{t(step.labelKey)}</span>
                </div>
                {i < STEPS.length - 1 && <span className="text-navy/20 text-sm shrink-0">→</span>}
              </div>
            ))}
          </div>
        </div>

        {/* Out-of-credits banner */}
        {(outOfCredits || cannotAfford) && (
          <div className="surface rounded-3xl p-5 text-center animate-fade-in border border-orange/30">
            <p className="font-display font-bold text-navy">⚡ {t("credits.outTitle")}</p>
            <p className="text-sm text-navy/60 mt-1">{t("credits.outMessage")}</p>
            <p className="text-xs text-navy/45 mt-2">{t("credits.resetsOn", { date: resetDateLabel })}</p>
          </div>
        )}

        {/* Generate Button */}
        <button
          onClick={handleGenerate}
          disabled={!prompt.trim() || cannotAfford}
          className={`group w-full py-4 rounded-2xl font-display font-extrabold text-white text-lg active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 ${
            style === "anime"
              ? "bg-linear-to-r from-sky to-grape glow-sky hover:brightness-105"
              : "bg-linear-to-r from-orange to-pink glow-orange hover:brightness-105"
          }`}
        >
          <span className="inline-block transition-transform group-hover:scale-110">✨</span>{" "}
          {t("create.generateButton")}
        </button>

        {/* Cost + balance hint */}
        <p className="text-center text-xs text-navy/50">
          {usesReference ? t("credits.costReference") : t("credits.cost")}
          {balance !== null && (
            <> · <span className="font-semibold">{t("credits.balance", { count: balance })}</span></>
          )}
        </p>
      </div>
    </div>
  );
}

function delay(ms: number) {
  return new Promise<void>((r) => setTimeout(r, ms));
}
