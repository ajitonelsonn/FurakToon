import "server-only";
import { createClient } from "@/lib/supabase/server";

/**
 * Returns the current user's credit balance, applying any pending monthly
 * refill. Returns null if not authenticated or on error.
 */
export async function getBalance(): Promise<number | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("ensure_monthly_refill");
  if (error) {
    console.error("[credits] ensure_monthly_refill failed", error);
    return null;
  }
  return typeof data === "number" ? data : null;
}

/**
 * Returns the user's balance and monthly allowance (applying any refill first).
 * Returns null if not authenticated or on error.
 */
export async function getCreditsSummary(): Promise<
  { balance: number; allowance: number } | null
> {
  const supabase = await createClient();
  // Apply refill, then read the row (RLS limits it to the current user).
  const balance = await getBalance();
  if (balance === null) return null;
  const { data, error } = await supabase
    .from("credits")
    .select("balance, monthly_allowance")
    .single();
  if (error || !data) {
    console.error("[credits] summary read failed", error);
    return { balance, allowance: balance };
  }
  return { balance: data.balance, allowance: data.monthly_allowance };
}

/**
 * Atomically spends `cost` credits (refilling first if a new month started).
 * Returns the new balance, or -1 if the user can't afford it.
 */
export async function spendCredits(cost: number): Promise<number> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("spend_credits", { cost });
  if (error) {
    console.error("[credits] spend_credits failed", error);
    throw new Error("Could not deduct credits");
  }
  return typeof data === "number" ? data : -1;
}

/** Refunds `amount` credits (capped at the monthly allowance). */
export async function refundCredits(amount: number): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.rpc("refund_credits", { amount });
  if (error) {
    // Non-fatal: a failed refund shouldn't break the user's flow.
    console.error("[credits] refund_credits failed", error);
  }
}
