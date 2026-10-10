import { describe, expect, it } from "vitest";
import { DEFAULT_SAFETY_NOTE, parseSummary, SummaryRequest } from "./summary";

const good = {
  safety_concern: false,
  safety_note: "",
  a: { view: "Alex wants rest on Saturdays. Long weeks leave little energy.", needs: ["rest", "to be heard"] },
  b: { view: "Sam wants their parents to see them. Skipping visits brings guilt.", needs: ["family closeness"] },
  common_ground: ["You both care about the relationship"],
  core_difference: "How to balance rest with family time on weekends.",
  options: [
    { title: "Alternate weekends", detail: "Visit every other Sunday." },
    { title: "Protect Saturday", detail: "Keep Saturdays free." },
    { title: "Short visits", detail: "Keep visits to two hours." },
  ],
  reflection: "You are already listening to each other.",
};

describe("parseSummary", () => {
  it("accepts a good summary", () => {
    const r = parseSummary(good);
    expect(r.ok).toBe(true);
    if (r.ok && !r.summary.safety_concern) expect(r.summary.options).toHaveLength(3);
  });

  it("accepts its own output, so the app can re-check what the server sends", () => {
    for (const input of [good, { ...good, safety_concern: true, safety_note: "Get help." }]) {
      const first = parseSummary(input);
      expect(first.ok).toBe(true);
      if (first.ok) expect(parseSummary(JSON.parse(JSON.stringify(first.summary)))).toEqual(first);
    }
  });

  it("accepts a JSON string", () => {
    expect(parseSummary(JSON.stringify(good)).ok).toBe(true);
  });

  it("rejects text that is not JSON", () => {
    expect(parseSummary("Sure! Here is your summary")).toEqual({ ok: false, reason: "not JSON" });
  });

  it("rejects missing fields", () => {
    const { b: _b, ...noB } = good;
    expect(parseSummary(noB).ok).toBe(false);
    expect(parseSummary(null).ok).toBe(false);
    expect(parseSummary([]).ok).toBe(false);
  });

  it("rejects wrong types", () => {
    expect(parseSummary({ ...good, options: "be nice" }).ok).toBe(false);
    expect(parseSummary({ ...good, a: { view: 3, needs: [] } }).ok).toBe(false);
  });

  it("rejects an empty view", () => {
    expect(parseSummary({ ...good, a: { view: "  ", needs: [] } }).ok).toBe(false);
  });

  it("rejects a summary with no usable options", () => {
    expect(parseSummary({ ...good, options: [] }).ok).toBe(false);
    expect(parseSummary({ ...good, options: [{ title: " ", detail: "x" }] }).ok).toBe(false);
  });

  it("keeps at most 3 needs and 3 options and drops blanks", () => {
    const r = parseSummary({
      ...good,
      a: { view: "v", needs: ["1", "", "2", "3", "4"] },
      options: [...good.options, { title: "Fourth", detail: "" }],
    });
    expect(r.ok).toBe(true);
    if (r.ok && !r.summary.safety_concern) {
      expect(r.summary.a.needs).toEqual(["1", "2", "3"]);
      expect(r.summary.options).toHaveLength(3);
    }
  });

  describe("safety concern", () => {
    it("returns only the note, never options", () => {
      const r = parseSummary({ ...good, safety_concern: true, safety_note: "Please talk to a professional." });
      expect(r).toEqual({ ok: true, summary: { safety_concern: true, safety_note: "Please talk to a professional." } });
    });

    it("wins even when the rest of the summary is malformed", () => {
      const r = parseSummary({ safety_concern: true });
      expect(r).toEqual({ ok: true, summary: { safety_concern: true, safety_note: DEFAULT_SAFETY_NOTE } });
    });

    it("only counts a real true, not a truthy string", () => {
      expect(parseSummary({ ...good, safety_concern: "true" }).ok).toBe(false);
    });
  });
});

describe("SummaryRequest", () => {
  const req = { names: ["Alex", "Sam"], topic: "", turns: [{ who: 0, text: "hi" }, { who: 1, text: "hello" }] };

  it("accepts a valid request", () => {
    expect(SummaryRequest.safeParse(req).success).toBe(true);
  });

  it("needs at least two turns", () => {
    expect(SummaryRequest.safeParse({ ...req, turns: [req.turns[0]] }).success).toBe(false);
  });

  it("rejects unknown speakers", () => {
    expect(SummaryRequest.safeParse({ ...req, turns: [...req.turns, { who: 2, text: "x" }] }).success).toBe(false);
  });
});
