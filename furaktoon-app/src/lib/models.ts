export const IMAGE_MODELS = [
  {
    id: "black-forest-labs/FLUX.1-schnell",
    name: "Flux Fast",
    description: "Fastest & cheapest. Great for quick ideas.",
    steps: 4,
    default: true,
  },
  {
    id: "stabilityai/stable-diffusion-xl-base-1.0",
    name: "Stable Diffusion XL",
    description: "Versatile, rich details, classic quality.",
    steps: 25,
  },
  {
    id: "Lykon/dreamshaper-xl-turbo",
    name: "Dreamshaper",
    description: "Cheapest option, excellent for anime & illustration.",
    steps: 25,
  },
  {
    id: "ByteDance/SDXL-Lightning",
    name: "SDXL Lightning",
    description: "Ultra-fast, clean anime quality.",
    steps: 4,
  },
  {
    id: "stabilityai/stable-diffusion-2-1",
    name: "Stable Diffusion 2.1",
    description: "Classic model, great stylized cartoon results.",
    steps: 25,
    supportsReferenceImage: false,
  },
] as const;

export type ImageModel = (typeof IMAGE_MODELS)[number];

export const DEFAULT_MODEL = IMAGE_MODELS.find((m) => "default" in m && m.default)!;
