import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import PostCard from "@/src/components/PostCard";
import { posts } from "@/src/mockData";
import { colors, font, radii, spacing } from "@/src/theme";

const FILTERS = ["For You", "Following", "Trending", "Communities", "Recent"];

export default function Home() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [filter, setFilter] = useState(0);

  return (
    <View style={styles.container} testID="home-screen">
      <LinearGradient
        colors={["#0F172A", "#0B1220"]}
        style={StyleSheet.absoluteFillObject}
      />
      <View style={[styles.blob, { top: -80, right: -60 }]} />

      <SafeAreaView edges={["top"]} style={styles.headerWrap}>
        <View style={styles.headerRow}>
          <View style={styles.logoRow}>
            <LinearGradient
              colors={["#06B6D4", "#0284C7"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.logoBadge}
            >
              <Ionicons name="chatbubble-ellipses" size={16} color="#0F172A" />
            </LinearGradient>
            <Text style={styles.logoText}>Private Voices</Text>
          </View>
          <View style={styles.iconsRow}>
            <TouchableOpacity style={styles.iconBtn} testID="home-notifications-btn" onPress={() => router.push("/notifications")}>
              <Ionicons name="notifications-outline" size={20} color={colors.onSurface} />
              <View style={styles.badge} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Filter chips */}
        <FlatList
          horizontal
          data={FILTERS}
          keyExtractor={(t) => t}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsContainer}
          renderItem={({ item, index }) => {
            const active = index === filter;
            return (
              <TouchableOpacity
                onPress={() => setFilter(index)}
                activeOpacity={0.85}
                style={[styles.chip, active && styles.chipActive]}
                testID={`home-filter-${index}`}
              >
                <Text style={[styles.chipText, active && styles.chipTextActive]}>{item}</Text>
              </TouchableOpacity>
            );
          }}
        />
      </SafeAreaView>

      <FlatList
        data={posts}
        keyExtractor={(p) => p.id}
        renderItem={({ item }) => <PostCard post={item} />}
        contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingTop: 8, paddingBottom: 120 + insets.bottom }}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={styles.aiCard}>
            <LinearGradient
              colors={["rgba(6,182,212,0.18)", "rgba(139,92,246,0.10)"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFillObject}
            />
            <View style={styles.aiIconWrap}>
              <Ionicons name="sparkles" size={18} color={colors.brand} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.aiTitle}>Smart Community picks for you</Text>
              <Text style={styles.aiSub}>3 new spaces matched to your echoes</Text>
            </View>
            <TouchableOpacity style={styles.aiBtn} onPress={() => router.push("/communities")} testID="ai-picks-btn">
              <Text style={styles.aiBtnText}>Discover</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  blob: {
    position: "absolute",
    width: 240,
    height: 240,
    borderRadius: 240,
    backgroundColor: "rgba(6,182,212,0.10)",
  },
  headerWrap: {},
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  logoRow: { flexDirection: "row", alignItems: "center" },
  logoBadge: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  logoText: { ...font.h2, fontSize: 18, letterSpacing: -0.3 },
  iconsRow: { flexDirection: "row", alignItems: "center" },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(255,255,255,0.05)",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.glassBorder,
  },
  badge: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.brand,
    borderWidth: 1.5,
    borderColor: colors.surface,
  },
  chipsContainer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    gap: 8,
  },
  chip: {
    height: 36,
    paddingHorizontal: 16,
    borderRadius: radii.pill,
    backgroundColor: "rgba(255,255,255,0.05)",
    justifyContent: "center",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.glassBorder,
    flexShrink: 0,
  },
  chipActive: {
    backgroundColor: colors.brandSoft,
    borderColor: colors.brandBorder,
  },
  chipText: { ...font.caption, color: colors.onSurfaceMuted, fontWeight: "600" },
  chipTextActive: { color: colors.brand },
  aiCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.md,
    borderRadius: radii.xl,
    marginBottom: spacing.lg,
    overflow: "hidden",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.brandBorder,
    backgroundColor: colors.surfaceSecondary,
  },
  aiIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.brandSoft,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.brandBorder,
  },
  aiTitle: { ...font.title, fontSize: 14 },
  aiSub: { ...font.small, marginTop: 2 },
  aiBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radii.pill,
    backgroundColor: colors.brand,
  },
  aiBtnText: { color: "#0F172A", fontWeight: "700", fontSize: 12 },
});
