# Common Ground — project brief

Common Ground (working name) is a mobile app that helps two people in conflict talk it through and find a way forward. Version 1 is for **couples**. The app listens while the couple talks out loud, stays silent unless the conversation escalates, and at the end gives a neutral summary and helps them agree on next steps.

A working web prototype of the full flow is in `prototype/common-ground.html`. Treat it as the UX reference: screens, wording, flow and tone. It is a single-file HTML page with typed turns instead of audio; the real app replaces typing with live listening.

## Principles

1. **Helper, not judge.** The app never decides who is right, assigns blame, scores people or gives a verdict. It moves people from positions ("I want X") to interests ("I need Y because…").
2. **Silent by default.** During the conversation the app only listens. It speaks up only when things escalate, and rarely.
3. **Safety first.** Mediation is not appropriate where there is abuse, threats, coercion or fear. The app must detect this and step back, pointing people to professional help.
4. **Private by design.** These are intimate conversations. Collect as little as possible, keep it as briefly as possible, and never let one partner use the app against the other.
5. **Build skills, not dependence.** The long-term goal is that couples handle conflict better without the app.

## Session flow

1. **Setup.** Both names, an optional topic.
2. **Private check-in (each partner alone, ~30 s).** The phone is handed to each person in turn; the other looks away.
   - "How are you feeling right now?" Calm / Okay / Tense / Upset / Very upset.
   - "Do you feel safe having this conversation together?" Yes / Not sure / No.
   - Any **No** ends the session immediately with a neutral message that never reveals who answered.
   - **Not sure**, or both partners Upset or worse: suggest waiting or another time; allow "Continue carefully".
   - Answers are never shown to the other partner.
3. **Live conversation.** The app listens and transcribes, telling the two voices apart. Structured turns: one person talks, the other listens; a soft 2-minute turn timer (overrun allowed, shown gently).
4. **Escalation handling** (see below). A Pause button is always available to either partner.
5. **End summary (AI).** For each person: their view in 2 sentences, as they would recognize it, and up to 3 underlying needs. Then: where they already agree, the core difference in one neutral sentence, exactly 3 small concrete options that serve both people's needs, and one encouraging sentence that takes no side.
6. **Agreement.** Each partner independently taps the options they are willing to try; they can add their own. Only options both chose go into the agreement. Copy/share the agreement.
7. **Check-in.** About two weeks later, the app asks both partners whether the agreement is working (push notification in the real app).

## Escalation detection

Rules:
- Intervene **at most twice per session**, and not again within 2 turns of the last intervention.
- Interventions are short, neutral and blame-free. Never name who escalated. Example: "It sounds like things are getting heated. That's normal in a hard conversation. A short pause usually helps you both be heard."
- Options offered: breathe together for 1 minute (animated breathing guide), take a 20-minute break (once people are flooded, the body needs about 20 minutes to calm down), or keep going.

Signals, in order of implementation:
- **v1 (text, already in the prototype):** shouting in capitals, repeated exclamation marks, absolutes ("always", "never", "every time"), insults and contempt words, sarcasm markers. See `heat()` in the prototype; threshold score ≥ 3.
- **v2 (audio):** volume rise relative to each speaker's baseline, overlapping speech / interruptions, one person talking without pause for a long time.
- **v3 (meaning):** criticism, contempt, defensiveness and stonewalling (Gottman's "four horsemen"), detected by the AI from the transcript. Quiet contempt or one partner shutting down can matter more than shouting.

Use our own wording and rules based on published relationship research. Do not copy Gottman (or any) copyrighted material into the app. Gottman Inc. offers a commercial AI API (gottmanai.com, closed beta); a possible later partnership, not a dependency.

## AI summary

- Called from **our server**, never directly from the app. The Anthropic API key lives only on the server.
- Input: names, topic, transcript (speaker-labelled). Output: JSON, validated before display:

```json
{
  "safety_concern": false,
  "safety_note": "",
  "a": { "view": "", "needs": [""] },
  "b": { "view": "", "needs": [""] },
  "common_ground": [""],
  "core_difference": "",
  "options": [{ "title": "", "detail": "" }],
  "reflection": ""
}
```

- `safety_concern` is true only when the transcript shows threats, fear, coercion, intimidation or violence. Then show `safety_note`, show no options, and offer to end and erase the session.
- The full prompt used in the prototype is in `prompt()` inside `prototype/common-ground.html`; start from it.

## Safety

- The private check-in is the main screen for safety, because neither person can raise fear with the other listening.
- Never attempt to mediate when safety is in question. End neutrally, without revealing who answered, and point to professional help and local support lines (localized per country).
- The app is not therapy and must say so clearly.

## Privacy requirements

- Both partners must explicitly consent before any listening starts. Show clearly when the app is listening.
- Default: audio is processed and deleted; only the transcript-derived summary and the agreement are kept, and only if both partners choose to keep them.
- Neither partner can secretly replay, export or share a session.
- Encrypt anything stored. One-tap "erase everything".
- Do not use session data for training or analytics without explicit opt-in.

## Suggested technical approach

These are recommendations; confirm with Fred before committing to a paid service.

- **App:** React Native with Expo, TypeScript, one codebase for iOS and Android.
- **Server:** a small TypeScript backend (or serverless functions) that holds secrets and calls the Anthropic API for summaries and v3 escalation checks.
- **Speech:** a speech-to-text service with speaker separation (diarization) and streaming support. Evaluate options for accuracy, cost, privacy terms and language support (English first; Japanese, Korean and French are likely later).
- **Storage:** minimal; nothing needed for v1 beyond the device.

## Milestones

1. **App shell.** Rebuild the prototype flow natively (typed turns, check-ins, pause, summary via server, agreement). No audio yet.
2. **Live listening.** Recording, streaming transcription, two-speaker separation; remove the typing step.
3. **Audio escalation signals (v2)** plus AI-based signals (v3).
4. **Check-in reminders** and saving agreements (with consent).
5. **Hardening and release.** Privacy review, localization, accessibility, app store submission.

## Out of scope for v1

Accounts and pairing two phones, other relationship types (roommates, coworkers, co-parents), therapist features, payments.

## Open questions

- Final product name.
- First language(s) and markets.
- Pricing model.
- Using one shared phone vs. each partner on their own phone.

## Working conventions

- Explain technical choices in plain language; Fred is not a developer.
- Ask before adding paid services or anything that stores personal data.
- Never commit secrets. Use environment variables.
- Keep user-facing copy warm, plain and blame-free, as in the prototype.
- Add tests for escalation scoring and for parsing/validating the AI summary.
