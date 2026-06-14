// Lightweight DB reachability check. A paused/suspended Supabase project (free
// tier) stops responding on its REST endpoint, so a quick fetch to the
// PostgREST base tells us if the database is reachable. Not cached.
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    return Response.json(
      { ok: false, reason: "not_configured" },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }

  // Abort fast so a paused project doesn't hang the request.
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 4000);

  try {
    // Hit the PostgREST root. ANY HTTP response (even 401/404) proves the
    // project is live and reachable — a paused/suspended free-tier project
    // simply doesn't respond and we land in the catch below. We don't query a
    // table, so RLS can't block or stall the probe.
    await fetch(`${url}/rest/v1/`, {
      method: "GET",
      headers: { apikey: key, Authorization: `Bearer ${key}` },
      signal: controller.signal,
      cache: "no-store",
    });

    return Response.json(
      { ok: true },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return Response.json(
      { ok: false, reason: "unreachable" },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  } finally {
    clearTimeout(timeout);
  }
}
