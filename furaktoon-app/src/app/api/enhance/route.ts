import Together from "together-ai";
import { createClient } from "@/lib/supabase/server";

const together = new Together();

export async function POST(request: Request) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { prompt, style } = body as { prompt: string; style: "anime" | "cartoon" };

  if (!prompt || !style) {
    return Response.json({ error: "Missing required fields" }, { status: 400 });
  }

  const res = await together.chat.completions.create({
    model: "meta-llama/Llama-3.3-70B-Instruct-Turbo",
    messages: [
      {
        role: "system",
        content:
          "You turn a short idea into one vivid image-generation prompt. " +
          "Keep it under 60 words. Describe subject, style, colors, lighting, mood. " +
          "If style is 'anime', use anime/manga descriptors. If 'cartoon', use clean " +
          "Western cartoon/illustration descriptors. Output ONLY the prompt text.",
      },
      { role: "user", content: `Style: ${style}. Idea: ${prompt}` },
    ],
  });

  const enhanced = res.choices[0]?.message?.content ?? prompt;
  return Response.json({ enhanced });
}
