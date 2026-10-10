// The HTTP side of the server: one endpoint, POST /summary.
// Privacy: the couple's words are never logged or stored here.
import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { SummaryRequest } from "@common-ground/shared";
import { SummaryError, type Summarize } from "./summarize.js";

const MAX_BODY_BYTES = 200_000;

const STATUS: Record<SummaryError["code"], number> = { busy: 429, unavailable: 503, invalid: 502, declined: 502 };

function send(res: ServerResponse, status: number, body: unknown) {
  res.writeHead(status, {
    "Content-Type": "application/json",
    "Cache-Control": "no-store",
    // Lets the app's web preview call the server; the phone app does not need it.
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
  });
  res.end(JSON.stringify(body));
}

async function readBody(req: IncomingMessage): Promise<string | null> {
  let size = 0;
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    size += chunk.length;
    if (size > MAX_BODY_BYTES) return null;
    chunks.push(chunk);
  }
  return Buffer.concat(chunks).toString("utf8");
}

export function createApp(summarize: Summarize) {
  return createServer(async (req, res) => {
    if (req.method === "OPTIONS") return send(res, 204, null);
    if (req.url === "/health" && req.method === "GET") return send(res, 200, { ok: true });
    if (req.url !== "/summary" || req.method !== "POST") return send(res, 404, { error: "not_found" });

    const raw = await readBody(req);
    if (raw === null) return send(res, 413, { error: "too_large" });

    let json: unknown;
    try {
      json = JSON.parse(raw);
    } catch {
      return send(res, 400, { error: "bad_request" });
    }
    const parsed = SummaryRequest.safeParse(json);
    if (!parsed.success) return send(res, 400, { error: "bad_request" });

    try {
      return send(res, 200, { summary: await summarize(parsed.data) });
    } catch (error) {
      if (error instanceof SummaryError) {
        console.warn(`summary failed: ${error.code} (${error.message})`);
        return send(res, STATUS[error.code], { error: error.code });
      }
      console.error("summary failed: unexpected error", error instanceof Error ? error.name : "");
      return send(res, 500, { error: "unavailable" });
    }
  });
}
