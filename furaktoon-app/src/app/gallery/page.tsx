import { createClient } from "@/lib/supabase/server";
import type { Generation } from "@/lib/supabase/types";
import { GalleryView } from "./GalleryView";

export default async function GalleryPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data } = await supabase
    .from("generations")
    .select("*")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false });

  const items = (data ?? []) as Generation[];

  return <GalleryView items={items} />;
}
