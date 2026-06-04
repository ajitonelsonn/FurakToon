import Together from "together-ai";
import { createClient } from "@/lib/supabase/server";
import { createClient as createSupabase } from "@supabase/supabase-js";
import { IMAGE_MODELS } from "@/lib/models";

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
): Promise<string> {
  let refExtra: Record<string, unknown> = {};
  if (referenceUrl && referenceParam === "image_url") {
    refExtra = { image_url: referenceUrl };
  } else if (referenceUrl && referenceParam === "reference_images") {
    refExtra = { reference_images: [referenceUrl] };
  }

  const result = await together.images.generate({
    model: modelId,
    prompt: finalPrompt,
    width: 1024,
    height: 1024,
    steps,
    n: 1,
    ...refExtra,
  });
  return (result.data[0] as { url?: string })?.url ?? "";
}

async function storeGeneratedImage(
  imageUrl: string,
  userId: string,
): Promise<string> {
  const serviceSupabase = createServiceRoleClient();
  try {
    const imgBuffer = await (await fetch(imageUrl)).arrayBuffer();
    const fileName = `${userId}/${Date.now()}.png`;
    const { error } = await serviceSupabase.storage
      .from("images")
      .upload(fileName, imgBuffer, { contentType: "image/png" });
    if (error) {
      console.error("[storage upload error]", error);
      return imageUrl;
    }
    return serviceSupabase.storage.from("images").getPublicUrl(fileName).data.publicUrl;
  } catch (e) {
    console.error("[storage exception]", e);
    return imageUrl;
  }
}

async function tryGenerateImage(
  modelId: string,
  steps: number,
  finalPrompt: string,
  referenceUrl: string | undefined,
  referenceParam: "image_url" | "reference_images" | undefined,
): Promise<{ imageUrl?: string; genError?: Response }> {
  try {
    const url = await generateImage(modelId, steps, finalPrompt, referenceUrl, referenceParam);
    return { imageUrl: url };
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
      return Response.json({ error: moderationErr }, { status: 400 });
    }
  } catch {
    return Response.json({ error: "Moderation check failed" }, { status: 500 });
  }

  // Upload reference image only if model supports it
  const effectiveRefFile = model.supportsReferenceImage ? refFile : null;
  const referenceUrl = effectiveRefFile && effectiveRefFile.size > 0
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
  const refParam = "referenceParam" in model ? model.referenceParam : undefined;
  const { imageUrl, genError } = await tryGenerateImage(
    model.id, model.steps, finalPrompt, referenceUrl, refParam,
  );
  if (genError) return genError;
  if (!imageUrl) return Response.json({ error: "No image returned" }, { status: 500 });

  // Store generated image
  const storedUrl = await storeGeneratedImage(imageUrl, user.id);

  // Save to database
  const { error: dbError } = await supabase.from("generations").insert({
    user_id: user.id,
    prompt,
    style,
    model: modelId,
    image_url: storedUrl,
  });

  if (dbError) {
    console.error("[db insert error]", dbError);
    return Response.json({
      imageUrl: storedUrl,
      warning: "Image generated but not saved to gallery: " + dbError.message,
    });
  }

  return Response.json({ imageUrl: storedUrl });
}
