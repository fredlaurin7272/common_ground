# Common Ground

A mobile app that helps couples talk through a conflict and find a way forward. See [CLAUDE.md](CLAUDE.md) for the full brief and [prototype/common-ground.html](prototype/common-ground.html) for the original web prototype.

**Status: Milestone 1 (app shell).** The whole flow works on a phone with typed turns: setup, private check-ins, turn-taking with a soft timer, pause and breathing, escalation check-ins, AI summary, and agreement. Listening comes in Milestone 2.

## What's in here

| Folder | What it is |
| --- | --- |
| `app/` | The phone app (React Native with Expo). One codebase for iPhone and Android. |
| `server/` | A small server that holds the Anthropic API key and asks Claude for the end-of-conversation summary. The app never talks to Anthropic directly. |
| `shared/` | Rules used by both: escalation scoring, check-in rules, checking the AI summary, and building the agreement. Tested. |
| `prototype/` | The original single-page web prototype, kept as the reference for screens and wording. |

## Trying it on your phone

You need a computer (Mac or Windows) with [Node.js](https://nodejs.org) 22 or newer, and the free **Expo Go** app on your phone. Phone and computer must be on the same Wi-Fi.

1. Download this repository and open a terminal in its folder.
2. Install everything (once): `npm install`
3. Add your API key (once): copy `server/.env.example` to `server/.env`, open it, and paste your key after `ANTHROPIC_API_KEY=`. This file stays on your computer; git ignores it, so it never goes to GitHub.
4. Start the server: `npm run server` (leave it running).
5. In a second terminal, start the app: `npm run app`. A QR code appears.
6. Scan the QR code with Expo Go (Android) or the Camera app (iPhone).

The app finds the server on your computer automatically. Without a key, everything works except the summary, which shows a calm "not available" message.

Tip: "Try it with an example couple" on the first screen jumps straight to a sample conversation.

## Checks

- `npm test`: escalation scoring, check-in rules, summary checking, agreement, and the server endpoint.
- `npm run typecheck`: type checks for all three parts.

## Privacy, as built

- Nothing is saved on the phone or the server. Closing the app erases the conversation.
- Check-in answers are kept in memory only until both partners have answered, then forgotten. The "not a good time" message is the same whichever reason triggered it, so it doesn't reveal what the other person answered.
- The server never logs what the couple said.
