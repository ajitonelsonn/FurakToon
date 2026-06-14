import { createClient } from "@/lib/supabase/server";
import type { Generation } from "@/lib/supabase/types";
import { LoggedInHome, MarketingHome } from "./HomeViews";

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const { data } = await supabase
      .from("generations")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(6);

    return <LoggedInHome email={user.email ?? ""} recent={(data ?? []) as Generation[]} />;
  }

  return <MarketingHome />;
}
