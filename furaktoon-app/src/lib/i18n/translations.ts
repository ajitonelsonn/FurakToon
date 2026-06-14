// Lightweight i18n for FurakToon — Southeast Asia focus (21 languages).
//
// Each locale maps a flat string key to its translation. Keys missing from a
// locale fall back to English (see context.tsx). Add new UI strings here.
//
// Note: non-priority locales (Balinese, Sundanese, Javanese, Khmer, Lao,
// Burmese, Cebuano, Tok Pisin) are machine-quality and should be reviewed by
// native speakers before a production launch.

export type Locale =
  | "tet" // Tetum
  | "en" // English
  | "pt_pt" // Portuguese (Portugal)
  | "id" // Indonesian
  | "ms" // Malay
  | "tl" // Tagalog
  | "th" // Thai
  | "vi" // Vietnamese
  | "my" // Burmese
  | "km" // Khmer
  | "lo" // Lao
  | "jv" // Javanese
  | "su" // Sundanese
  | "ceb" // Cebuano
  | "ban" // Balinese
  | "tpi" // Tok Pisin
  | "hi" // Hindi
  | "zh" // Chinese (Simplified)
  | "ja" // Japanese
  | "ko" // Korean
  | "ar"; // Arabic

export const LOCALES: { code: Locale; name: string; nativeName: string }[] = [
  { code: "tet", name: "Tetum", nativeName: "Tetun" },
  { code: "en", name: "English", nativeName: "English" },
  { code: "pt_pt", name: "Portuguese", nativeName: "Português" },
  { code: "id", name: "Indonesian", nativeName: "Bahasa Indonesia" },
  { code: "ms", name: "Malay", nativeName: "Bahasa Melayu" },
  { code: "tl", name: "Tagalog", nativeName: "Tagalog" },
  { code: "th", name: "Thai", nativeName: "ไทย" },
  { code: "vi", name: "Vietnamese", nativeName: "Tiếng Việt" },
  { code: "my", name: "Burmese", nativeName: "မြန်မာ" },
  { code: "km", name: "Khmer", nativeName: "ខ្មែរ" },
  { code: "lo", name: "Lao", nativeName: "ລາວ" },
  { code: "jv", name: "Javanese", nativeName: "Basa Jawa" },
  { code: "su", name: "Sundanese", nativeName: "Basa Sunda" },
  { code: "ceb", name: "Cebuano", nativeName: "Cebuano" },
  { code: "ban", name: "Balinese", nativeName: "Basa Bali" },
  { code: "tpi", name: "Tok Pisin", nativeName: "Tok Pisin" },
  { code: "hi", name: "Hindi", nativeName: "हिन्दी" },
  { code: "zh", name: "Chinese", nativeName: "中文" },
  { code: "ja", name: "Japanese", nativeName: "日本語" },
  { code: "ko", name: "Korean", nativeName: "한국어" },
  { code: "ar", name: "Arabic", nativeName: "العربية" },
];

// RTL locales (used to set dir="rtl" on <html>).
export const RTL_LOCALES: Locale[] = ["ar"];

