import Together from "together-ai";
import { createClient } from "@/lib/supabase/server";
import { createClient as createSupabase } from "@supabase/supabase-js";
import { IMAGE_MODELS } from "@/lib/models";
import { pendoTrackServer } from "@/lib/pendo";
import { creditCost } from "@/lib/credits";
import { spendCredits, refundCredits } from "@/lib/credits.server";

const together = new Together();

const MODERATION_PROMPT = `You are a content safety filter for an image-generation app.
Decide if the user's prompt is safe to generate as a cartoon/anime image.
UNSAFE categories: sexual or suggestive content, nudity, harassment or bullying,
hate or discrimination, graphic violence or gore, illegal activity, and ANY sexual
or romantic content involving minors (always unsafe).
Respond with ONLY this JSON, nothing else:
{"safe": true|false, "reason": "short reason if unsafe, else empty"}`;

function createServiceRoleClient() {
  return createSupabase(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? "",
  );
}

async function runModerationCheck(prompt: string): Promise<string | null> {
  const check = await together.chat.completions.create({
    model: "meta-llama/Llama-3.3-70B-Instruct-Turbo",
    messages: [
      { role: "system", content: MODERATION_PROMPT },
      { role: "user", content: prompt },
    ],
    response_format: { type: "json_object" },
  });
  const verdict = JSON.parse(
    check.choices[0]?.message?.content ?? "{}"
  ) as { safe: boolean; reason?: string };
  if (verdict.safe) return null;
  return "That prompt isn't allowed. " + (verdict.reason ?? "");
}

async function uploadReferenceImage(
  refFile: File,
  userId: string,
): Promise<string | undefined> {
  const serviceSupabase = createServiceRoleClient();
  try {
    const ext = refFile.type.split("/")[1] ?? "jpg";
    const refName = `refs/${userId}/${Date.now()}-ref.${ext}`;
    const refBuffer = await refFile.arrayBuffer();
    const { error } = await serviceSupabase.storage
      .from("images")
      .upload(refName, refBuffer, { contentType: refFile.type });
    if (error) {
      console.error("[ref upload error]", error);
      return undefined;
    }
    return serviceSupabase.storage.from("images").getPublicUrl(refName).data.publicUrl;
  } catch (e) {
    console.error("[ref upload exception]", e);
    return undefined;
  }
}

async function generateImage(
  modelId: string,
  steps: number,
  finalPrompt: string,
  referenceUrl: string | undefined,
  referenceParam: "image_url" | "reference_images" | undefined,
  responseFormat: "base64" | "url" | undefined,
  noSteps: boolean,
): Promise<{ url?: string; b64?: string }> {
  let refExtra: Record<string, unknown> = {};
  if (referenceUrl && referenceParam === "image_url") {
    refExtra = { image_url: referenceUrl };
  } else if (referenceUrl && referenceParam === "reference_images") {
    refExtra = { reference_images: [referenceUrl] };
  }

  const useBase64 = responseFormat === "base64";

  const result = await together.images.generate({
    model: modelId,
    prompt: finalPrompt,
    width: 1024,
    height: 1024,
    ...(noSteps ? {} : { steps }),
    n: 1,
    response_format: useBase64 ? "base64" : "url",
    ...refExtra,
  });

  const item = result.data[0] as { url?: string; b64_json?: string };
  if (useBase64 && item.b64_json) {
    return { b64: item.b64_json };
  }
  return { url: item.url ?? "" };
}

async function storeGeneratedImage(
  source: { url?: string; b64?: string },
  userId: string,
): Promise<string> {
  const serviceSupabase = createServiceRoleClient();
  const fileName = `${userId}/${Date.now()}.png`;
  try {
    let imgBuffer: ArrayBuffer;
    if (source.b64) {
      imgBuffer = Uint8Array.from(atob(source.b64), (c) => c.codePointAt(0) ?? 0).buffer;
    } else if (source.url) {
      imgBuffer = await (await fetch(source.url)).arrayBuffer();
    } else {
      return "";
    }
    const { error } = await serviceSupabase.storage
      .from("images")
      .upload(fileName, imgBuffer, { contentType: "image/png" });
    if (error) {
      console.error("[storage upload error]", error);
      return "";
    }
    return serviceSupabase.storage.from("images").getPublicUrl(fileName).data.publicUrl;
  } catch (e) {
    console.error("[storage exception]", e);
    return "";
  }
}

async function tryGenerateImage(
  modelId: string,
  steps: number,
  finalPrompt: string,
  referenceUrl: string | undefined,
  referenceParam: "image_url" | "reference_images" | undefined,
  responseFormat: "base64" | "url" | undefined,
  noSteps: boolean,
): Promise<{ imageUrl?: string; genError?: Response }> {
  try {
    const result = await generateImage(
      modelId, steps, finalPrompt, referenceUrl, referenceParam, responseFormat, noSteps,
    );
    // b64 — turn into a data URL for immediate display (will be replaced by stored URL)
    const imageUrl = result.b64
      ? `data:image/png;base64,${result.b64}`
      : result.url ?? "";
    return { imageUrl };
  } catch (err: unknown) {
    console.error("[image generation error]", JSON.stringify(err), err);
    const errStatus = err && typeof err === "object" && "status" in err
      ? (err as { status: number }).status : 0;
    const errMessage = err && typeof err === "object" && "message" in err
      ? (err as { message: string }).message : "Unknown error";
    if (errStatus === 422) {
      return { genError: Response.json(
        { error: "That image was blocked by the safety filter. Try rephrasing." },
        { status: 400 },
      )};
    }
    return { genError: Response.json({ error: `Image generation failed: ${errMessage}` }, { status: 500 }) };
  }
}

