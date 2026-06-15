"use client";

import { useEffect, useRef } from "react";
import type { User } from "@supabase/supabase-js";

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    pendo: any;
  }
}

function getAnonId(): string {
  const key = "pendo_anon_id";
  let id = localStorage.getItem(key);
  if (!id) {
    id = `anon-${crypto.randomUUID()}`;
    localStorage.setItem(key, id);
  }
  return id;
}

export default function PendoInit({ user }: { user: User | null }) {
  const initialized = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined" || !window.pendo) return;

    const anonId = getAnonId();
    const config = user
      ? { visitor: { id: user.id, email: user.email }, account: { id: "furaktoon" } }
      : { visitor: { id: anonId }, account: { id: "furaktoon" } };

    if (!initialized.current) {
      window.pendo.initialize(config);
      initialized.current = true;
    } else {
      window.pendo.identify(config);
    }
  }, [user]);

  return null;
}
