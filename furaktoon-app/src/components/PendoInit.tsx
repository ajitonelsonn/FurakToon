"use client";

import { useEffect } from "react";
import type { User } from "@supabase/supabase-js";

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    pendo: any;
  }
}

export default function PendoInit({ user }: { user: User | null }) {
  useEffect(() => {
    if (typeof window === "undefined" || !window.pendo) return;

    if (user) {
      window.pendo.initialize({
        visitor: { id: user.id, email: user.email },
        account: { id: "furaktoon" },
      });
    } else {
      window.pendo.initialize({
        visitor: { id: "anonymous" },
        account: { id: "furaktoon" },
      });
    }
  }, [user]);

  return null;
}
