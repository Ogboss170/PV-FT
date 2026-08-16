import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import Avatar from "@/src/components/Avatar";
import { notifications } from "@/src/mockData";
import { colors, font, radii, spacing } from "@/src/theme";

const TABS = ["All", "Mentions", "Likes", "Follows"];

const ICONS: Record<string, string> = {
  like: "heart",
  comment: "chatbubble",
  follow: "person-add",
  mention: "at",
  community: "people",
};
const COLORS: Record<string, string> = {
  like: "#EC4899",
  comment: colors.brand,
  follow: colors.success,
  mention: colors.warning,
  community: "#8B5CF6",
};

export default function Notifications() {
  const router = useRouter();
  const [tab, setTab] = useState(0);

  return (
    <View style={styles.container} testID="notifications-screen">
      <LinearGradient colors={["#0F172A", "#0B1220"]} style={StyleSheet.absoluteFillObject} />

      <SafeAreaView edges={["top"]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn} testID="notifications-back">
            <Ionicons name="chevron-back" size={22} color={colors.onSurface} />
          </TouchableOpacity>
          <Text style={styles.title}>Notifications</Text>
          <TouchableOpacity style={styles.iconBtn} testID="notifications-clear">
            <Ionicons name="checkmark-done" size={20} color={colors.brand} />
          </TouchableOpacity>
        </View>

        <FlatList
          horizontal
          data={TABS}
          keyExtractor={(t) => t}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsRow}
          renderItem={({ item, index }) => {
            const active = index === tab;
            return (
              <TouchableOpacity
                onPress={() => setTab(index)}
                style={[styles.chip, active && styles.chipActive]}
                testID={`notif-tab-${index}`}
              >
                <Text style={[styles.chipText, active && styles.chipTextActive]}>{item}</Text>
              </TouchableOpacity>
            );
          }}
        />
      </SafeAreaView>

      <FlatList
        data={notifications}
        keyExtractor={(n) => n.id}
        contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingBottom: 40 }}
        ListHeaderComponent={
          <View style={styles.summary}>
            <Ionicons name="sparkles" size={16} color={colors.brand} />
            <Text style={styles.summaryText}>You have 3 new echoes waiting.</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={[styles.row, item.unread && styles.rowUnread]} testID={`notif-${item.id}`}>
            <View style={styles.avatarWrap}>
              <Avatar size={44} gradient={item.actorGradient} icon="planet" />
              <View style={[styles.typePill, { backgroundColor: COLORS[item.type] }]}>
                <Ionicons name={ICONS[item.type] as any} size={10} color="#FFFFFF" />
              </View>
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.text}>
                <Text style={styles.actor}>{item.actor}</Text>{" "}
                <Text style={styles.body}>{item.text}</Text>
              </Text>
              <Text style={styles.time}>{item.time}</Text>
            </View>
            {item.type === "follow" && (
              <TouchableOpacity style={styles.followBtn}>
                <Text style={styles.followText}>Follow back</Text>
              </TouchableOpacity>
            )}
            {item.unread && <View style={styles.unreadDot} />}
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.05)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.glassBorder,
  },
  title: { ...font.h2, fontSize: 20 },
  tabsRow: {
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
  chipActive: { backgroundColor: colors.brandSoft, borderColor: colors.brandBorder },
  chipText: { ...font.caption, fontWeight: "600" },
  chipTextActive: { color: colors.brand },
  summary: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: radii.md,
    backgroundColor: colors.brandSoft,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.brandBorder,
    marginBottom: spacing.md,
    marginTop: spacing.sm,
  },
  summaryText: { ...font.caption, color: colors.brand, fontWeight: "600", marginLeft: 8 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: radii.md,
    marginBottom: 8,
    backgroundColor: colors.surfaceSecondary,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.glassBorder,
  },
  rowUnread: {
    backgroundColor: "rgba(6,182,212,0.08)",
    borderColor: colors.brandBorder,
  },
  avatarWrap: { position: "relative" },
  typePill: {
    position: "absolute",
    right: -2,
    bottom: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: colors.surface,
  },
  text: { fontSize: 14, lineHeight: 19 },
  actor: { color: colors.onSurface, fontWeight: "700" },
  body: { color: colors.onSurfaceMuted },
  time: { ...font.small, marginTop: 4 },
  followBtn: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: radii.pill,
    backgroundColor: colors.brand,
  },
  followText: { color: "#0F172A", fontSize: 12, fontWeight: "800" },
  unreadDot: {
    marginLeft: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.brand,
  },
});
