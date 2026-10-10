// Talks to our server, which holds the API key and asks Claude for the summary.
// The app never calls Anthropic directly.
import Constants from "expo-constants";
import { parseSummary, type Summary, type SummaryRequest } from "@common-ground/shared";

/**
 * Where the server is. Set EXPO_PUBLIC_SERVER_URL to override. Otherwise, during
 * development, assume it runs on the same computer as the Expo dev server.
 */
export function serverUrl(): string {
  const configured = process.env.EXPO_PUBLIC_SERVER_URL;
  if (configured) return configured.replace(/\/$/, "");
  const host = Constants.expoConfig?.hostUri?.split(":")[0] ?? "localhost";
  return `http://${host}:8787`;
}

export type SummaryFailure = "cancelled" | "offline" | "busy" | "unavailable" | "invalid";

export class SummaryFetchError extends Error {
  constructor(readonly reason: SummaryFailure) {
    super(reason);
  }
}

export async function fetchSummary(req: SummaryRequest, signal: AbortSignal): Promise<Summary> {
  let res: Response;
  try {
    res = await fetch(`${serverUrl()}/summary`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req),
      signal,
    });
  } catch {
    throw new SummaryFetchError(signal.aborted ? "cancelled" : "offline");
  }
  if (res.status === 429) throw new SummaryFetchError("busy");
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { error?: string };
    throw new SummaryFetchError(body.error === "invalid" || body.error === "declined" ? "invalid" : "unavailable");
  }
  // The server already checked it; check again before showing anything.
  const body = (await res.json().catch(() => null)) as { summary?: unknown } | null;
  const result = parseSummary(body?.summary);
  if (!result.ok) throw new SummaryFetchError("invalid");
  return result.summary;
}
