import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { LogBox } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { useIconFonts } from "@/src/hooks/use-icon-fonts";
import { DesktopShell } from "@/src/components/DesktopShell";
import { useAuthState } from "@/src/services/authService";

// Disable logbox errors so users can see the app
LogBox.ignoreAllLogs(true);

// Keep the native splash visible until fonts are ready
SplashScreen.preventAutoHideAsync();

// Routes that don't require authentication
const PUBLIC_SEGMENTS = ["auth", "w"];

export default function RootLayout() {
  const [loaded] = useIconFonts();
  const { user, loading: authLoading } = useAuthState();
  const segments = useSegments();
  const router = useRouter();

  // Hide splash once fonts + auth state are both resolved
  useEffect(() => {
    if (!authLoading) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [authLoading]);

  // Auth guard — runs whenever auth state or route changes
  useEffect(() => {
    if (authLoading) return;

    const inPublicRoute = PUBLIC_SEGMENTS.some((seg) => segments[0] === seg);

    if (!user && !inPublicRoute) {
      // Not signed in → redirect to login
      router.replace("/auth/login");
    } else if (user && inPublicRoute && segments[0] === "auth") {
      // Already signed in → redirect to app
      router.replace("/(tabs)");
    }
  }, [user, authLoading, segments]);

  // Don't render until auth state is resolved (prevents flash)
  if (authLoading) return null;

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