export type TranslationKey =
  // nav
  | "nav.create"
  | "nav.gallery"
  | "nav.getStarted"
  | "nav.signIn"
  | "nav.signOut"
  // common
  | "common.loading"
  | "common.tryAgain"
  | "common.goBack"
  // language switcher
  | "language.label"
  // home — logged in
  | "home.welcomeBack"
  | "home.welcomePrompt"
  | "home.createNew"
  | "home.generate"
  | "home.generateDesc"
  | "home.myGallery"
  | "home.myGalleryDesc"
  | "home.recent"
  | "home.viewAll"
  | "home.noCreations"
  | "home.noCreationsHint"
  | "home.makeFirst"
  // home — marketing
  | "marketing.beautiful"
  | "marketing.cartoons"
  | "marketing.madeByYou"
  | "marketing.subtitle"
  | "marketing.furakMeans"
  | "marketing.startFree"
  | "marketing.signIn"
  | "marketing.featAnimeTitle"
  | "marketing.featAnimeDesc"
  | "marketing.featFastTitle"
  | "marketing.featFastDesc"
  | "marketing.featSafeTitle"
  | "marketing.featSafeDesc"
  | "marketing.ctaTitle"
  | "marketing.ctaSubtitle"
  | "marketing.ctaButton"
  // create — steps
  | "create.stepSafety"
  | "create.stepSafetySub"
  | "create.stepEnhance"
  | "create.stepEnhanceSub"
  | "create.stepPainting"
  | "create.stepPaintingSub"
  | "create.stepFinalizing"
  | "create.stepFinalizingSub"
  | "create.stepBlocked"
  | "create.stepActive"
  | "create.stepComplete"
  // create — progress view
  | "create.creatingTitle"
  | "create.safetyFailedTitle"
  // create — safety modal
  | "create.promptNotAllowed"
  | "create.tryNewPrompt"
  // create — result view
  | "create.ready"
  | "create.yourReference"
  | "create.generatedToon"
  | "create.createAnother"
  | "create.download"
  // create — error
  | "create.somethingWrong"
  // create — form
  | "create.title"
  | "create.subtitle"
  | "create.styleLabel"
  | "create.anime"
  | "create.cartoon"
  | "create.refLabel"
  | "create.refDesc"
  | "create.refMax"
  | "create.refReady"
  | "create.refRemove"
  | "create.dropPhoto"
  | "create.dropHint"
  | "create.promptLabel"
  | "create.promptPlaceholder"
  | "create.enhancing"
  | "create.enhanceCta"
  | "create.modelLabel"
  | "create.refMode"
  | "create.default"
  | "create.locked"
  | "create.processTitle"
  | "create.generateButton"
  // create — errors (runtime)
  | "create.errEnhanceFailed"
  | "create.errEnhanceRetry"
  | "create.errSafetyRetry"
  | "create.errPromptNotAllowed"
  | "create.errGenFailed"
  | "create.errGenRetry"
  | "create.errBadImage"
  | "create.errImageTooBig"
  // gallery
  | "gallery.title"
  | "gallery.noToons"
  | "gallery.countCreated"
  | "gallery.createNew"
  | "gallery.emptyTitle"
  | "gallery.emptyHint"
  | "gallery.makeFirst"
  // auth — shared
  | "auth.tagline"
  | "auth.emailLabel"
  | "auth.emailPlaceholder"
  | "auth.passwordLabel"
  // auth — login
  | "auth.loginTitle"
  | "auth.loginSubtitle"
  | "auth.loginPasswordPlaceholder"
  | "auth.signingIn"
  | "auth.signInCta"
  | "auth.noAccount"
  | "auth.createOne"
  // auth — register
  | "auth.registerTitle"
  | "auth.registerSubtitle"
  | "auth.registerPasswordPlaceholder"
  | "auth.creatingAccount"
  | "auth.getStartedCta"
  | "auth.haveAccount"
  | "auth.signInLink";

export const DEFAULT_LOCALE: Locale = "en";

export type Dict = Partial<Record<TranslationKey, string>>;

// Non-English dictionaries live in ./locales to keep this file readable. They
// are partial — any missing key falls back to English at lookup time. The
// import is type-only-safe: locale files import only types from here, so there
// is no runtime circular dependency.
import { localeDicts } from "./locales";

