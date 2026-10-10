// Colors and type, matching the prototype. One calm column, light and dark.
import { useColorScheme } from "react-native";

const light = {
  bg: "#EEF2F4",
  surface: "#FFFFFF",
  ink: "#18242C",
  muted: "#5B6B75",
  line: "#D5DEE3",
  accent: "#1D6B6A",
  accentInk: "#FFFFFF",
  soft: "#DCEBEA",
  a: "#2F64B0",
  b: "#9A4E8C",
  warn: "#9A5A0C",
  warnSoft: "#F7E9D4",
};

const dark: typeof light = {
  bg: "#0F171C",
  surface: "#17222A",
  ink: "#E6EDF0",
  muted: "#93A4AE",
  line: "#26343D",
  accent: "#5CC2BC",
  accentInk: "#0B1A1A",
  soft: "#1C3434",
  a: "#86AEEB",
  b: "#D99BCE",
  warn: "#E8AC5E",
  warnSoft: "#33281A",
};

export type Colors = typeof light;

export const fonts = {
  display: "YoungSerif_400Regular",
  body: "Figtree_400Regular",
  medium: "Figtree_500Medium",
  semibold: "Figtree_600SemiBold",
  bold: "Figtree_700Bold",
};

export function useColors(): Colors {
  return useColorScheme() === "dark" ? dark : light;
}

/** Color for the first (0) or second (1) partner. */
export const partnerColor = (c: Colors, who: 0 | 1) => (who === 0 ? c.a : c.b);
