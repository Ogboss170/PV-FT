import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import { communities as allCommunities } from "@/src/mockData";
import { colors, font, radii, spacing } from "@/src/theme";

const FILTERS = ["All", "Joined", "Trending", "New"];

export default function Communities() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [filter, setFilter] = useState(0);
  const [query, setQuery] = useState("");
  const [joined, setJoined] = useState<Record<string, boolean>>(
    Object.fromEntries(allCommunities.map((c) => [c.id, !!c.joined])),
  );

  const list = allCommunities.filter((c) => {
    if (filter === 1 && !joined[c.id]) return false;
    if (query && !c.name.toLowerCase().includes(query.toLowerCase())) return false;
    return true;
  });

  return (
    <View style={styles.container} testID="communities-screen">
      <LinearGradient colors={["#0F172A", "#0B1220"]} style={StyleSheet.absoluteFillObject} />

      <SafeAreaView edges={["top"]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn} testID="communities-back">
            <Ionicons name="chevron-back" size={22} color={colors.onSurface} />
          </TouchableOpacity>
          <Text style={styles.title}>Communities</Text>
          <TouchableOpacity style={styles.iconBtn} testID="communities-add">
            <Ionicons name="add" size={22} color={colors.brand} />
          </TouchableOpacity>
        </View>

        <View style={styles.searchWrap}>
          <Ionicons name="search" size={18} color={colors.onSurfaceMuted} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search communities"
            placeholderTextColor={colors.onSurfaceDim}
            style={styles.searchInput}
            testID="communities-search-input"
          />
        </View>

        <FlatList
          horizontal
          data={FILTERS}
          keyExtractor={(t) => t}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersRow}
          renderItem={({ item, index }) => {
            const active = index === filter;
            return (
              <TouchableOpacity
                onPress={() => setFilter(index)}
                style={[styles.chip, active && styles.chipActive]}
                testID={`communities-filter-${index}`}
              >
                <Text style={[styles.chipText, active && styles.chipTextActive]}>{item}</Text>
              </TouchableOpacity>
            );
          }}
        />
      </SafeAreaView>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingBottom: 40 + insets.bottom }}
        showsVerticalScrollIndicator={false}
      >
        {list.map((c) => {
          const isJoined = joined[c.id];
          return (
            <TouchableOpacity
              key={c.id}
              onPress={() => router.push({ pathname: "/community/[id]", params: { id: c.id } } as any)}
              activeOpacity={0.9}
              style={styles.card}
              testID={`community-card-${c.id}`}
            >
              <View style={styles.cover}>
                <Image source={{ uri: c.cover }} style={StyleSheet.absoluteFillObject} contentFit="cover" />
                <LinearGradient
                  colors={["rgba(15,23,42,0.1)", "rgba(15,23,42,0.95)"]}
                  style={StyleSheet.absoluteFillObject}
                />
                <View style={styles.memberBadge}>
                  <Ionicons name="people" size={11} color={colors.onSurface} />
                  <Text style={styles.memberText}>{c.members}</Text>
                </View>
                <View style={styles.coverContent}>
                  <Text style={styles.coverEmoji}>{c.emoji}</Text>
                  <Text style={styles.coverName}>{c.name}</Text>
                </View>
              </View>
              <View style={styles.cardBody}>
                <Text style={styles.desc}>{c.description}</Text>
                <TouchableOpacity
                  onPress={() => setJoined({ ...joined, [c.id]: !isJoined })}
                  style={[styles.joinBtn, isJoined && styles.joinedBtn]}
                  activeOpacity={0.85}
                  testID={`community-join-${c.id}`}
                >
                  {isJoined ? (
                    <>
                      <Ionicons name="checkmark" size={16} color={colors.brand} />
                      <Text style={styles.joinedText}>Joined</Text>
                    </>
                  ) : (
                    <Text style={styles.joinText}>Join</Text>
                  )}
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
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
  searchWrap: {
    marginHorizontal: spacing.lg,
    height: 46,
    borderRadius: radii.pill,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.glassBorder,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
  },
  searchInput: { flex: 1, marginLeft: 10, color: colors.onSurface, fontSize: 14 },
  filtersRow: { paddingHorizontal: spacing.lg, paddingVertical: spacing.md, gap: 8 },
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
  card: {
    borderRadius: radii.xl,
    overflow: "hidden",
    marginBottom: spacing.lg,
    backgroundColor: colors.surfaceSecondary,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.glassBorder,
  },
  cover: { height: 130, position: "relative" },
  memberBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(15,23,42,0.75)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radii.pill,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.glassBorder,
  },
  memberText: { ...font.small, color: colors.onSurface, marginLeft: 4, fontWeight: "700" },
  coverContent: { position: "absolute", bottom: 12, left: 14, right: 14 },
  coverEmoji: { fontSize: 22 },
  coverName: { ...font.h2, fontSize: 20, marginTop: 2 },
  cardBody: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.md,
  },
  desc: { ...font.caption, flex: 1, color: colors.onSurfaceMuted, marginRight: 12 },
  joinBtn: {
    height: 36,
    paddingHorizontal: 18,
    borderRadius: radii.pill,
    backgroundColor: colors.brand,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  joinText: { color: "#0F172A", fontWeight: "800", fontSize: 13 },
  joinedBtn: {
    backgroundColor: colors.brandSoft,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.brandBorder,
  },
  joinedText: { color: colors.brand, fontWeight: "700", fontSize: 13, marginLeft: 4 },
});
