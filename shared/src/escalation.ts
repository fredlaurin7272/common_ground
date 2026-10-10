// Escalation signals from words (v1, text only). Ported from heat() in
// prototype/common-ground.html. Later versions add audio (v2) and meaning (v3).

export const HEAT_THRESHOLD = 3;
export const MAX_INTERVENTIONS = 2;
/** The app stays quiet for at least this many turns after stepping in. */
export const MIN_TURNS_BETWEEN_INTERVENTIONS = 2;

const ABSOLUTES = /\b(always|never|every time|nothing|everything)\b/gi;
const INSULTS = /\b(stupid|idiot|ridiculous|pathetic|shut up|useless|crazy|selfish|lazy|hate|whatever)\b/i;
const SARCASM = /\b(yeah right|oh great|typical|of course you)\b/i;

/** Scores one turn. 0 is calm; HEAT_THRESHOLD or more counts as heated. */
export function heat(text: string): number {
  let score = 0;
  const words = text.match(/[A-Za-z']+/g) ?? [];
  const shouted = words.filter(w => w.length > 2 && w === w.toUpperCase()).length;
  if (words.length > 3 && shouted / words.length > 0.3) score += 2;
  if (/!{2,}/.test(text)) score += 1;
  score += Math.min((text.match(ABSOLUTES) ?? []).length, 2);
  if (INSULTS.test(text)) score += 2;
  if (SARCASM.test(text)) score += 1;
  return score;
}

export interface InterventionState {
  /** How many times the app has stepped in this session. */
  interventions: number;
  /** Turn count at the last intervention, or null if none yet. */
  lastInterventionTurn: number | null;
}

export const initialInterventionState: InterventionState = { interventions: 0, lastInterventionTurn: null };

/**
 * Decides whether to step in after a turn is added.
 * `turnCount` is the number of turns including the one just added.
 */
export function shouldIntervene(score: number, turnCount: number, state: InterventionState): boolean {
  if (score < HEAT_THRESHOLD) return false;
  if (state.interventions >= MAX_INTERVENTIONS) return false;
  if (state.lastInterventionTurn !== null && turnCount - state.lastInterventionTurn <= MIN_TURNS_BETWEEN_INTERVENTIONS) return false;
  return true;
}

export function recordIntervention(turnCount: number, state: InterventionState): InterventionState {
  return { interventions: state.interventions + 1, lastInterventionTurn: turnCount };
}
