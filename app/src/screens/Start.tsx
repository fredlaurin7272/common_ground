// Welcome, the private check-ins, and what happens after them.
import { useState } from "react";
import { StyleSheet, TextInput, View } from "react-native";
import { checkInOutcome, FEELINGS, SAFE_OPTIONS, type CheckIn, type Feeling, type SafeAnswer } from "@common-ground/shared";
import { DEMO } from "../demo";
import { exampleSession, startConversation, useSession } from "../session";
import { fonts, useColors } from "../theme";
import { Body, Button, Dot, Eyebrow, H1, H2, Label, Name, Panel, PrivacyNote, Row, Screen, Stack } from "../ui";

export function Field({ label, value, onChangeText, placeholder, multiline, inRow }: {
  label: React.ReactNode;
  value: string;
  onChangeText: (v: string) => void;
  placeholder: string;
  multiline?: boolean;
  /** Share a row with other fields. */
  inRow?: boolean;
}) {
  const c = useColors();
  return (
    <Stack gap={8} style={inRow ? { flexGrow: 1, flexBasis: 140 } : undefined}>
      <Label>{label}</Label>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={c.muted}
        autoComplete="off"
        autoCorrect={!!multiline}
        multiline={multiline}
        style={[styles.input, multiline && styles.multiline, { color: c.ink, backgroundColor: c.bg, borderColor: c.line }]}
      />
    </Stack>
  );
}

export function Welcome() {
  const { s, go, load } = useSession();
  const [a, setA] = useState(s.names[0]);
  const [b, setB] = useState(s.names[1]);
  const [topic, setTopic] = useState(s.topic);
  const ready = a.trim() && b.trim();

  return (
    <Screen>
      <Stack>
        <Eyebrow>{DEMO ? "Preview" : "Early version"} · for couples</Eyebrow>
        <H1>Common Ground</H1>
        <Body muted>
          Talk it through, one at a time. The app stays quiet, steps in only if things heat up, and helps you find what you agree on at the end.
        </Body>
      </Stack>
      <Panel>
        <Row>
          <Field label={<><Dot who={0} /> First person</>} value={a} onChangeText={setA} placeholder="e.g. Alex" inRow />
          <Field label={<><Dot who={1} /> Second person</>} value={b} onChangeText={setB} placeholder="e.g. Sam" inRow />
        </Row>
        <Field label={<>What's it about? <Body muted small>(optional)</Body></>} value={topic} onChangeText={setTopic} placeholder="e.g. How we split weekends" />
        <Button kind="primary" disabled={!ready} onPress={() => go("handoff", { names: [a.trim(), b.trim()], topic: topic.trim(), checkIdx: 0, firstCheck: null })}>
          Start a conversation
        </Button>
      </Panel>
      <Button onPress={() => load(exampleSession())}>Try it with an example couple</Button>
      <PrivacyNote>Nothing is saved. Closing the app erases the conversation. This app is not therapy and is not a substitute for professional help.</PrivacyNote>
    </Screen>
  );
}

export function Handoff() {
  const { s, go, name } = useSession();
  const i = s.checkIdx;
  const other = i === 0 ? 1 : 0;
  return (
    <Screen>
      <Stack>
        <Eyebrow>Private check-in {i + 1} of 2</Eyebrow>
        <H2>
          Hand the phone to <Name who={i}>{name(i)}</Name>.
        </H2>
        <Body muted>{name(other)}, please look away for a moment. Answers here are private and are never shown to the other person.</Body>
      </Stack>
      <Button kind="primary" onPress={() => go("checkin")}>
        I'm {name(i)}, continue
      </Button>
    </Screen>
  );
}

export function CheckInScreen() {
  const { s, go, update, name } = useSession();
  const i = s.checkIdx;
  const [feeling, setFeeling] = useState<Feeling | null>(null);
  const [safe, setSafe] = useState<SafeAnswer | null>(null);

  const done = () => {
    if (!feeling || !safe) return;
    const mine: CheckIn = { feeling, safe };
    if (i === 0) {
      update({ firstCheck: mine, checkIdx: 1 });
      go("handoff");
      return;
    }
    const outcome = checkInOutcome([s.firstCheck!, mine]);
    // The answers are no longer needed: forget them before moving on.
    if (outcome === "stop") go("stop", { firstCheck: null });
    // One neutral message for both "pause" reasons: with two people, naming the
    // reason would tell each partner what the other answered.
    else if (outcome === "pause") go("unsure", { firstCheck: null });
    else go("conversation", startConversation());
  };

  return (
    <Screen>
      <Stack>
        <Eyebrow>Private · {name(i)}</Eyebrow>
        <H2>Before you start</H2>
      </Stack>
      <Panel>
        <Label>How are you feeling right now?</Label>
        <View style={styles.grid}>
          {FEELINGS.map((label, k) => (
            <Button key={label} compact selected={feeling === k + 1} onPress={() => setFeeling((k + 1) as Feeling)} style={styles.cell}>
              {label}
            </Button>
          ))}
        </View>
      </Panel>
      <Panel>
        <Label>Do you feel safe having this conversation together?</Label>
        <View style={styles.grid}>
          {SAFE_OPTIONS.map(([value, label]) => (
            <Button key={value} compact selected={safe === value} onPress={() => setSafe(value)} style={styles.cell}>
              {label}
            </Button>
          ))}
        </View>
        <Body muted small>If you answer No, the session ends without saying who answered.</Body>
      </Panel>
      <Button kind="primary" disabled={!feeling || !safe} onPress={done}>
        Done
      </Button>
    </Screen>
  );
}

export function Unsure() {
  const { go, erase } = useSession();
  return (
    <Screen>
      <Stack>
        <Eyebrow>Before you begin</Eyebrow>
        <H2>This might not be the best moment</H2>
        <Body muted>
          Hard conversations go better once your bodies have calmed down. Waiting 20 minutes or picking another time is a good choice, not a failure.
        </Body>
      </Stack>
      <Button kind="primary" onPress={erase}>
        Not now, try later
      </Button>
      <Button onPress={() => go("conversation", startConversation())}>Continue carefully</Button>
    </Screen>
  );
}

export function Stop() {
  const { erase } = useSession();
  return (
    <Screen>
      <Stack>
        <Eyebrow>Session ended</Eyebrow>
        <H2>Let's not continue together today</H2>
        <Body>
          This tool is only for conversations where both people feel safe. Talking with a counselor, a trusted person, or a local support line can help more than an app here.
        </Body>
        <Body muted small>Nothing from this session was saved.</Body>
      </Stack>
      <Button onPress={erase}>Back to start</Button>
    </Screen>
  );
}

const styles = StyleSheet.create({
  input: { fontFamily: fonts.body, fontSize: 16, borderWidth: 1, borderRadius: 10, padding: 12 },
  multiline: { minHeight: 120, textAlignVertical: "top" },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  cell: { flexGrow: 1, flexBasis: 90 },
});
