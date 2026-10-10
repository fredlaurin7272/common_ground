// Private check-in rules. Each partner answers alone; answers never leave the phone
// and are never shown to the other partner.

export const FEELINGS = ["Calm", "Okay", "Tense", "Upset", "Very upset"] as const;
/** 1 = Calm … 5 = Very upset */
export type Feeling = 1 | 2 | 3 | 4 | 5;
export const UPSET: Feeling = 4;

export type SafeAnswer = "yes" | "unsure" | "no";
export const SAFE_OPTIONS: ReadonlyArray<readonly [SafeAnswer, string]> = [
  ["yes", "Yes"],
  ["unsure", "Not sure"],
  ["no", "No"],
];

export interface CheckIn {
  feeling: Feeling;
  safe: SafeAnswer;
}

/**
 * - "stop": someone does not feel safe. End neutrally, never say who.
 * - "pause": someone is unsure, or both are upset. Suggest waiting; allow continuing carefully.
 * - "go": start the conversation.
 */
export type CheckInOutcome = "stop" | "pause" | "go";

export function checkInOutcome(checks: readonly CheckIn[]): CheckInOutcome {
  if (checks.some(c => c.safe === "no")) return "stop";
  if (checks.some(c => c.safe === "unsure")) return "pause";
  if (checks.length > 0 && checks.every(c => c.feeling >= UPSET)) return "pause";
  return "go";
}
