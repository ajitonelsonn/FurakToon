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
    id: "google/flash-image-2.5",
    name: "Gemini Flash Image",
    description: "Best for reference faces — upload a photo to anime-ify.",
    steps: 4,
    noSteps: true,
    supportsReferenceImage: true,
    referenceParam: "reference_images" as const,
    responseFormat: "base64" as const,
  },
] as const;

export type ImageModel = (typeof IMAGE_MODELS)[number];

export const DEFAULT_MODEL = IMAGE_MODELS.find((m) => "default" in m && m.default);
