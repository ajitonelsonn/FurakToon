// Credit system constants & helpers shared by client and server.
//
// Every user receives MONTHLY_ALLOWANCE credits, reset at the start of each
// month (no rollover). Generating an image spends credits:
//   - a normal generation costs CREDIT_COST.normal
//   - using a reference image costs CREDIT_COST.reference

export const MONTHLY_ALLOWANCE = 10;

export const CREDIT_COST = {
  normal: 1,
  reference: 2,
} as const;

/** Credits a generation will cost, given whether a reference image is used. */
export function creditCost(usesReference: boolean): number {
  return usesReference ? CREDIT_COST.reference : CREDIT_COST.normal;
}

export type Credits = {
  user_id: string;
  balance: number;
  monthly_allowance: number;
  last_refill_month: string; // ISO date (first of month)
  created_at: string;
  updated_at: string;
};

/** First day of next month — when the balance resets. */
export function nextResetDate(from: Date = new Date()): Date {
  return new Date(from.getFullYear(), from.getMonth() + 1, 1);
}