type SaveParams = {
  supabase: Awaited<ReturnType<typeof createClient>>;
  userId: string; prompt: string; style: string; modelId: string;
  imageUrl: string; creditsRemaining: number;
};

async function saveAndRespond({ supabase, userId, prompt, style, modelId, imageUrl, creditsRemaining }: SaveParams) {
  const isDataUrl = imageUrl.startsWith("data:");
  const storedUrl = await storeGeneratedImage(
    isDataUrl ? { b64: imageUrl.split(",")[1] } : { url: imageUrl },
    userId,
  );
  if (!storedUrl) {
    return Response.json({ error: "Image generated but could not be saved. Please try again." }, { status: 500 });
  }
  await pendoTrackServer("image_generated", userId, {
    style,
    modelId,
    promptLength: prompt.length,
  });
  const { error: dbError } = await supabase.from("generations").insert({
    user_id: userId, prompt, style, model: modelId, image_url: storedUrl,
  });
  if (dbError) {
    console.error("[db insert error]", dbError);
    return Response.json({ imageUrl: storedUrl, creditsRemaining, warning: "Image generated but not saved to gallery: " + dbError.message });
  }
  return Response.json({ imageUrl: storedUrl, creditsRemaining });
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const form = await request.formData();
  const prompt  = form.get("prompt")  as string | null;
  const style   = form.get("style")   as string | null;
  const modelId = form.get("modelId") as string | null;
  const refFile = form.get("referenceImage") as File | null;

  if (!prompt || !style || !modelId) {
    return Response.json({ error: "Missing required fields" }, { status: 400 });
  }

  const model = IMAGE_MODELS.find((m) => m.id === modelId);
  if (!model) return Response.json({ error: "Invalid model" }, { status: 400 });

  // Server-side safety check
  try {
    const moderationErr = await runModerationCheck(prompt);
    if (moderationErr) {
      await pendoTrackServer("content_moderation_blocked", user.id, {
        style,
        modelId,
        moderationReason: moderationErr.substring(0, 100),
        promptLength: prompt.length,
      });
      return Response.json({ error: moderationErr }, { status: 400 });
    }
  } catch {
    return Response.json({ error: "Moderation check failed" }, { status: 500 });
  }

  // Upload reference image only if model supports it
  const effectiveRefFile = model.supportsReferenceImage ? refFile : null;
  const usesReference = !!(effectiveRefFile && effectiveRefFile.size > 0);

  // Charge credits up front (1 normal, 2 with a reference image). Refunded
  // below if generation fails.
  const cost = creditCost(usesReference);
  let newBalance: number;
  try {
    newBalance = await spendCredits(cost);
  } catch {
    return Response.json({ error: "Could not check your credits. Please try again." }, { status: 500 });
  }
  if (newBalance < 0) {
    await pendoTrackServer("generation_blocked_no_credits", user.id, { style, modelId, cost });
    return Response.json(
      { error: "out_of_credits", cost },
      { status: 402 },
    );
  }

  const referenceUrl = usesReference
    ? await uploadReferenceImage(effectiveRefFile, user.id)
    : undefined;

  // Build final prompt — when a reference face is provided, prepend strong
  // face-preservation instructions so the model keeps the person's identity
  const stylePrefix = style === "anime"
    ? "anime style, manga art, cel shading, vibrant colors, highly detailed, "
    : "modern cartoon style, clean bold outlines, flat colors, playful, ";

  const faceInstruction = referenceUrl
    ? "Transform the person in the reference image into the following scene while " +
      "preserving their exact facial features, face shape, skin tone, and identity. " +
      "Keep their face recognisable. "
    : "";

  const finalPrompt = faceInstruction + stylePrefix + prompt;

  // Generate image
  const refParam   = "referenceParam" in model ? model.referenceParam : undefined;
  const respFormat = "responseFormat" in model ? model.responseFormat : undefined;
  const noSteps    = "noSteps" in model && model.noSteps === true;
  const { imageUrl, genError } = await tryGenerateImage(
    model.id, model.steps, finalPrompt, referenceUrl, refParam, respFormat, noSteps,
  );
  // Generation failed — refund the credits we charged.
  if (genError) {
    await refundCredits(cost);
    await pendoTrackServer("image_generation_failed", user.id, {
      style,
      modelId,
      errorType: "api_error",
    });
    return genError;
  }
  if (!imageUrl) {
    await refundCredits(cost);
    return Response.json({ error: "No image returned" }, { status: 500 });
  }

  return saveAndRespond({ supabase, userId: user.id, prompt, style, modelId, imageUrl, creditsRemaining: newBalance });
}