// English is the source of truth and the fallback for all other locales.
const en: Record<TranslationKey, string> = {
  "nav.create": "Create",
  "nav.gallery": "Gallery",
  "nav.getStarted": "Get started",
  "nav.signIn": "Sign in",
  "nav.signOut": "Sign out",

  "common.loading": "Loading...",
  "common.tryAgain": "Try again",
  "common.goBack": "Go back",

  "language.label": "Language",

  "home.welcomeBack": "Welcome back 👋",
  "home.welcomePrompt": "What beautiful toon will you create today?",
  "home.createNew": "Create new toon",
  "home.generate": "Generate",
  "home.generateDesc": "Turn your idea into anime or cartoon art",
  "home.myGallery": "My Gallery",
  "home.myGalleryDesc": "Browse all your past creations",
  "home.recent": "Recent creations",
  "home.viewAll": "View all",
  "home.noCreations": "No creations yet",
  "home.noCreationsHint": "Hit Generate above to make your first toon!",
  "home.makeFirst": "Make your first toon",

  "marketing.beautiful": "Beautiful",
  "marketing.cartoons": "cartoons",
  "marketing.madeByYou": "made by you.",
  "marketing.subtitle":
    "Type an idea, pick a style, and let AI bring your anime or cartoon character to life in seconds.",
  "marketing.furakMeans": "furak means “beautiful” in Tetum 🇹🇱",
  "marketing.startFree": "Start creating for free",
  "marketing.signIn": "Sign in",
  "marketing.featAnimeTitle": "Anime & Cartoon",
  "marketing.featAnimeDesc": "One-tap toggle between Anime and Cartoon styles.",
  "marketing.featFastTitle": "Fast AI Models",
  "marketing.featFastDesc":
    "Flux Fast & Stable Diffusion XL — results in seconds.",
  "marketing.featSafeTitle": "Safety First",
  "marketing.featSafeDesc": "Every prompt is checked before generation.",
  "marketing.ctaTitle": "Ready to create?",
  "marketing.ctaSubtitle":
    "Join and start generating beautiful toons for free.",
  "marketing.ctaButton": "Get started — it's free",

  "create.stepSafety": "Safety Check",
  "create.stepSafetySub": "Scanning your prompt…",
  "create.stepEnhance": "Polishing Prompt",
  "create.stepEnhanceSub": "Adding style & detail…",
  "create.stepPainting": "Painting",
  "create.stepPaintingSub": "AI is drawing your toon…",
  "create.stepFinalizing": "Finalizing",
  "create.stepFinalizingSub": "Saving to your gallery…",
  "create.stepBlocked": "Blocked — prompt not allowed",
  "create.stepActive": "In progress",
  "create.stepComplete": "Complete",

  "create.creatingTitle": "Creating your toon",
  "create.safetyFailedTitle": "Safety check failed",

  "create.promptNotAllowed": "Prompt Not Allowed",
  "create.tryNewPrompt": "Try new prompt",

  "create.ready": "Your toon is ready! ✨",
  "create.yourReference": "Your Reference",
  "create.generatedToon": "Generated Toon",
  "create.createAnother": "Create another",
  "create.download": "Download",

  "create.somethingWrong": "Something went wrong",

  "create.title": "Create Your Toon",
  "create.subtitle": "Describe your idea and watch it come to life",
  "create.styleLabel": "Style",
  "create.anime": "Anime",
  "create.cartoon": "Cartoon",
  "create.refLabel": "Reference Character",
  "create.refDesc": "Upload a face photo to base the character on (optional)",
  "create.refMax": "Max 1",
  "create.refReady": "Reference ready",
  "create.refRemove": "Remove reference image",
  "create.dropPhoto": "Drop a face photo here",
  "create.dropHint": "or click to browse · JPG, PNG, WebP · max {max}MB",
  "create.promptLabel": "Your Prompt",
  "create.promptPlaceholder":
    "e.g. 'a fox warrior standing in a glowing enchanted forest at night'",
  "create.enhancing": "Enhancing with AI…",
  "create.enhanceCta": "Enhance my prompt with AI",
  "create.modelLabel": "AI Model",
  "create.refMode": "Reference mode — only Ref models available",
  "create.default": "Default",
  "create.locked": "Locked",
  "create.processTitle": "What happens when you click Generate",
  "create.generateButton": "Generate Toon",

  "create.errEnhanceFailed": "Enhancement failed",
  "create.errEnhanceRetry": "Enhancement failed. Please try again.",
  "create.errSafetyRetry": "Safety check failed. Please try again.",
  "create.errPromptNotAllowed":
    "That prompt isn't allowed. Please try a different idea!",
  "create.errGenFailed": "Generation failed",
  "create.errGenRetry": "Generation failed. Please try again.",
  "create.errBadImage": "Please upload a JPG, PNG, or WebP image.",
  "create.errImageTooBig": "Image must be under {max}MB.",

  "gallery.title": "My Gallery",
  "gallery.noToons": "No toons yet",
  "gallery.countCreated": "{count} toon{plural} created",
  "gallery.createNew": "Create new",
  "gallery.emptyTitle": "Your gallery is empty",
  "gallery.emptyHint": "Create your first toon and it will appear here",
  "gallery.makeFirst": "Make your first toon",

  "auth.tagline": "Beautiful AI Cartoons",
  "auth.emailLabel": "Email",
  "auth.emailPlaceholder": "you@example.com",
  "auth.passwordLabel": "Password",

  "auth.loginTitle": "Welcome back!",
  "auth.loginSubtitle": "Sign in to continue creating",
  "auth.loginPasswordPlaceholder": "••••••••",
  "auth.signingIn": "Signing in…",
  "auth.signInCta": "Sign in",
  "auth.noAccount": "Don't have an account?",
  "auth.createOne": "Create one",

  "auth.registerTitle": "Create your account",
  "auth.registerSubtitle": "Start generating beautiful toons for free",
  "auth.registerPasswordPlaceholder": "At least 6 characters",
  "auth.creatingAccount": "Creating account…",
  "auth.getStartedCta": "Get started",
  "auth.haveAccount": "Already have an account?",
  "auth.signInLink": "Sign in",
};

// The English dict is exported so per-locale files can reference it for typing
// and partial-override patterns.
export { en };

export const translations: Record<Locale, Dict> = {
  en,
  ...localeDicts,
};
