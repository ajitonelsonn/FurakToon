import Together from "together-ai";
import { createClient } from "@/lib/supabase/server";
import { IMAGE_MODELS } from "@/lib/models";

const together = new Together();

const MODERATION_PROMPT = `You are a content safety filter for an image-generation app.
Decide if the user's prompt is safe to generate as a cartoon/anime image.
UNSAFE categories: sexual or suggestive content, nudity, harassment or bullying,
hate or discrimination, graphic violence or gore, illegal activity, and ANY sexual
or romantic content involving minors (always unsafe).
Respond with ONLY this JSON, nothing else:
{"safe": true|false, "reason": "short reason if unsafe, else empty"}`;

export async function POST(request: Request) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { prompt, style, modelId } = body as {
    prompt: string;
    style: "anime" | "cartoon";
    modelId: string;
  };

  if (!prompt || !style || !modelId) {
    return Response.json({ error: "Missing required fields" }, { status: 400 });
  }

  const model = IMAGE_MODELS.find((m) => m.id === modelId);
  if (!model) {
    return Response.json({ error: "Invalid model" }, { status: 400 });
  }

  // Safety check
  try {
    const check = await together.chat.completions.create({
      model: "meta-llama/Llama-3.3-70B-Instruct-Turbo",
      messages: [
        { role: "system", content: MODERATION_PROMPT },
        { role: "user", content: prompt },
      ],
      response_format: { type: "json_object" },
    });

    const content = check.choices[0]?.message?.content ?? "{}";
    const verdict = JSON.parse(content) as { safe: boolean; reason?: string };

    if (!verdict.safe) {
      return Response.json(
        {
          error:
            "That prompt isn't allowed. Please try a different idea! " +
            (verdict.reason ? `(${verdict.reason})` : ""),
        },
        { status: 400 }
      );
    }
  } catch {
    return Response.json({ error: "Moderation check failed" }, { status: 500 });
  }

  const stylePrefix =
    style === "anime"
      ? "anime style, manga art, cel shading, vibrant colors, detailed, "
      : "modern cartoon style, clean bold outlines, flat colors, playful, ";

  const finalPrompt = stylePrefix + prompt;

  // Generate image
  let imageUrl: string;
  try {
    const result = await together.images.generate({
      model: model.id,
      prompt: finalPrompt,
      width: 1024,
      height: 1024,
      steps: model.steps,
      n: 1,
    });

    imageUrl = (result.data[0] as { url?: string })?.url ?? "";
    if (!imageUrl) {
      return Response.json({ error: "No image returned" }, { status: 500 });
    }
  } catch (err: unknown) {
    const status =
      err && typeof err === "object" && "status" in err
        ? (err as { status: number }).status
        : 0;
    if (status === 422) {
      return Response.json(
        { error: "That image was blocked by the safety filter. Try rephrasing." },
        { status: 400 }
      );
    }
    return Response.json({ error: "Image generation failed" }, { status: 500 });
  }

  // Download the image and upload to Supabase Storage
  const serviceSupabase = await createServiceRoleClient();
  let storedUrl = imageUrl;

  try {
    const imgRes = await fetch(imageUrl);
    const imgBuffer = await imgRes.arrayBuffer();
    const fileName = `${user.id}/${Date.now()}.png`;

    const { error: uploadError } = await serviceSupabase.storage
      .from("images")
      .upload(fileName, imgBuffer, { contentType: "image/png" });

    if (uploadError) {
      console.error("[storage upload error]", uploadError);
    } else {
      const { data: publicData } = serviceSupabase.storage
        .from("images")
        .getPublicUrl(fileName);
      storedUrl = publicData.publicUrl;
    }
  } catch (storageErr) {
    console.error("[storage exception]", storageErr);
  }

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
    return Response.json(
      { imageUrl: storedUrl, warning: "Image generated but not saved to gallery: " + dbError.message },
      { status: 200 }
    );
  }

  return Response.json({ imageUrl: storedUrl });
}

async function createServiceRoleClient() {
  const { createClient: createBrowserClient } = await import("@supabase/supabase-js");
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}
