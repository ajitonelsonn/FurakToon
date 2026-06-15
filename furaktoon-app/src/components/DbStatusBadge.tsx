"use client";

import { useEffect, useState } from "react";
import { useT } from "@/lib/i18n/context";

type Status = "checking" | "online" | "offline";

// Minimal inline indicator of live Supabase DB reachability — designed for the
// footer. Useful on the free tier, where the project can pause/suspend and needs
// a manual resume.
export default function DbStatusBadge() {
  const t = useT();
  const [status, setStatus] = useState<Status>("checking");

  useEffect(() => {
    let active = true;

    async function check() {
      try {
        const res = await fetch("/api/health", { cache: "no-store" });
        const data = await res.json().catch(() => ({ ok: false }));
        if (active) setStatus(res.ok && data.ok ? "online" : "offline");
      } catch {
        if (active) setStatus("offline");
      }
    }

    check();
    // Re-check every 5 minutes so a resume is picked up without a reload.
    const id = setInterval(check, 5 * 60 * 1000);
    return () => {
      active = false;
      clearInterval(id);
    };
  }, []);

  const config: Record<Status, { dot: string; ring: string; label: string }> = {
    checking: { dot: "bg-amber-400", ring: "bg-amber-400/40", label: t("status.checking") },
    online: { dot: "bg-emerald-400", ring: "bg-emerald-400/40", label: t("status.online") },
    offline: { dot: "bg-red-400", ring: "bg-red-400/40", label: t("status.offline") },
  };
  const c = config[status];

  return (
    <span
      role="status"
      aria-live="polite"
      title={c.label}
      className="inline-flex items-center gap-1.5 align-middle"
    >
      <span className="relative flex h-2 w-2">
        {status !== "offline" && (
          <span className={`absolute inline-flex h-full w-full animate-ping rounded-full ${c.ring}`} />
        )}
        <span className={`relative inline-flex h-2 w-2 rounded-full ${c.dot}`} />
      </span>
      {c.label}
    </span>
  );
}
