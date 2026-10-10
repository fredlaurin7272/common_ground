import { describe, expect, it } from "vitest";
import { heat, initialInterventionState, recordIntervention, shouldIntervene } from "./escalation";

describe("heat", () => {
  it("is zero for a calm turn", () => {
    expect(heat("I'd like us to plan Saturdays together.")).toBe(0);
  });

  it("scores shouting in capitals", () => {
    expect(heat("WHY ARE YOU DOING THIS to me")).toBeGreaterThanOrEqual(2);
  });

  it("ignores short capitalised words like I and OK", () => {
    expect(heat("I said OK and I meant it, I think")).toBe(0);
  });

  it("does not count shouting in very short turns", () => {
    expect(heat("NO WAY")).toBe(0);
  });

  it("scores repeated exclamation marks once", () => {
    expect(heat("Fine!!")).toBe(1);
    expect(heat("Fine!! Really!!!")).toBe(1);
    expect(heat("Fine!")).toBe(0);
  });

  it("scores absolutes, capped at two", () => {
    expect(heat("You always do that")).toBe(1);
    expect(heat("You always do that and never listen")).toBe(2);
    expect(heat("always never always never every time")).toBe(2);
  });

  it("scores insults and contempt", () => {
    expect(heat("That's ridiculous")).toBe(2);
    expect(heat("Oh, whatever.")).toBe(2);
  });

  it("scores sarcasm markers", () => {
    expect(heat("Yeah right.")).toBe(1);
  });

  it("does not match words that only contain a signal", () => {
    expect(heat("I feel crazily happy about the lazybones cat")).toBe(0);
  });

  it("reaches the threshold for a heated turn", () => {
    expect(heat("You ALWAYS do this, it's ridiculous!!")).toBeGreaterThanOrEqual(3);
  });
});

describe("shouldIntervene", () => {
  it("stays quiet below the threshold", () => {
    expect(shouldIntervene(2, 1, initialInterventionState)).toBe(false);
  });

  it("steps in at the threshold", () => {
    expect(shouldIntervene(3, 1, initialInterventionState)).toBe(true);
  });

  it("waits more than two turns after stepping in", () => {
    const after = recordIntervention(3, initialInterventionState);
    expect(shouldIntervene(5, 4, after)).toBe(false);
    expect(shouldIntervene(5, 5, after)).toBe(false);
    expect(shouldIntervene(5, 6, after)).toBe(true);
  });

  it("steps in at most twice per session", () => {
    let state = initialInterventionState;
    state = recordIntervention(1, state);
    state = recordIntervention(4, state);
    expect(shouldIntervene(9, 20, state)).toBe(false);
  });
});
