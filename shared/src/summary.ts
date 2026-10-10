// The AI summary: its shape, and the check every summary must pass before
// anything is shown to the couple. Used by both the server and the app.
import { z } from "zod";

const text = z.string().trim();

const person = z.object({
  view: text,
  needs: z.array(text),
});

/**
 * The shape we ask the AI for. Deliberately loose (no length limits) so it can
 * be sent to the API as a structured-output schema; parseSummary() applies the rules.
 */
export const SummaryShape = z.object({
  safety_concern: z.boolean(),
  // Only used when safety_concern is true, so it may be left out otherwise.
  safety_note: text.optional(),
  a: person,
  b: person,
  common_ground: z.array(text),
  core_difference: text,
  options: z.array(z.object({ title: text, detail: text })),
  reflection: text,
});
export type RawSummary = z.infer<typeof SummaryShape>;

export const MAX_NEEDS = 3;
export const MAX_OPTIONS = 3;

export interface Option {
  title: string;
  detail: string;
}

export type Summary =
  | {
      safety_concern: false;
      a: { view: string; needs: string[] };
      b: { view: string; needs: string[] };
      common_ground: string[];
      core_difference: string;
      options: Option[];
      reflection: string;
    }
  | {
      safety_concern: true;
      safety_note: string;
    };

export const DEFAULT_SAFETY_NOTE =
  "Parts of this conversation suggest someone may not feel safe. Please talk with a counselor or a local support line.";

export type ParseResult = { ok: true; summary: Summary } | { ok: false; reason: string };

const nonEmpty = (xs: string[]) => xs.filter(x => x.length > 0);

/**
 * Checks and tidies an AI summary. Accepts a JSON string or an already-parsed value.
 * A safety concern always wins: the result then carries only the note, never options.
 */
export function parseSummary(input: unknown): ParseResult {
  let value = input;
  if (typeof input === "string") {
    try {
      value = JSON.parse(input);
    } catch {
      return { ok: false, reason: "not JSON" };
    }
  }
  // Check safety first, even if the rest of the summary is malformed.
  if (value && typeof value === "object" && (value as { safety_concern?: unknown }).safety_concern === true) {
    const note = (value as { safety_note?: unknown }).safety_note;
    return {
      ok: true,
      summary: { safety_concern: true, safety_note: typeof note === "string" && note.trim() ? note.trim() : DEFAULT_SAFETY_NOTE },
    };
  }

  const parsed = SummaryShape.safeParse(value);
  if (!parsed.success) return { ok: false, reason: "unexpected shape" };
  const s = parsed.data;

  if (!s.a.view || !s.b.view) return { ok: false, reason: "missing a view" };
  const options = s.options.filter(o => o.title.length > 0).slice(0, MAX_OPTIONS);
  if (options.length === 0) return { ok: false, reason: "no options" };

  return {
    ok: true,
    summary: {
      safety_concern: false,
      a: { view: s.a.view, needs: nonEmpty(s.a.needs).slice(0, MAX_NEEDS) },
      b: { view: s.b.view, needs: nonEmpty(s.b.needs).slice(0, MAX_NEEDS) },
      common_ground: nonEmpty(s.common_ground),
      core_difference: s.core_difference,
      options,
      reflection: s.reflection,
    },
  };
}

/** What the app sends to the server. */
export const SummaryRequest = z.object({
  names: z.tuple([z.string().trim().min(1).max(60), z.string().trim().min(1).max(60)]),
  topic: z.string().trim().max(200).default(""),
  turns: z
    .array(z.object({ who: z.union([z.literal(0), z.literal(1)]), text: z.string().trim().min(1).max(5000) }))
    .min(2)
    .max(200),
});
export type SummaryRequest = z.infer<typeof SummaryRequest>;
