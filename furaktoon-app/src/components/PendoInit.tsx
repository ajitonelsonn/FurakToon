"use client";

import { useEffect, useRef } from "react";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    pendo: any;
  }
}

function getAnonId(): string {
  const key = "pendo_anon_id";
  try {
    let id = localStorage.getItem(key);
    // Regenerate if missing or if a legacy/corrupted value (e.g. the literal
    // string "anonymous") slipped in — every anon ID must follow anon-<uuid>.
    if (!id || !id.startsWith("anon-")) {
      id = `anon-${crypto.randomUUID()}`;
      localStorage.setItem(key, id);
    }
    return id;
  } catch {
    // localStorage unavailable (storage blocked, quota exceeded, etc.)
    return `anon-${crypto.randomUUID()}`;
  }
}

function buildConfig(user: User | null) {
  const anonId = getAnonId();
  return user
    ? { visitor: { id: user.id, email: user.email }, account: { id: "furaktoon" } }
    : { visitor: { id: anonId }, account: { id: "furaktoon" } };
}

export default function PendoInit({ user }: { user: User | null }) {
  const initialized = useRef(false);

  // Initial Pendo setup from the server-rendered user prop.
  useEffect(() => {
    if (typeof window === "undefined" || !window.pendo) return;

    const config = buildConfig(user);

    if (!initialized.current) {
      window.pendo.initialize(config);
      initialized.current = true;
    } else {
      window.pendo.identify(config);
    }
  }, [user]);

  // Re-identify immediately when Supabase auth state changes on the client.
  //
  // Why this matters: when a user registers or logs in, the server action
  // calls redirect("/create"). The URL change causes the analytics SDK to
  // auto-fire a page view. React's useEffect (above) runs AFTER that page
  // view, so the new user's first /create page view was incorrectly
  // attributed to the old anonymous visitor — meaning new registered users
  // never appeared in "visitors who visited tracked pages" KPI metrics.
  //
  // onAuthStateChange fires when the browser receives the new session cookie
  // from the server action response, which happens BEFORE Next.js performs
  // the client-side navigation. Calling pendo.identify() here ensures the
  // correct visitor identity is set before the /create page view fires.
  useEffect(() => {
    const supabase = createClient();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (typeof window === "undefined" || !window.pendo) return;
      if (!initialized.current) return;
      window.pendo.identify(buildConfig(session?.user ?? null));
    });
    return () => subscription.unsubscribe();
  }, []);

  return null;
}
