import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { LogBox } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { useIconFonts } from "@/src/hooks/use-icon-fonts";
import { DesktopShell } from "@/src/components/DesktopShell";

// Disable logbox errors etc so that users can see the app
// and agent works as expected.
LogBox.ignoreAllLogs(true);

// Keep the native splash visible from cold start until icon fonts register.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useIconFonts();

  useEffect(() => {
    SplashScreen.hideAsync().catch(() => {});
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: "#0F172A" }}>
      <SafeAreaProvider style={{ flex: 1, backgroundColor: "#0F172A" }}>
        <StatusBar style="light" />
        <DesktopShell>
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: "#0F172A" },
              animation: "fade",
            }}
          />
        </DesktopShell>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
