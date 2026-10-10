// Each partner picks what they're willing to try. Only shared picks become the agreement.
import { useState } from "react";
import { Share, StyleSheet, View } from "react-native";
import * as Clipboard from "expo-clipboard";
import { agreedOptions, agreementText, checkInDate } from "@common-ground/shared";
import { useSession } from "../session";
import { fonts, useColors } from "../theme";
import { Body, Button, Dot, Eyebrow, H2, Panel, Row, Screen, Stack, Strong } from "../ui";
import { Field } from "./Start";

export function Agreement() {
  const { s, update, go, erase, name } = useSession();
  const c = useColors();
  const [own, setOwn] = useState("");
  const [copied, setCopied] = useState(false);
  if (!s.summary || s.summary.safety_concern) return null;

  const options = [...s.summary.options, ...s.custom];
  const toggle = (k: number, who: 0 | 1) => {
    const current = s.picks[k] ?? [false, false];
    const next: [boolean, boolean] = who === 0 ? [!current[0], current[1]] : [current[0], !current[1]];
    update({ picks: { ...s.picks, [k]: next } });
    setCopied(false);
  };
  const add = () => {
    const title = own.trim();
    if (!title) return;
    update({ custom: [...s.custom, { title, detail: "" }] });
    setOwn("");
  };

  const agreed = agreedOptions(options, s.picks);
  const check = checkInDate(new Date()).toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" });
  const text = agreementText([name(0), name(1)], s.topic, agreed, check);

  return (
    <Screen>
      <Stack>
        <Eyebrow>Next steps</Eyebrow>
        <H2>Pick what you'll both try</H2>
        <Body muted>Each of you taps the ideas you're willing to try. Only ideas you both pick go into the agreement.</Body>
      </Stack>

      <Panel>
        {options.map((o, k) => {
          const pick = s.picks[k] ?? [false, false];
          return (
            <Stack key={k} gap={8} style={k > 0 ? [styles.opt, { borderTopColor: c.line }] : undefined}>
              <Strong style={{ color: c.ink, fontSize: 16 }}>{o.title}</Strong>
              {o.detail ? <Body muted small>{o.detail}</Body> : null}
              <Row gap={8}>
                {([0, 1] as const).map(who => (
                  <Button key={who} compact selected={pick[who]} onPress={() => toggle(k, who)} style={styles.pick} accessibilityLabel={`${name(who)} would try this`}>
                    <Dot who={who} /> {name(who)}
                    {pick[who] ? " ✓" : ""}
                  </Button>
                ))}
              </Row>
              {pick[0] && pick[1] ? <Body style={[styles.agreed, { color: c.accent }]}>You both agreed</Body> : null}
            </Stack>
          );
        })}
      </Panel>

      <View style={styles.addRow}>
        <Field label="Your own idea" value={own} onChangeText={setOwn} placeholder="Add your own idea…" inRow />
        <Button onPress={add} disabled={!own.trim()} style={{ alignSelf: "flex-end" }}>
          Add
        </Button>
      </View>

      {agreed.length ? (
        <Panel style={{ borderColor: c.accent }}>
          <Eyebrow>Your agreement</Eyebrow>
          <Body selectable>{text}</Body>
          <Body muted small>A later version will remind you both on the check-in date and ask how it's going.</Body>
          <Button
            kind="primary"
            onPress={async () => {
              await Clipboard.setStringAsync(text);
              setCopied(true);
            }}
          >
            {copied ? "Copied" : "Copy our agreement"}
          </Button>
          <Button onPress={() => Share.share({ message: text }).catch(() => {})}>Share</Button>
        </Panel>
      ) : (
        <Body muted small>Nothing agreed yet. One shared step is enough to start.</Body>
      )}

      <Button kind="ghost" onPress={() => go("summary")}>
        Back to the summary
      </Button>
      <Button onPress={erase}>Finish and erase everything</Button>
    </Screen>
  );
}

const styles = StyleSheet.create({
  opt: { borderTopWidth: 1, paddingTop: 12 },
  pick: { paddingHorizontal: 14 },
  agreed: { fontFamily: fonts.bold, fontSize: 14 },
  addRow: { flexDirection: "row", gap: 10 },
});
