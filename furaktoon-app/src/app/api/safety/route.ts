import Together from "together-ai";
import { createClient } from "@/lib/supabase/server";

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
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { prompt } = await request.json() as { prompt: string };
  if (!prompt) return Response.json({ error: "Missing prompt" }, { status: 400 });

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
    return Response.json(verdict);
  } catch (err) {
    console.error("[safety check error]", err);
    return Response.json({ error: "Safety check failed" }, { status: 500 });
  }
}
