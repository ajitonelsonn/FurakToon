import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCreditsSummary } from "@/lib/credits.server";
import { MONTHLY_ALLOWANCE } from "@/lib/credits";
import AccountView from "./AccountView";

export default async function AccountPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const summary = await getCreditsSummary();

  return (
    <AccountView
      email={user.email ?? ""}
      balance={summary?.balance ?? 0}
      allowance={summary?.allowance ?? MONTHLY_ALLOWANCE}
    />
  );
}
