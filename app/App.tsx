import { useEffect } from "react";
import { BackHandler, Platform, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useFonts } from "expo-font";
import { YoungSerif_400Regular } from "@expo-google-fonts/young-serif";
import { Figtree_400Regular, Figtree_500Medium, Figtree_600SemiBold, Figtree_700Bold } from "@expo-google-fonts/figtree";
import { SessionProvider, useSession, type ScreenName } from "./src/session";
import { useColors } from "./src/theme";
import { CheckInScreen, Handoff, Stop, Unsure, Welcome } from "./src/screens/Start";
import { Conversation } from "./src/screens/Conversation";
import { SummaryScreen } from "./src/screens/Summary";
import { Agreement } from "./src/screens/Agreement";

const SCREENS: Record<ScreenName, () => React.ReactNode> = {
  welcome: Welcome,
  handoff: Handoff,
  checkin: CheckInScreen,
  unsure: Unsure,
  stop: Stop,
  conversation: Conversation,
  summary: SummaryScreen,
  agreement: Agreement,
};

function Flow() {
  const { s } = useSession();
  const c = useColors();

  // One screen at a time, with no "back" history: going back could show one
  // partner's private check-in to the other. On Android, the back button does
  // nothing mid-session instead of closing the app by accident.
  useEffect(() => {
    if (Platform.OS !== "android") return;
    const sub = BackHandler.addEventListener("hardwareBackPress", () => s.screen !== "welcome");
    return () => sub.remove();
  }, [s.screen]);

  const Current = SCREENS[s.screen];
  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <Current key={s.screen} />
    </View>
  );
}

export default function App() {
  const [loaded, failed] = useFonts({ YoungSerif_400Regular, Figtree_400Regular, Figtree_500Medium, Figtree_600SemiBold, Figtree_700Bold });
  if (!loaded && !failed) return null;
  return (
    <SafeAreaProvider>
      <StatusBar style="auto" />
      <SessionProvider>
        <Flow />
      </SessionProvider>
    </SafeAreaProvider>
  );
}
