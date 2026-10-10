// Everything about one conversation lives here, in memory only.
// Nothing is written to the phone; closing the app erases it.
import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { initialInterventionState, type CheckIn, type InterventionState, type Option, type Picks, type Summary } from "@common-ground/shared";

export type ScreenName = "welcome" | "handoff" | "checkin" | "unsure" | "stop" | "conversation" | "summary" | "agreement";

export interface Turn {
  who: 0 | 1;
  text: string;
  /** The app stepped in after this turn. */
  flagged: boolean;
}

export interface Session {
  screen: ScreenName;
  names: [string, string];
  topic: string;
  /** Whose private check-in is next. */
  checkIdx: 0 | 1;
  /** The first partner's answers, held only until the second partner answers. */
  firstCheck: CheckIn | null;
  turns: Turn[];
  speaker: 0 | 1;
  intervention: InterventionState;
  summary: Summary | null;
  picks: Picks;
  custom: Option[];
}

export const fresh = (): Session => ({
  screen: "welcome",
  names: ["", ""],
  topic: "",
  checkIdx: 0,
  firstCheck: null,
  turns: [],
  speaker: 0,
  intervention: initialInterventionState,
  summary: null,
  picks: {},
  custom: [],
});

interface SessionApi {
  s: Session;
  update: (patch: Partial<Session> | ((s: Session) => Partial<Session>)) => void;
  go: (screen: ScreenName, patch?: Partial<Session>) => void;
  /** Wipes the whole session and returns to the start. */
  erase: () => void;
  load: (session: Session) => void;
  name: (who: 0 | 1) => string;
}

const Ctx = createContext<SessionApi | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [s, setS] = useState<Session>(fresh);
  const api = useMemo<SessionApi>(
    () => ({
      s,
      update: patch => setS(prev => ({ ...prev, ...(typeof patch === "function" ? patch(prev) : patch) })),
      go: (screen, patch) => setS(prev => ({ ...prev, ...patch, screen })),
      erase: () => setS(fresh()),
      load: session => setS(session),
      name: who => s.names[who] || (who === 0 ? "Partner A" : "Partner B"),
    }),
    [s],
  );
  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}

export function useSession(): SessionApi {
  const api = useContext(Ctx);
  if (!api) throw new Error("useSession must be used inside SessionProvider");
  return api;
}

export const startConversation = (): Partial<Session> => ({
  firstCheck: null,
  turns: [],
  speaker: 0,
  intervention: initialInterventionState,
  summary: null,
  picks: {},
  custom: [],
});

export function exampleSession(): Session {
  return {
    ...fresh(),
    screen: "conversation",
    names: ["Alex", "Sam"],
    topic: "Weekends with Sam's family",
    turns: [
      { who: 0, flagged: false, text: "I feel like every other weekend is planned around your parents. I barely get time to rest, and when I bring it up it turns into a whole thing." },
      { who: 1, flagged: false, text: "My parents are getting older and they live close. I want them to see us. I didn't realize it felt like that much to you." },
      { who: 0, flagged: false, text: "It's not that I don't like them. I just work long weeks, and Saturday is the only day I can actually switch off." },
      { who: 1, flagged: false, text: "And I feel guilty when we skip, because my mom always asks. I end up stuck in the middle." },
    ],
  };
}
