// Preview builds (EXPO_PUBLIC_DEMO=1) run without the server, so the summary
// is a fixed sample that uses the couple's names. The screen says it's a sample.
import type { Summary, SummaryRequest } from "@common-ground/shared";

export const DEMO = process.env.EXPO_PUBLIC_DEMO === "1";

export function demoSummary(req: SummaryRequest): Summary {
  const [a, b] = req.names;
  return {
    safety_concern: false,
    a: {
      view: `${a} wants their effort to be noticed. When plans change without warning, it feels like their needs come second.`,
      needs: ["to feel considered", "some predictability"],
    },
    b: {
      view: `${b} feels pulled in several directions at once. They want ${a} to understand that the pressure isn't personal.`,
      needs: ["understanding", "room to breathe"],
    },
    common_ground: ["You both want this to feel fair", "You both care about the time you spend together"],
    core_difference: "How much planning ahead you each need to feel settled.",
    options: [
      { title: "A short weekly check-in", detail: "Spend ten minutes on Sunday looking at the week ahead together." },
      { title: "Give a heads-up on changes", detail: "Send a quick message as soon as a plan might shift." },
      { title: "One protected evening", detail: "Keep one evening a week free of other commitments." },
    ],
    reflection: "Sitting down to talk this through is already a step toward each other.",
  };
}
