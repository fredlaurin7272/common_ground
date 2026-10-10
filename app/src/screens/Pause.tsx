// Shown when either partner taps Pause, or when the app steps in because things
// are heating up. Never says who escalated.
import { useEffect, useRef, useState } from "react";
import { AccessibilityInfo, Animated, Easing, Modal, StyleSheet, View } from "react-native";
import { useColors } from "../theme";
import { Body, Button, H2, Stack } from "../ui";

const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

function BreathingCircle() {
  const c = useColors();
  const scale = useRef(new Animated.Value(0.6)).current;
  useEffect(() => {
    let loop: Animated.CompositeAnimation | undefined;
    AccessibilityInfo.isReduceMotionEnabled().then(reduce => {
      if (reduce) return;
      const step = (toValue: number) => Animated.timing(scale, { toValue, duration: 4000, easing: Easing.inOut(Easing.ease), useNativeDriver: true });
      loop = Animated.loop(Animated.sequence([step(1), step(0.6)]));
      loop.start();
    });
    return () => loop?.stop();
  }, [scale]);
  return (
    <View style={styles.circleBox} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <Animated.View style={[styles.circle, { backgroundColor: c.soft, borderColor: c.accent, transform: [{ scale }] }]} />
    </View>
  );
}

function Countdown({ seconds, title, sub, onClose }: { seconds: number; title: string; sub: string; onClose: () => void }) {
  const [left, setLeft] = useState(seconds);
  useEffect(() => {
    const id = setInterval(() => setLeft(l => Math.max(l - 1, 0)), 1000);
    return () => clearInterval(id);
  }, []);
  return (
    <>
      <H2 center>{title}</H2>
      <BreathingCircle />
      <Body muted style={{ textAlign: "center" }}>{sub}</Body>
      <Body style={{ textAlign: "center", fontVariant: ["tabular-nums"] }}>{left > 0 ? fmt(left) : "Ready when you are"}</Body>
      <Button kind="primary" onPress={onClose}>
        Resume the conversation
      </Button>
    </>
  );
}

export function PauseOverlay({ fromApp, onClose }: { fromApp: boolean; onClose: () => void }) {
  const c = useColors();
  const [mode, setMode] = useState<"main" | "breathe" | "break">("main");
  return (
    <Modal transparent animationType="fade" onRequestClose={onClose}>
      <View style={[styles.backdrop, { backgroundColor: c.bg + "F2" }]}>
        <Stack gap={16} style={[styles.card, { backgroundColor: c.surface, borderColor: c.line }]}>
          {mode === "main" && (
            <>
              <H2 center>{fromApp ? "Let's slow down for a moment" : "Paused"}</H2>
              <Body muted style={{ textAlign: "center" }}>
                {fromApp
                  ? "It sounds like things are getting heated. That's normal in a hard conversation. A short pause usually helps you both be heard."
                  : "Take whatever time you need. Nothing is lost while you're paused."}
              </Body>
              <Button kind="primary" onPress={() => setMode("breathe")}>
                Breathe together for 1 minute
              </Button>
              <Button onPress={() => setMode("break")}>Take a 20-minute break</Button>
              <Button kind="ghost" onPress={onClose}>
                {fromApp ? "Keep going" : "Resume"}
              </Button>
            </>
          )}
          {mode === "breathe" && <Countdown seconds={60} title="Breathe in as the circle grows" sub="Out as it shrinks. Both of you, together." onClose={onClose} />}
          {mode === "break" && (
            <Countdown
              seconds={1200}
              title="Taking a break"
              sub="Step away, get some water, do something calming. Come back when the timer ends, or sooner if you're both ready."
              onClose={onClose}
            />
          )}
        </Stack>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, alignItems: "center", justifyContent: "center", padding: 16 },
  card: { width: "100%", maxWidth: 420, borderWidth: 1, borderRadius: 20, paddingVertical: 24, paddingHorizontal: 20, alignItems: "stretch" },
  circleBox: { alignItems: "center", paddingVertical: 4 },
  circle: { width: 120, height: 120, borderRadius: 60, borderWidth: 2 },
});
