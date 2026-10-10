// Small building blocks shared by every screen.
import type { ReactNode } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View, type StyleProp, type TextStyle, type ViewStyle } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { fonts, partnerColor, useColors } from "./theme";

export function Screen({ children, scrollRef }: { children: ReactNode; scrollRef?: React.Ref<ScrollView> }) {
  const c = useColors();
  const insets = useSafeAreaInsets();
  return (
    <ScrollView
      ref={scrollRef}
      style={{ flex: 1, backgroundColor: c.bg }}
      contentContainerStyle={[styles.screen, { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 40 }]}
      keyboardShouldPersistTaps="handled"
    >
      {children}
    </ScrollView>
  );
}

export function Stack({ children, gap = 12, style }: { children: ReactNode; gap?: number; style?: StyleProp<ViewStyle> }) {
  return <View style={[{ gap }, style]}>{children}</View>;
}

export function Row({ children, gap = 10 }: { children: ReactNode; gap?: number }) {
  return <View style={{ flexDirection: "row", flexWrap: "wrap", gap }}>{children}</View>;
}

export function Eyebrow({ children }: { children: ReactNode }) {
  const c = useColors();
  return <Text style={[styles.eyebrow, { color: c.muted }]}>{children}</Text>;
}

export function H1({ children }: { children: ReactNode }) {
  const c = useColors();
  return (
    <Text accessibilityRole="header" style={[styles.h1, { color: c.ink }]}>
      {children}
    </Text>
  );
}

export function H2({ children, center }: { children: ReactNode; center?: boolean }) {
  const c = useColors();
  return (
    <Text accessibilityRole="header" style={[styles.h2, { color: c.ink }, center && { textAlign: "center" }]}>
      {children}
    </Text>
  );
}

export function Body({ children, muted, small, selectable, style }: { children: ReactNode; muted?: boolean; small?: boolean; selectable?: boolean; style?: StyleProp<TextStyle> }) {
  const c = useColors();
  return <Text selectable={selectable} style={[styles.body, small && styles.small, { color: muted ? c.muted : c.ink }, style]}>{children}</Text>;
}

export function Strong({ children, style }: { children: ReactNode; style?: StyleProp<TextStyle> }) {
  return <Text style={[{ fontFamily: fonts.semibold }, style]}>{children}</Text>;
}

/** A partner's name in their color. */
export function Name({ who, children }: { who: 0 | 1; children: ReactNode }) {
  const c = useColors();
  return <Text style={{ color: partnerColor(c, who) }}>{children}</Text>;
}

/** A small dot in a partner's color. Text, so it can sit inside labels and buttons. */
export function Dot({ who }: { who: 0 | 1 }) {
  const c = useColors();
  return <Text style={{ color: partnerColor(c, who) }}>●</Text>;
}

export function Panel({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  const c = useColors();
  return <View style={[styles.panel, { backgroundColor: c.surface, borderColor: c.line }, style]}>{children}</View>;
}

export function Note({ children }: { children: ReactNode }) {
  const c = useColors();
  return (
    <View style={[styles.note, { backgroundColor: c.warnSoft }]}>
      <Body small>{children}</Body>
    </View>
  );
}

export function Label({ children }: { children: ReactNode }) {
  const c = useColors();
  return <Text style={[styles.label, { color: c.ink }]}>{children}</Text>;
}

type ButtonKind = "primary" | "secondary" | "ghost";

export function Button({
  children,
  onPress,
  kind = "secondary",
  disabled,
  selected,
  compact,
  style,
  accessibilityLabel,
}: {
  children: ReactNode;
  onPress: () => void;
  kind?: ButtonKind;
  disabled?: boolean;
  /** For choice buttons that stay highlighted once picked. */
  selected?: boolean;
  compact?: boolean;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
}) {
  const c = useColors();
  const bg = selected ? c.soft : kind === "primary" ? c.accent : kind === "ghost" ? "transparent" : c.surface;
  const border = selected ? c.accent : kind === "primary" ? c.accent : kind === "ghost" ? "transparent" : c.line;
  const color = selected ? c.ink : kind === "primary" ? c.accentInk : kind === "ghost" ? c.muted : c.ink;
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{ disabled, selected }}
      accessibilityLabel={accessibilityLabel}
      style={({ pressed }) => [
        styles.button,
        compact && styles.compact,
        { backgroundColor: bg, borderColor: border, opacity: disabled ? 0.45 : pressed ? 0.75 : 1 },
        style,
      ]}
    >
      <Text style={[styles.buttonText, compact && styles.small, { color }, kind === "ghost" && styles.ghostText]}>{children}</Text>
    </Pressable>
  );
}

export function PrivacyNote({ children }: { children: ReactNode }) {
  return (
    <View style={{ flexDirection: "row", gap: 8 }}>
      <Text>🔒</Text>
      <Body muted small style={{ flex: 1 }}>
        {children}
      </Body>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { paddingHorizontal: 16, gap: 18, width: "100%", maxWidth: 520, alignSelf: "center" },
  eyebrow: { fontFamily: fonts.semibold, fontSize: 12, letterSpacing: 1.1, textTransform: "uppercase" },
  h1: { fontFamily: fonts.display, fontSize: 34, lineHeight: 39 },
  h2: { fontFamily: fonts.display, fontSize: 25, lineHeight: 29 },
  body: { fontFamily: fonts.body, fontSize: 16, lineHeight: 24 },
  small: { fontSize: 14, lineHeight: 20 },
  label: { fontFamily: fonts.semibold, fontSize: 15 },
  panel: { borderWidth: 1, borderRadius: 14, padding: 16, gap: 12 },
  note: { borderRadius: 10, paddingVertical: 10, paddingHorizontal: 12 },
  button: { borderWidth: 1, borderRadius: 999, paddingVertical: 13, paddingHorizontal: 18, alignItems: "center", justifyContent: "center" },
  compact: { borderRadius: 10, paddingVertical: 10, paddingHorizontal: 6 },
  buttonText: { fontFamily: fonts.semibold, fontSize: 16, textAlign: "center" },
  ghostText: { textDecorationLine: "underline" },
});
