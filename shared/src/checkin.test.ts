import { describe, expect, it } from "vitest";
import { checkInOutcome } from "./checkin";

describe("checkInOutcome", () => {
  it("goes ahead when both feel safe and are not both upset", () => {
    expect(checkInOutcome([{ feeling: 3, safe: "yes" }, { feeling: 5, safe: "yes" }])).toBe("go");
  });

  it("stops if either partner does not feel safe", () => {
    expect(checkInOutcome([{ feeling: 1, safe: "yes" }, { feeling: 1, safe: "no" }])).toBe("stop");
    expect(checkInOutcome([{ feeling: 1, safe: "no" }, { feeling: 1, safe: "unsure" }])).toBe("stop");
  });

  it("pauses if either partner is unsure", () => {
    expect(checkInOutcome([{ feeling: 1, safe: "unsure" }, { feeling: 1, safe: "yes" }])).toBe("pause");
  });

  it("pauses if both partners are upset or worse", () => {
    expect(checkInOutcome([{ feeling: 4, safe: "yes" }, { feeling: 5, safe: "yes" }])).toBe("pause");
  });
});
