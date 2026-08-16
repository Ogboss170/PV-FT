import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import {
  Dimensions,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { colors, font, radii, spacing } from "@/src/theme";

const { width } = Dimensions.get("window");

type Slide = {
  icon: string;
  gradient: readonly [string, string, string];
  title: string;
  subtitle: string;
};

const SLIDES: Slide[] = [
  {
    icon: "eye-off",
    gradient: ["#06B6D4", "#0284C7", "#0F172A"],
    title: "Share your thoughts without revealing your identity.",
    subtitle: "Every post is anonymous by default. No profiles to worry about. Just words that matter.",
  },
  {
    icon: "people-circle",
    gradient: ["#8B5CF6", "#EC4899", "#0F172A"],
    title: "Join communities that matter to you.",
    subtitle: "From mental health to tech to gaming — find your people, unfiltered.",
  },
  {
    icon: "shield-checkmark",
    gradient: ["#10B981", "#06B6D4", "#0F172A"],
    title: "Chat anonymously while staying safe.",
    subtitle: "Kind by design. Zero identity leaks. You control everything you share.",
  },
];

export default function Onboarding() {
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const scrollRef = useRef<ScrollView>(null);

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const i = Math.round(e.nativeEvent.contentOffset.x / width);
    if (i !== index) setIndex(i);
  };

  const next = () => {
    if (index < SLIDES.length - 1) {
      scrollRef.current?.scrollTo({ x: (index + 1) * width, animated: true });
    } else {
      router.push("/create-profile");
    }
  };

  return (
    <View style={styles.container} testID="onboarding-screen">
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
      >
        {SLIDES.map((s, i) => (
          <View key={i} style={{ width, flex: 1 }}>
            <LinearGradient
              colors={s.gradient}
              start={{ x: 0.5, y: 0 }}
              end={{ x: 0.5, y: 1 }}
              style={StyleSheet.absoluteFillObject}
            />
            <View style={[styles.blob, { top: 80, left: -60 }]} />
            <View style={[styles.blob2, { top: 220, right: -80 }]} />

            <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
              <View style={styles.slideBody}>
                <View style={styles.iconWrap}>
                  <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFillObject} />
                  <View style={styles.iconInner}>
                    <Ionicons name={s.icon as any} size={70} color="#FFFFFF" />
                  </View>
                </View>
              </View>
            </SafeAreaView>
          </View>
        ))}
      </ScrollView>

      {/* Bottom sheet */}
      <View style={styles.sheet}>
        <LinearGradient
          colors={["rgba(15,23,42,0)", "rgba(15,23,42,0.85)", "rgba(15,23,42,1)"]}
          style={styles.sheetGradient}
        />
        <SafeAreaView edges={["bottom"]}>
          <View style={styles.sheetContent}>
            <Text style={styles.title}>{SLIDES[index].title}</Text>
            <Text style={styles.subtitle}>{SLIDES[index].subtitle}</Text>

            <View style={styles.dotsRow}>
              {SLIDES.map((_, i) => (
                <View
                  key={i}
                  style={[styles.dot, i === index && styles.dotActive]}
                />
              ))}
            </View>

            <TouchableOpacity
              activeOpacity={0.85}
              onPress={next}
              style={styles.cta}
              testID="onboarding-next-btn"
            >
              <LinearGradient
                colors={["#06B6D4", "#0284C7"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.ctaBg}
              >
                <Text style={styles.ctaText}>
                  {index === SLIDES.length - 1 ? "Get Started" : "Continue"}
                </Text>
                <Ionicons name="arrow-forward" size={18} color="#0F172A" style={{ marginLeft: 8 }} />
              </LinearGradient>
            </TouchableOpacity>

            <View style={styles.altRow}>
              <TouchableOpacity style={styles.altBtn} testID="continue-google-btn">
                <Ionicons name="logo-google" size={18} color="#F8FAFC" />
                <Text style={styles.altText}>Google</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.altBtn} testID="continue-apple-btn">
                <Ionicons name="logo-apple" size={18} color="#F8FAFC" />
                <Text style={styles.altText}>Apple</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.altBtn} testID="continue-email-btn">
                <Ionicons name="mail" size={18} color="#F8FAFC" />
                <Text style={styles.altText}>Email</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity onPress={() => router.replace("/(tabs)")} testID="onboarding-skip-btn">
              <Text style={styles.skip}>Skip for now</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  blob: {
    position: "absolute",
    width: 200,
    height: 200,
    borderRadius: 200,
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  blob2: {
    position: "absolute",
    width: 260,
    height: 260,
    borderRadius: 260,
    backgroundColor: "rgba(255,255,255,0.04)",
  },
  slideBody: { flex: 1, alignItems: "center", justifyContent: "center", paddingTop: 40 },
  iconWrap: {
    width: 180,
    height: 180,
    borderRadius: 90,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  iconInner: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: "rgba(6,182,212,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  sheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
  sheetGradient: {
    position: "absolute",
    top: -80,
    left: 0,
    right: 0,
    bottom: 0,
    height: 480,
  },
  sheetContent: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.md,
  },
  title: {
    ...font.h2,
    fontSize: 26,
    lineHeight: 34,
    textAlign: "center",
    marginBottom: spacing.md,
  },
  subtitle: {
    ...font.body,
    color: colors.onSurfaceMuted,
    textAlign: "center",
    paddingHorizontal: spacing.md,
  },
  dotsRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: spacing.xl,
    marginBottom: spacing.lg,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(255,255,255,0.2)",
    marginHorizontal: 4,
  },
  dotActive: { width: 22, backgroundColor: colors.brand },
  cta: {
    borderRadius: radii.pill,
    overflow: "hidden",
    marginTop: 4,
  },
  ctaBg: {
    height: 54,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  ctaText: { color: "#0F172A", fontSize: 16, fontWeight: "800", letterSpacing: 0.3 },
  altRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: spacing.md,
    gap: 10,
  },
  altBtn: {
    flex: 1,
    height: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radii.pill,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.glassBorder,
    backgroundColor: "rgba(255,255,255,0.04)",
  },
  altText: { color: colors.onSurface, fontSize: 13, fontWeight: "600", marginLeft: 6 },
  skip: {
    textAlign: "center",
    color: colors.onSurfaceMuted,
    marginTop: spacing.md,
    fontSize: 13,
    fontWeight: "600",
  },
});
