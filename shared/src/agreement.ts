import type { Option } from "./summary";

/** Each partner's picks, by option index: [first partner, second partner]. */
export type Picks = Record<number, [boolean, boolean]>;

export function agreedOptions(options: readonly Option[], picks: Picks): Option[] {
  return options.filter((_, k) => picks[k]?.[0] && picks[k]?.[1]);
}

export function checkInDate(from: Date, days = 14): Date {
  return new Date(from.getTime() + days * 24 * 60 * 60 * 1000);
}

export function agreementText(names: readonly [string, string], topic: string, agreed: readonly Option[], checkIn: string): string {
  const title = `Our agreement (${names[0]} & ${names[1]})${topic ? " — " + topic : ""}`;
  const lines = agreed.map(o => "• " + o.title + (o.detail ? ": " + o.detail : ""));
  return [title, ...lines, `Check-in: ${checkIn}`].join("\n");
}
