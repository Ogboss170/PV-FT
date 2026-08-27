import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useState, useEffect } from "react";
import { FlatList, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import Avatar from "@/src/components/Avatar";
import PostCard from "@/src/components/PostCard";
import InviteFriendsModal from "@/src/components/InviteFriendsModal";
import { achievements, AVATAR_GRADIENTS, communities, posts } from "@/src/mockData";
import { colors, font, radii, spacing } from "@/src/theme";
import { getUserProfile, UserProfile } from "@/src/services/authService";
import { auth } from "@/src/firebase";

const TABS = [
  { key: "posts", label: "Posts", count: 128 },
  { key: "saved", label: "Saved", count: 12 },
  { key: "communities", label: "Communities", count: 6 },
];

const QUICK_STATS = [
  { icon: "flame", label: "Streak", value: "24d", color: "#F59E0B" },
  { icon: "trending-up", label: "Impact", value: "94%", color: "#10B981" },
  { icon: "shield-checkmark", label: "Trust", value: "Verified", color: "#06B6D4" },
];

export default function Profile() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [tab, setTab] = useState(0);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [inviteModalVisible, setInviteModalVisible] = useState(false);

  useEffect(() => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;

    getUserProfile(uid).then((p) => {
      if (p) setUserProfile(p);
    });
  }, []);

  const joinedCommunities = communities.filter((c) => c.joined);
  const savedPosts = posts.filter((p) => p.saved);
  const recentPosts = posts.slice(0, 3);

  return (
    <View style={styles.container} testID="profile-screen">
      <LinearGradient colors={["#0F172A", "#0B1220"]} style={StyleSheet.absoluteFillObject} />

      <ScrollView
        contentContainerStyle={{ paddingBottom: 140 + insets.bottom }}
        showsVerticalScrollIndicator={false}
      >
        {/* Cover */}
        <View style={styles.cover}>
          <LinearGradient
            colors={["#0E7490", "#0F172A", "#0F172A"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFillObject}
          />
          {/* Ambient blobs */}
          <View style={[styles.coverBlob, { top: -40, left: -30, backgroundColor: "rgba(6,182,212,0.35)" }]} />
          <View style={[styles.coverBlob, { top: 40, right: -60, backgroundColor: "rgba(139,92,246,0.25)" }]} />
          {/* Grid overlay for texture */}
          <View style={styles.gridOverlay} />

          <SafeAreaView edges={["top"]} style={styles.coverTop}>
            <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn} testID="profile-back">
              <Ionicons name="chevron-back" size={22} color={colors.onSurface} />
            </TouchableOpacity>
            <View style={styles.coverActions}>
              <TouchableOpacity style={styles.iconBtn} testID="profile-share-btn">
                <Ionicons name="share-outline" size={18} color={colors.onSurface} />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => router.push("/settings")}
                style={styles.iconBtn}
                testID="profile-settings-btn"
              >
                <Ionicons name="settings-outline" size={18} color={colors.onSurface} />
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </View>

        <View style={styles.body}>
          {/* Identity card */}
          <View style={styles.identityCard}>
            <View style={styles.identityTop}>
              <View style={styles.avatarWrap}>
                <Avatar size={88} gradient={AVATAR_GRADIENTS[0]} icon="flash" />
                <View style={styles.avatarStatus} />
              </View>
              <View style={{ flex: 1, marginLeft: spacing.md, paddingTop: 8 }}>
                <View style={styles.nameRow}>
                  <Text style={styles.name} numberOfLines={1}>ShadowFox_42</Text>
                  <View style={styles.verifiedTick}>
                    <Ionicons name="checkmark" size={11} color="#0F172A" />
                  </View>
                </View>
                <View style={styles.metaRow}>
                  <Ionicons name="shield-checkmark" size={11} color={colors.brand} />
                  <Text style={styles.metaText}>Trusted Anon</Text>
                  <View style={styles.metaDot} />
                  <Ionicons name="calendar-outline" size={11} color={colors.onSurfaceDim} />
                  <Text style={styles.metaText}>Joined Mar 2025</Text>
                </View>
              </View>
            </View>

            <Text style={styles.bio}>
              Silence is loud when you finally listen. Building softer places on the internet — one honest thread at a time.
            </Text>

            <View style={styles.tagsRow}>
              <View style={styles.interestTag}>
                <Text style={styles.interestText}>💻 Technology</Text>
              </View>
              <View style={styles.interestTag}>
                <Text style={styles.interestText}>🧠 Mental Health</Text>
              </View>
              <View style={styles.interestTag}>
                <Text style={styles.interestText}>❤️ Relationships</Text>
              </View>
            </View>
          </View>

          {/* Stats row */}
          <View style={styles.statsRow}>
            <View style={styles.statCol}>
              <Text style={styles.statNum}>128</Text>
              <Text style={styles.statLabel}>Echoes</Text>
            </View>
            <View style={styles.statDivider} />
            <TouchableOpacity style={styles.statCol} testID="profile-followers">
              <Text style={styles.statNum}>4.2K</Text>
              <Text style={styles.statLabel}>Followers</Text>
            </TouchableOpacity>
            <View style={styles.statDivider} />
            <TouchableOpacity style={styles.statCol} testID="profile-following">
              <Text style={styles.statNum}>312</Text>
              <Text style={styles.statLabel}>Following</Text>
            </TouchableOpacity>
            <View style={styles.statDivider} />
            <View style={styles.statCol}>
              <Text style={styles.statNum}>948</Text>
              <Text style={styles.statLabel}>Rep</Text>
            </View>
          </View>

          {/* Action buttons */}
          <View style={styles.actionsRow}>
            <TouchableOpacity
              style={styles.primaryBtn}
              activeOpacity={0.85}
              testID="profile-edit-btn"
              onPress={() => router.push("/create-profile")}
            >
              <LinearGradient
                colors={["#06B6D4", "#0284C7"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={StyleSheet.absoluteFillObject}
              />
              <Ionicons name="create-outline" size={16} color="#0F172A" />
              <Text style={styles.primaryText}>Edit Profile</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.secondaryBtn}
              testID="profile-invite-btn"
              onPress={() => setInviteModalVisible(true)}
            >
              <Ionicons name="person-add-outline" size={18} color={colors.onSurface} />
              <Text style={styles.secondaryText}>Invite</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconOnlyBtn} testID="profile-more-btn">
              <Ionicons name="ellipsis-horizontal" size={18} color={colors.onSurface} />
            </TouchableOpacity>
          </View>

          {/* Quick stats */}
          <View style={styles.quickStatsRow}>
            {QUICK_STATS.map((s) => (
              <View key={s.label} style={styles.quickStatCard}>
                <View style={[styles.quickStatIcon, { backgroundColor: s.color + "22", borderColor: s.color + "40" }]}>
                  <Ionicons name={s.icon as any} size={14} color={s.color} />
                </View>
                <Text style={styles.quickStatValue}>{s.value}</Text>
                <Text style={styles.quickStatLabel}>{s.label}</Text>
              </View>
            ))}
          </View>

          {/* Whispers CTA */}
          <TouchableOpacity
            onPress={() => router.push("/whispers")}
            activeOpacity={0.9}
            style={styles.whispersCta}
            testID="profile-whispers-cta"
          >
            <LinearGradient
              colors={["rgba(139,92,246,0.35)", "rgba(6,182,212,0.20)", "rgba(15,23,42,0.6)"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFillObject}
            />
            <View style={styles.whispersIconWrap}>
              <LinearGradient
                colors={["#8B5CF6", "#06B6D4"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFillObject}
              />
              <Ionicons name="mic" size={20} color="#FFFFFF" />
            </View>
            <View style={{ flex: 1 }}>
              <View style={styles.whispersHeaderRow}>
                <Text style={styles.whispersTitle}>Whispers</Text>
                <View style={styles.whispersBadge}>
                  <View style={styles.whispersDot} />
                  <Text style={styles.whispersBadgeText}>3 new</Text>
                </View>
              </View>
              <Text style={styles.whispersSub}>
                Share your link to receive anonymous messages
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.onSurface} />
          </TouchableOpacity>

          {/* Reputation Tier */}
          <View style={styles.repCard}>
            <View style={styles.repHeader}>
              <View>
                <Text style={styles.sectionKicker}>Reputation</Text>
                <View style={styles.repTitleRow}>
                  <Text style={styles.repTitle}>Silver Voice</Text>
                  <View style={styles.repTierBadge}>
                    <Text style={styles.repTierText}>Tier 3 · Top 5%</Text>
                  </View>
                </View>
              </View>
              <Text style={styles.repScore}>948</Text>
            </View>
            <View style={styles.repBar}>
              <LinearGradient
                colors={["#06B6D4", "#0284C7"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.repFill, { width: "78%" }]}
              />
            </View>
            <View style={styles.repFooter}>
              <Text style={styles.repFooterText}>52 points to <Text style={{ color: colors.brand, fontWeight: "700" }}>Gold Voice</Text></Text>
              <TouchableOpacity>
                <Text style={styles.repFooterLink}>How this works</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Achievements */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View>
                <Text style={styles.sectionKicker}>Achievements</Text>
                <Text style={styles.sectionTitle}>3 of {achievements.length} unlocked</Text>
              </View>
              <TouchableOpacity>
                <Text style={styles.sectionLink}>View all</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              horizontal
              data={achievements}
              keyExtractor={(a) => a.id}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 10, paddingRight: 4 }}
              renderItem={({ item }) => (
                <View style={[styles.achCard, !item.unlocked && styles.achLocked]}>
                  <View
                    style={[
                      styles.achIcon,
                      { backgroundColor: item.color + "1F", borderColor: item.color + "55" },
                      !item.unlocked && { backgroundColor: "rgba(148,163,184,0.10)", borderColor: colors.divider },
                    ]}
                  >
                    <Ionicons
                      name={(item.unlocked ? item.icon : "lock-closed") as any}
                      size={20}
                      color={item.unlocked ? item.color : colors.onSurfaceDim}
                    />
                  </View>
                  <Text style={styles.achName} numberOfLines={1}>{item.name}</Text>
                  <Text style={[styles.achStatus, item.unlocked && { color: colors.success }]}>
                    {item.unlocked ? "Unlocked" : "Locked"}
                  </Text>
                </View>
              )}
            />
          </View>

          {/* Tabs */}
          <View style={styles.tabsRow}>
            {TABS.map((t, i) => {
              const active = i === tab;
              return (
                <TouchableOpacity
                  key={t.key}
                  onPress={() => setTab(i)}
                  style={styles.tabBtn}
                  activeOpacity={0.7}
                  testID={`profile-tab-${i}`}
                >
                  <Text style={[styles.tabText, active && styles.tabTextActive]}>
                    {t.label} <Text style={[styles.tabCount, active && styles.tabCountActive]}>{t.count}</Text>
                  </Text>
                  {active && <View style={styles.tabUnderline} />}
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Content */}
          <View style={styles.contentBody}>
            {tab === 0 &&
              (recentPosts.length ? (
                recentPosts.map((p) => <PostCard key={p.id} post={p} />)
              ) : (
                <EmptyState icon="chatbubble-ellipses-outline" title="No posts yet" sub="Share your first anonymous thought." />
              ))}

            {tab === 1 &&
              (savedPosts.length ? (
                savedPosts.map((p) => <PostCard key={p.id} post={p} />)
              ) : (
                <EmptyState icon="bookmark-outline" title="Nothing saved yet" sub="Tap the bookmark icon on any post to save it here." />
              ))}

            {tab === 2 && (
              <View style={styles.commList}>
                {joinedCommunities.map((c) => (
                  <View key={c.id} style={styles.commRow}>
                    <View style={styles.commEmojiWrap}>
                      <Text style={styles.commEmoji}>{c.emoji}</Text>
                    </View>
                    <View style={{ flex: 1, marginLeft: 12 }}>
                      <Text style={styles.commName}>{c.name}</Text>
                      <Text style={styles.commMeta}>{c.members} members · {c.description}</Text>
                    </View>
                    <TouchableOpacity style={styles.commPill}>
                      <Text style={styles.commPillText}>Open</Text>
                    </TouchableOpacity>
                  </View>
                ))}
                {joinedCommunities.length === 0 && (
                  <EmptyState icon="people-outline" title="No communities" sub="Join spaces that matter to you." />
                )}
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      <InviteFriendsModal
        visible={inviteModalVisible}
        onClose={() => setInviteModalVisible(false)}
      />
    </View>
  );
}

function EmptyState({ icon, title, sub }: { icon: string; title: string; sub: string }) {
  return (
    <View style={styles.emptyWrap}>
      <View style={styles.emptyIcon}>
        <Ionicons name={icon as any} size={26} color={colors.brand} />
      </View>
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptySub}>{sub}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },

  // Cover
  cover: { height: 200, overflow: "hidden" },
  coverBlob: {
    position: "absolute",
    width: 220,
    height: 220,
    borderRadius: 220,
  },
  gridOverlay: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.4,
  },
  coverTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
  },
  coverActions: { flexDirection: "row", gap: 10 },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(15,23,42,0.55)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.12)",
  },

  body: {
    paddingHorizontal: spacing.lg,
    marginTop: -46,
  },

  // Identity card
  identityCard: {
    backgroundColor: colors.surfaceSecondary,
    borderRadius: radii.xl,
    padding: spacing.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.glassBorder,
  },
  identityTop: { flexDirection: "row", alignItems: "flex-start" },
  avatarWrap: {
    marginTop: -46,
    padding: 4,
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 999,
  },
  avatarStatus: {
    position: "absolute",
    right: 6,
    bottom: 6,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.success,
    borderWidth: 3,
    borderColor: colors.surfaceSecondary,
  },
  nameRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  name: { ...font.h2, fontSize: 20, flexShrink: 1 },
  verifiedTick: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.brand,
    alignItems: "center",
    justifyContent: "center",
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
    flexWrap: "wrap",
  },
  metaText: { ...font.small, marginLeft: 4, color: colors.onSurfaceMuted, fontWeight: "600" },
  metaDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: colors.onSurfaceDim,
    marginHorizontal: 8,
  },
  bio: {
    ...font.body,
    color: colors.onSurfaceMuted,
    fontSize: 14,
    lineHeight: 20,
    marginTop: spacing.md,
  },
  tagsRow: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: spacing.md },
  interestTag: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radii.pill,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.glassBorder,
  },
  interestText: { ...font.small, color: colors.onSurface, fontWeight: "600", fontSize: 11 },

  // Stats
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.surfaceSecondary,
    borderRadius: radii.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.glassBorder,
  },
  statCol: { flex: 1, alignItems: "center" },
  statDivider: { width: 1, height: 26, backgroundColor: colors.divider },
  statNum: { ...font.h3, fontSize: 17, letterSpacing: -0.2 },
  statLabel: {
    ...font.small,
    marginTop: 2,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    fontSize: 10,
    fontWeight: "700",
  },

  // Action buttons
  actionsRow: { flexDirection: "row", gap: 8, marginTop: spacing.md },
  primaryBtn: {
    flex: 1,
    height: 44,
    borderRadius: radii.md,
    overflow: "hidden",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  primaryText: { color: "#0F172A", fontWeight: "800", fontSize: 14, marginLeft: 6 },
  secondaryBtn: {
    flex: 1,
    height: 44,
    borderRadius: radii.md,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.glassBorder,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryText: { color: colors.onSurface, fontWeight: "700", fontSize: 14, marginLeft: 6 },
  iconOnlyBtn: {
    width: 44,
    height: 44,
    borderRadius: radii.md,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.glassBorder,
    alignItems: "center",
    justifyContent: "center",
  },

  // Quick stats
  quickStatsRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: spacing.md,
  },
  quickStatCard: {
    flex: 1,
    padding: 12,
    borderRadius: radii.md,
    backgroundColor: colors.surfaceSecondary,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.glassBorder,
  },
  quickStatIcon: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    marginBottom: 8,
  },
  quickStatValue: { ...font.title, fontSize: 15 },
  quickStatLabel: { ...font.small, marginTop: 2, fontSize: 11 },

  // Whispers CTA
  whispersCta: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.md,
    borderRadius: radii.xl,
    marginTop: spacing.md,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(139,92,246,0.35)",
    shadowColor: "#8B5CF6",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 18,
    elevation: 8,
    gap: 12,
  },
  whispersIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  whispersHeaderRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  whispersTitle: { ...font.h3, fontSize: 16, color: "#FFFFFF" },
  whispersBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radii.pill,
    backgroundColor: "rgba(6,182,212,0.25)",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.brandBorder,
    gap: 4,
  },
  whispersDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: colors.brand },
  whispersBadgeText: { color: colors.brand, fontSize: 10, fontWeight: "800", letterSpacing: 0.3 },
  whispersSub: { ...font.small, color: "rgba(248,250,252,0.75)", marginTop: 3 },

  // Reputation
  repCard: {
    marginTop: spacing.lg,
    padding: spacing.md,
    borderRadius: radii.lg,
    backgroundColor: colors.surfaceSecondary,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.glassBorder,
  },
  repHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  repTitleRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 4 },
  repTitle: { ...font.h3, fontSize: 18 },
  repTierBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radii.pill,
    backgroundColor: colors.brandSoft,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.brandBorder,
  },
  repTierText: { color: colors.brand, fontWeight: "700", fontSize: 10, letterSpacing: 0.3 },
  repScore: {
    ...font.h1,
    fontSize: 28,
    color: colors.brand,
    letterSpacing: -0.5,
  },
  repBar: {
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(255,255,255,0.06)",
    marginTop: spacing.md,
    overflow: "hidden",
  },
  repFill: { height: 6, borderRadius: 3 },
  repFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
  },
  repFooterText: { ...font.small, color: colors.onSurfaceMuted },
  repFooterLink: { ...font.small, color: colors.brand, fontWeight: "700" },

  // Sections
  section: { marginTop: spacing.xl },
  sectionKicker: {
    ...font.small,
    color: colors.onSurfaceDim,
    fontWeight: "700",
    letterSpacing: 1,
    textTransform: "uppercase",
    fontSize: 10,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: spacing.md,
  },
  sectionTitle: { ...font.h3, fontSize: 16, marginTop: 2 },
  sectionLink: { ...font.caption, color: colors.brand, fontWeight: "700" },

  // Achievements
  achCard: {
    width: 100,
    padding: spacing.md,
    borderRadius: radii.md,
    backgroundColor: colors.surfaceSecondary,
    alignItems: "center",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.glassBorder,
  },
  achLocked: { opacity: 0.55 },
  achIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  achName: { ...font.title, fontSize: 12, marginTop: 8, color: colors.onSurface },
  achStatus: {
    ...font.small,
    marginTop: 2,
    fontSize: 10,
    color: colors.onSurfaceDim,
    fontWeight: "700",
  },

  // Tabs
  tabsRow: {
    flexDirection: "row",
    marginTop: spacing.xl,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.divider,
  },
  tabBtn: {
    marginRight: 22,
    paddingBottom: 10,
    position: "relative",
  },
  tabText: {
    ...font.title,
    fontSize: 14,
    color: colors.onSurfaceMuted,
    fontWeight: "600",
  },
  tabTextActive: { color: colors.onSurface, fontWeight: "700" },
  tabCount: { color: colors.onSurfaceDim, fontWeight: "600" },
  tabCountActive: { color: colors.brand, fontWeight: "700" },
  tabUnderline: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: -1,
    height: 2,
    borderRadius: 2,
    backgroundColor: colors.brand,
  },

  contentBody: { marginTop: spacing.lg },

  // Communities tab
  commList: {},
  commRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: radii.md,
    backgroundColor: colors.surfaceSecondary,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.glassBorder,
    marginBottom: 8,
  },
  commEmojiWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.brandSoft,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.brandBorder,
  },
  commEmoji: { fontSize: 22 },
  commName: { ...font.title, fontSize: 14 },
  commMeta: { ...font.small, marginTop: 2 },
  commPill: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: radii.pill,
    backgroundColor: colors.brandSoft,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.brandBorder,
  },
  commPillText: { color: colors.brand, fontWeight: "700", fontSize: 12 },

  // Empty
  emptyWrap: { alignItems: "center", padding: spacing.xxl },
  emptyIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.brandSoft,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.brandBorder,
  },
  emptyTitle: { ...font.title, fontSize: 15, marginTop: spacing.md },
  emptySub: { ...font.caption, textAlign: "center", marginTop: 6 },
});
