// Taking turns. Typed for now; Milestone 2 replaces typing with listening.
import { useEffect, useRef, useState } from "react";
import { StyleSheet, Text, View, type ScrollView } from "react-native";
import { heat, recordIntervention, shouldIntervene } from "@common-ground/shared";
import { useSession, type Turn } from "../session";
import { fonts, partnerColor, useColors } from "../theme";
import { Body, Button, Eyebrow, H2, Name, Panel, Row, Screen, Stack } from "../ui";
import { Field } from "./Start";
import { PauseOverlay } from "./Pause";

const TURN_SECONDS = 120;

const clock = (secs: number) => `${secs < 0 ? "+" : ""}${Math.floor(Math.abs(secs) / 60)}:${String(Math.abs(secs) % 60).padStart(2, "0")}`;

/** Soft turn timer: counts down from 2:00, then gently counts the overrun. */
function TurnTimer({ turnKey, running }: { turnKey: number; running: boolean }) {
  const c = useColors();
  const [left, setLeft] = useState(TURN_SECONDS);
  useEffect(() => setLeft(TURN_SECONDS), [turnKey]);
  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setLeft(l => l - 1), 1000);
    return () => clearInterval(id);
  }, [running, turnKey]);
  return (
    <Text accessibilityLabel={left < 0 ? "Over time for this turn" : "Time left in this turn"} style={[styles.timer, { color: left < 0 ? c.warn : c.ink }]}>
      {clock(left)}
    </Text>
  );
}

function TurnView({ turn }: { turn: Turn }) {
  const c = useColors();
  const { name } = useSession();
  return (
    <View style={[styles.turn, { borderColor: partnerColor(c, turn.who) }, turn.flagged && { backgroundColor: c.warnSoft }]}>
      <Text style={[styles.who, { color: partnerColor(c, turn.who) }]}>{name(turn.who)}</Text>
      <Body>{turn.text}</Body>
    </View>
  );
}

export function Conversation() {
  const { s, update, go, name } = useSession();
  const [text, setText] = useState("");
  const [pause, setPause] = useState<null | "app" | "user">(null);
  const scroll = useRef<ScrollView>(null);
  const i = s.speaker;
  const other = i === 0 ? 1 : 0;

  const done = () => {
    const said = text.trim();
    if (!said) return;
    const count = s.turns.length + 1;
    const intervene = shouldIntervene(heat(said), count, s.intervention);
    update({
      turns: [...s.turns, { who: i, text: said, flagged: intervene }],
      speaker: other,
      intervention: intervene ? recordIntervention(count, s.intervention) : s.intervention,
    });
    setText("");
    if (intervene) setPause("app");
    setTimeout(() => scroll.current?.scrollTo({ y: 0, animated: true }), 50);
  };

  return (
    <>
      <Screen scrollRef={scroll}>
        <View style={styles.header}>
          <Stack gap={2} style={{ flexShrink: 1 }}>
            <Eyebrow>{s.topic || "Your conversation"}</Eyebrow>
            <H2>
              <Name who={i}>{name(i)}</Name> is talking
            </H2>
          </Stack>
          <TurnTimer turnKey={s.turns.length} running={pause === null} />
        </View>
        <Panel>
          <Field label="What you're saying" value={text} onChangeText={setText} placeholder={`${name(i)}, say what's on your mind…`} multiline />
          <Body muted small>🎙️ Tap the microphone on your keyboard to speak instead of typing. A later version will listen on its own.</Body>
          <Button kind="primary" disabled={!text.trim()} onPress={done}>
            Done, {name(other)}'s turn
          </Button>
        </Panel>
        <Row>
          <Button onPress={() => setPause("user")} style={{ flexGrow: 1 }}>
            ⏸ Pause
          </Button>
          <Button disabled={s.turns.length < 2} onPress={() => go("summary")} style={{ flexGrow: 1 }}>
            We're done talking
          </Button>
        </Row>
        {s.turns.length ? (
          <Stack gap={10}>
            <Eyebrow>So far</Eyebrow>
            {[...s.turns].reverse().map((t, k) => (
              <TurnView key={s.turns.length - k} turn={t} />
            ))}
          </Stack>
        ) : (
          <Body muted small>
            {name(0)} starts. Take turns: one person talks, the other just listens.
          </Body>
        )}
      </Screen>
      {pause && <PauseOverlay fromApp={pause === "app"} onClose={() => setPause(null)} />}
    </>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between", gap: 10 },
  timer: { fontFamily: fonts.bold, fontSize: 18, fontVariant: ["tabular-nums"] },
  turn: { borderLeftWidth: 3, paddingVertical: 4, paddingLeft: 12, borderTopRightRadius: 8, borderBottomRightRadius: 8 },
  who: { fontFamily: fonts.bold, fontSize: 13 },
});

