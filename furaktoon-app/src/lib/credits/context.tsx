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
