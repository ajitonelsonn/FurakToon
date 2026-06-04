export const IMAGE_MODELS = [
  {
    id: "black-forest-labs/FLUX.1-schnell",
    name: "Flux Fast",
    description: "Fastest & cheapest. Great for quick ideas.",
    steps: 4,
    default: true,
    supportsReferenceImage: false,
  },
  {
    id: "stabilityai/stable-diffusion-xl-base-1.0",
    name: "Stable Diffusion XL",
    description: "Versatile, rich details, classic quality.",
    steps: 25,
    supportsReferenceImage: false,
  },
  {
    id: "black-forest-labs/FLUX.1-kontext-pro",
    name: "Flux Kontext Pro",
    description: "Best for reference faces — upload a photo to anime-ify.",
    steps: 28,
    supportsReferenceImage: true,
    referenceParam: "image_url" as const,
  },
] as const;

export type ImageModel = (typeof IMAGE_MODELS)[number];

export const DEFAULT_MODEL = IMAGE_MODELS.find((m) => "default" in m && m.default);
