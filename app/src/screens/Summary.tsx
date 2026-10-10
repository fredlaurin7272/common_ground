// After the conversation: what each person said, what they share, and ideas to try.
import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { fetchSummary, SummaryFetchError, type SummaryFailure } from "../api";
import { DEMO } from "../demo";
import { useSession } from "../session";
import { fonts, partnerColor, useColors } from "../theme";
import { Body, Button, Eyebrow, H2, Note, Panel, Screen, Stack, Strong } from "../ui";

const MESSAGES: Record<SummaryFailure, string> = {
  cancelled: "Stopped.",
  offline: "Couldn't reach the summary service. Check your connection, then try again.",
  busy: "Too many requests right now. Wait a minute, then try again.",
  unavailable: "The summary service isn't available right now. Please try again in a little while.",
  invalid: "The summary came back in an unexpected form. Trying again usually helps.",
};

function Bullets({ items }: { items: string[] }) {
  return (
    <Stack gap={4}>
      {items.map((x, k) => (
        <Body key={k}>• {x}</Body>
      ))}
    </Stack>
  );
}

function PersonCard({ who, view, needs }: { who: 0 | 1; view: string; needs: string[] }) {
  const c = useColors();
  const { name } = useSession();
  return (
    <Panel style={{ borderLeftWidth: 4, borderLeftColor: partnerColor(c, who) }}>
      <Text style={[styles.h3, { color: partnerColor(c, who) }]}>{name(who)}</Text>
      <Body>{view}</Body>
      {needs.length > 0 && (
        <Stack gap={4}>
          <Eyebrow>What matters underneath</Eyebrow>
          <Bullets items={needs} />
        </Stack>
      )}
    </Panel>
  );
}

export function SummaryScreen() {
  const { s, update, go, erase } = useSession();
  const c = useColors();
  const [error, setError] = useState<SummaryFailure | null>(null);
  const [attempt, setAttempt] = useState(0);
  const ctl = useRef<AbortController | null>(null);

  useEffect(() => {
    if (s.summary) return;
    setError(null);
    const controller = new AbortController();
    ctl.current = controller;
    fetchSummary({ names: s.names, topic: s.topic, turns: s.turns.map(({ who, text }) => ({ who, text })) }, controller.signal)
      .then(summary => update({ summary, picks: {}, custom: [] }))
      .catch(e => setError(e instanceof SummaryFetchError ? e.reason : "unavailable"));
    return () => controller.abort();
    // Re-run only when the person asks to try again.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attempt]);

  const d = s.summary;
  return (
    <Screen>
      <Stack>
        <Eyebrow>After the conversation</Eyebrow>
        <H2>What each of you was saying</H2>
      </Stack>

      {!d && !error && (
        <Panel>
          <View style={styles.thinking}>
            <ActivityIndicator />
            <Body>Listening back to your conversation…</Body>
          </View>
          <Body muted small>This usually takes under a minute.</Body>
          <Button kind="ghost" onPress={() => ctl.current?.abort()}>
            Stop
          </Button>
        </Panel>
      )}

      {!d && error && (
        <>
          <Note>{MESSAGES[error]}</Note>
          <Button kind="primary" onPress={() => setAttempt(n => n + 1)}>
            Try again
          </Button>
          <Button onPress={() => go("conversation")}>Back to the conversation</Button>
        </>
      )}

      {d?.safety_concern && (
        <Panel>
          <Text style={[styles.h3, { color: c.ink }]}>This one needs more than an app</Text>
          <Body>{d.safety_note}</Body>
          <Body muted small>A counselor, a trusted person, or a local support line can help. If anyone is in danger right now, contact local emergency services.</Body>
          <Button onPress={erase}>End and erase</Button>
        </Panel>
      )}

      {d && !d.safety_concern && (
        <>
          {DEMO && <Note>Preview: this is a sample summary, not based on what you typed. The real app writes it from your conversation.</Note>}
          <PersonCard who={0} {...d.a} />
          <PersonCard who={1} {...d.b} />
          <Panel>
            <Eyebrow>Where you already agree</Eyebrow>
            <Bullets items={d.common_ground} />
            {d.core_difference ? (
              <Body muted>
                <Strong>Where you differ: </Strong>
                {d.core_difference}
              </Body>
            ) : null}
          </Panel>
          {d.reflection ? <Text style={[styles.reflection, { color: c.ink }]}>{d.reflection}</Text> : null}
          <Button kind="primary" onPress={() => go("agreement")}>
            Choose what to try
          </Button>
          <Button kind="ghost" onPress={() => go("conversation", { summary: null })}>
            Keep talking first
          </Button>
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  h3: { fontFamily: fonts.bold, fontSize: 17 },
  thinking: { flexDirection: "row", alignItems: "center", gap: 12 },
  reflection: { fontFamily: fonts.display, fontSize: 19, lineHeight: 26 },
});
