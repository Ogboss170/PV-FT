import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";

import { auth } from "@/src/firebase";
import { colors, font, spacing } from "@/src/theme";

// Voice wave bars — animated heights
function VoiceBar({ delay, minH, maxH }: { delay: number; minH: number; maxH: number }) {
  const h = useSharedValue(minH);
  useEffect(() => {
    h.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(maxH, { duration: 700, easing: Easing.inOut(Easing.quad) }),
          withTiming(minH, { duration: 700, easing: Easing.inOut(Easing.quad) }),
        ),
        -1,
        false,
      ),
    );
  }, [h, delay, minH, maxH]);
  const style = useAnimatedStyle(() => ({ height: h.value }));
  return (
    <Animated.View style={[styles.bar, style]}>
      <LinearGradient
        colors={["#8B5CF6", "#06B6D4"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />
    </Animated.View>
  );
}

export default function Splash() {
  const router = useRouter();
  const scale = useSharedValue(0.7);
  const opacity = useSharedValue(0);
  const glow = useSharedValue(0.4);
  const textOpacity = useSharedValue(0);
  const dot1 = useSharedValue(0.3);
  const dot2 = useSharedValue(0.3);
  const dot3 = useSharedValue(0.3);

  useEffect(() => {
    scale.value = withTiming(1, { duration: 700, easing: Easing.out(Easing.exp) });
    opacity.value = withTiming(1, { duration: 700 });
    textOpacity.value = withDelay(400, withTiming(1, { duration: 600 }));
    glow.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1200, easing: Easing.inOut(Easing.quad) }),
        withTiming(0.4, { duration: 1200, easing: Easing.inOut(Easing.quad) }),
      ),
      -1,
      false,
    );
    // Loading dots
    const dotAnim = (v: any, d: number) => {
      v.value = withDelay(
        d,
        withRepeat(
          withSequence(
            withTiming(1, { duration: 500 }),
            withTiming(0.3, { duration: 500 }),
          ),
          -1,
          false,
        ),
      );
    };
    dotAnim(dot1, 0);
    dotAnim(dot2, 200);
    dotAnim(dot3, 400);

    const t = setTimeout(() => {
      if (auth?.currentUser) {
        router.replace("/(tabs)");
      } else {
        router.replace("/auth/login");
      }
    }, 2500);
    return () => clearTimeout(t);
  }, [router, scale, opacity, glow, textOpacity, dot1, dot2, dot3]);

  const logoStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));
  const glowStyle = useAnimatedStyle(() => ({
    opacity: glow.value,
    transform: [{ scale: 1 + glow.value * 0.15 }],
  }));
  const textStyle = useAnimatedStyle(() => ({ opacity: textOpacity.value }));
  const d1 = useAnimatedStyle(() => ({ opacity: dot1.value }));
  const d2 = useAnimatedStyle(() => ({ opacity: dot2.value }));
  const d3 = useAnimatedStyle(() => ({ opacity: dot3.value }));

  return (
    <View style={styles.container} testID="splash-screen">
      <LinearGradient
        colors={["#0F172A", "#0B1220", "#0F172A"]}
        style={StyleSheet.absoluteFillObject}
      />
      {/* Ambient blobs */}
      <View style={[styles.blob, { top: -80, left: -60, backgroundColor: "rgba(6,182,212,0.18)" }]} />
      <View style={[styles.blob, { bottom: -100, right: -80, backgroundColor: "rgba(139,92,246,0.20)" }]} />

      <View style={styles.center}>
        <View style={styles.logoWrap}>
          <Animated.View style={[styles.logoGlow, glowStyle]} />
          <Animated.View style={[styles.logoRing, logoStyle]}>
            <LinearGradient
              colors={["#8B5CF6", "#06B6D4", "#0284C7"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.logoInner}
            >
              <Ionicons name="mic" size={58} color="#FFFFFF" />
            </LinearGradient>
          </Animated.View>
        </View>

        {/* Voice wave */}
        <View style={styles.waveRow}>
          <VoiceBar delay={0} minH={8} maxH={22} />
          <VoiceBar delay={120} minH={12} maxH={36} />
          <VoiceBar delay={240} minH={16} maxH={48} />
          <VoiceBar delay={100} minH={10} maxH={30} />
          <VoiceBar delay={200} minH={14} maxH={42} />
          <VoiceBar delay={40} minH={8} maxH={20} />
          <VoiceBar delay={160} minH={12} maxH={34} />
        </View>

        <Animated.View style={[textStyle, { alignItems: "center", marginTop: spacing.xl }]}>
          <Text style={styles.brand}>Private Voices</Text>
          <Text style={styles.tagline}>Your voice. Your thoughts. Your privacy.</Text>
        </Animated.View>
      </View>

      {/* Loading dots */}
      <View style={styles.footer}>
        <View style={styles.dotsRow}>
          <Animated.View style={[styles.dot, d1]} />
          <Animated.View style={[styles.dot, d2]} />
          <Animated.View style={[styles.dot, d3]} />
        </View>
        <Text style={styles.footerText}>Securing your session</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  blob: {
    position: "absolute",
    width: 260,
    height: 260,
    borderRadius: 260,
  },
  logoWrap: { width: 140, height: 140, alignItems: "center", justifyContent: "center" },
  logoGlow: {
    position: "absolute",
    width: 200,
    height: 200,
    borderRadius: 200,
    backgroundColor: "rgba(139,92,246,0.45)",
  },
  logoRing: {
    width: 130,
    height: 130,
    borderRadius: 130,
    padding: 3,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
  },
  logoInner: {
    flex: 1,
    borderRadius: 130,
    alignItems: "center",
    justifyContent: "center",
  },
  waveRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: spacing.xxl,
    gap: 6,
    height: 50,
  },
  bar: {
    width: 4,
    borderRadius: 2,
    overflow: "hidden",
    backgroundColor: colors.brand,
  },
  brand: { ...font.h1, fontSize: 34, letterSpacing: -0.8 },
  tagline: {
    ...font.body,
    color: colors.onSurfaceMuted,
    marginTop: 8,
    fontSize: 13,
    letterSpacing: 0.2,
  },
  footer: {
    position: "absolute",
    bottom: 60,
    alignSelf: "center",
    alignItems: "center",
  },
  dotsRow: { flexDirection: "row", gap: 6, marginBottom: 10 },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.brand,
  },
  footerText: {
    ...font.small,
    letterSpacing: 1.5,
    textTransform: "uppercase",
    fontSize: 10,
    fontWeight: "700",
    color: colors.onSurfaceDim,
  },
});
