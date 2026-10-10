import Anthropic from "@anthropic-ai/sdk";
import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";
import { parseSummary, SummaryShape, type Summary, type SummaryRequest } from "@common-ground/shared";
import { systemPrompt, transcript } from "./prompt.js";

export const MODEL = "claude-opus-5-5";

export class SummaryError extends Error {
  constructor(
    readonly code: "busy" | "unavailable" | "invalid" | "declined",
    message: string,
  ) {
    super(message);
  }
}

export type Summarize = (req: SummaryRequest) => Promise<Summary>;

export function createSummarizer(client = new Anthropic()): Summarize {
  return async req => {
    let response;
    try {
      response = await client.beta.messages.parse({
        model: MODEL,
        max_tokens: 16000,
        output_config: { effort: "medium", format: betaZodOutputFormat(SummaryShape) },
        // If the model declines, let Anthropic retry on its recommended fallback model.
        betas: ["server-side-fallback-2026-07-01"],
        fallbacks: "default",
        system: systemPrompt(req),
        messages: [{ role: "user", content: `Transcript:\n${transcript(req)}` }],
      });
    } catch (error) {
      if (error instanceof Anthropic.RateLimitError) throw new SummaryError("busy", "rate limited");
      if (error instanceof Anthropic.AuthenticationError) throw new SummaryError("unavailable", "API key missing or invalid");
      if (error instanceof Anthropic.APIError) throw new SummaryError("unavailable", `API error ${error.status}`);
      if (error instanceof Anthropic.AnthropicError) throw new SummaryError("unavailable", "API key missing or connection failed");
      throw error;
    }

    if (response.stop_reason === "refusal") throw new SummaryError("declined", "model declined");
    if (response.stop_reason === "max_tokens") throw new SummaryError("invalid", "summary was cut off");

    const result = parseSummary(response.parsed_output);
    if (!result.ok) throw new SummaryError("invalid", result.reason);
    return result.summary;
  };
}
