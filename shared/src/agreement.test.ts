import { describe, expect, it } from "vitest";
import { agreedOptions, agreementText } from "./agreement";

const options = [
  { title: "One", detail: "" },
  { title: "Two", detail: "Second idea." },
  { title: "Three", detail: "" },
];

describe("agreedOptions", () => {
  it("keeps only options both partners chose", () => {
    expect(agreedOptions(options, { 0: [true, false], 1: [true, true], 2: [false, true] })).toEqual([options[1]]);
  });

  it("is empty when nothing is picked", () => {
    expect(agreedOptions(options, {})).toEqual([]);
  });
});

describe("agreementText", () => {
  it("lists agreed options and the check-in date", () => {
    expect(agreementText(["Alex", "Sam"], "Weekends", [options[0], options[1]], "Friday, October 24")).toBe(
      "Our agreement (Alex & Sam) — Weekends\n• One\n• Two: Second idea.\nCheck-in: Friday, October 24",
    );
  });
});
