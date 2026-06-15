"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type CreditsContextValue = {
  /** Current balance, or null when signed out / unknown. */
  balance: number | null;
  /** Overwrite the balance (e.g. after a generation returns the new total). */
  setBalance: (n: number) => void;
};

const CreditsContext = createContext<CreditsContextValue | null>(null);

export function CreditsProvider({
  initialBalance,
  children,
}: Readonly<{ initialBalance: number | null; children: ReactNode }>) {
  const [balance, setBalance] = useState<number | null>(initialBalance);

  // The server layout re-runs after auth changes (login → redirect, logout) and
  // passes a fresh `initialBalance`. The provider instance is reused across that
  // navigation, so plain useState would keep the stale value until a hard
  // refresh. Reconcile during render when the server value changes — this is
  // React's "adjusting state when a prop changes" pattern (no effect needed).
  const [lastInitial, setLastInitial] = useState<number | null>(initialBalance);
  if (initialBalance !== lastInitial) {
    setLastInitial(initialBalance);
    setBalance(initialBalance);
  }

  const value = useMemo<CreditsContextValue>(
    () => ({ balance, setBalance }),
    [balance]
  );

  return (
    <CreditsContext.Provider value={value}>{children}</CreditsContext.Provider>
  );
}

/**
 * Access the shared credit balance. Returns a no-op fallback when used outside
 * the provider (e.g. signed-out pages) so components don't have to null-check.
 */
export function useCredits(): CreditsContextValue {
  return useContext(CreditsContext) ?? { balance: null, setBalance: () => {} };
}
