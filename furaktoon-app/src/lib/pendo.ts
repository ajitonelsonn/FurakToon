const PENDO_TRACK_URL = "https://data.pendo.io/data/track";
const PENDO_INTEGRATION_KEY = "435bdc91-eaa2-47d3-a571-8dd844f21b1b";

export async function pendoTrackServer(
  event: string,
  visitorId: string,
  properties?: Record<string, string | number | boolean>,
  accountId?: string
) {
  try {
    await fetch(PENDO_TRACK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-pendo-integration-key": PENDO_INTEGRATION_KEY,
      },
      body: JSON.stringify({
        type: "track",
        event,
        visitorId,
        accountId: accountId ?? "furaktoon",
        timestamp: Date.now(),
        properties: properties ?? {},
      }),
    });
  } catch {
    // Do not let tracking failures break application flow
  }
}
