import { createApp } from "./app.js";
import { createSummarizer } from "./summarize.js";

const port = Number(process.env.PORT ?? 8787);

if (!process.env.ANTHROPIC_API_KEY) {
  console.warn("ANTHROPIC_API_KEY is not set. Summaries will fail until you add it to server/.env (see server/.env.example).");
}

createApp(createSummarizer()).listen(port, () => {
  console.log(`Common Ground server listening on port ${port}`);
});
