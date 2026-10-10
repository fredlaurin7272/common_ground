import type { AddressInfo } from "node:net";
import { afterEach, describe, expect, it } from "vitest";
import type { Summary } from "@common-ground/shared";
import { createApp } from "./app.js";
import { SummaryError, type Summarize } from "./summarize.js";
import { systemPrompt, transcript } from "./prompt.js";

const request = {
  names: ["Alex", "Sam"],
  topic: "Weekends",
  turns: [
    { who: 0, text: "I need rest on Saturdays." },
    { who: 1, text: "I want my parents to see us." },
  ],
};

const summary: Summary = { safety_concern: true, safety_note: "Please talk with a professional." };

let close: (() => void) | undefined;
afterEach(() => close?.());

async function start(summarize: Summarize) {
  const server = createApp(summarize).listen(0);
  await new Promise(r => server.once("listening", r));
  close = () => server.close();
  return `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
}

const post = (url: string, body: unknown) =>
  fetch(`${url}/summary`, { method: "POST", headers: { "Content-Type": "application/json" }, body: typeof body === "string" ? body : JSON.stringify(body) });

describe("POST /summary", () => {
  it("returns the summary", async () => {
    const url = await start(async () => summary);
    const res = await post(url, request);
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ summary });
  });

  it("rejects malformed requests without calling the AI", async () => {
    let called = false;
    const url = await start(async () => ((called = true), summary));
    expect((await post(url, "not json")).status).toBe(400);
    expect((await post(url, { ...request, turns: [] })).status).toBe(400);
    expect(called).toBe(false);
  });

  it("maps AI failures to a calm error code", async () => {
    const url = await start(async () => {
      throw new SummaryError("invalid", "unexpected shape");
    });
    const res = await post(url, request);
    expect(res.status).toBe(502);
    expect(await res.json()).toEqual({ error: "invalid" });
  });

  it("rejects very large requests", async () => {
    const url = await start(async () => summary);
    expect((await post(url, "x".repeat(300_000))).status).toBe(413);
  });
});

describe("prompt", () => {
  it("labels each turn with the speaker's name", () => {
    expect(transcript(request as never)).toBe("Alex: I need rest on Saturdays.\nSam: I want my parents to see us.");
  });

  it("names both partners and the topic", () => {
    const p = systemPrompt(request as never);
    expect(p).toContain("Alex and Sam");
    expect(p).toContain("about: Weekends");
  });
});
