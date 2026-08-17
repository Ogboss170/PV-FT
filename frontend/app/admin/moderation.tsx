import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useState, useEffect } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert,
  ActivityIndicator
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { colors, font, radii, spacing } from "@/src/theme";
import {
  subscribeToPendingReports,
  resolveReportInFirestore,
  deleteReportedPostInFirestore,
  ModerationReport
} from "@/src/services/moderationService";

const MOD_TABS = ["Reports Queue", "Appeals Review"];

export default function AdminModeration() {
  const router = useRouter();
  const [tab, setTab] = useState(0);
  const [reports, setReports] = useState<ModerationReport[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeToPendingReports((liveReports) => {
      setReports(liveReports);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleDismiss = async (reportId: string) => {
    await resolveReportInFirestore(reportId, "dismissed");
  };

  const handleDeleteContent = async (report: ModerationReport) => {
    if (report.targetType === "post") {
      await deleteReportedPostInFirestore(report.targetId, report.id);
    } else {
      await resolveReportInFirestore(report.id, "resolved");
    }
  };

  return (
    <View style={styles.container} testID="admin-moderation-screen">
      <LinearGradient colors={["#0F172A", "#0B1220"]} style={StyleSheet.absoluteFillObject} />

      <SafeAreaView edges={["top"]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn} testID="admin-back">
            <Ionicons name="chevron-back" size={22} color={colors.onSurface} />
          </TouchableOpacity>
          <View>
            <Text style={styles.title}>Admin Moderation & Safety</Text>
            <Text style={styles.subtitle}>Proactive Threat Detection & Appeals</Text>
          </View>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{reports.length}</Text>
          </View>
        </View>

        {/* Tab Filters */}
        <View style={styles.tabsRow}>
          {MOD_TABS.map((t, idx) => {
            const active = idx === tab;
            return (
              <TouchableOpacity
                key={t}
                style={[styles.tabChip, active && styles.tabChipActive]}
                onPress={() => setTab(idx)}
              >
                <Text style={[styles.tabText, active && styles.tabTextActive]}>{t}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </SafeAreaView>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.brand} />
        </View>
      ) : reports.length === 0 ? (
        <View style={styles.center}>
          <Ionicons name="shield-checkmark" size={48} color={colors.success} />
          <Text style={styles.emptyTitle}>Queue Clean</Text>
          <Text style={styles.emptySub}>There are no pending reported items requiring moderation.</Text>
        </View>
      ) : (
        <FlatList
          data={reports}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: spacing.lg, paddingBottom: 40 }}
          renderItem={({ item }) => (
            <View style={styles.reportCard}>
              <View style={styles.cardHeader}>
                <View style={styles.tagPill}>
                  <Ionicons name="warning" size={12} color={colors.error} />
                  <Text style={styles.tagText}>{item.targetType.toUpperCase()}</Text>
                </View>
                <Text style={styles.reasonText}>Reason: {item.reason}</Text>
              </View>

              <Text style={styles.contentText} numberOfLines={3}>
                &quot;{item.targetContent}&quot;
              </Text>

              <View style={styles.actionRow}>
                <TouchableOpacity
                  style={styles.dismissBtn}
                  onPress={() => handleDismiss(item.id)}
                  testID={`report-dismiss-${item.id}`}
                >
                  <Text style={styles.dismissText}>Dismiss Flag</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.deleteBtn}
                  onPress={() => handleDeleteContent(item)}
                  testID={`report-delete-${item.id}`}
                >
                  <LinearGradient
                    colors={["#EF4444", "#DC2626"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.deleteInner}
                  >
                    <Ionicons name="trash" size={14} color="#FFFFFF" />
                    <Text style={styles.deleteText}>Remove Content</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.06)",
    gap: spacing.md,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: radii.md,
    backgroundColor: colors.surfaceSecondary,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontFamily: font.family,
    fontSize: 18,
    fontWeight: "700",
    color: colors.onSurface,
  },
  subtitle: {
    fontFamily: font.family,
    fontSize: 12,
    color: colors.onSurfaceDim,
  },
  badge: {
    marginLeft: "auto",
    backgroundColor: colors.error,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radii.pill,
  },
  badgeText: {
    fontFamily: font.family,
    fontSize: 12,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  tabsRow: {
    flexDirection: "row",
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  tabChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radii.pill,
    backgroundColor: colors.surfaceSecondary,
  },
  tabChipActive: {
    backgroundColor: colors.brand,
  },
  tabText: {
    fontFamily: font.family,
    fontSize: 13,
    fontWeight: "500",
    color: colors.onSurfaceSecondary,
  },
  tabTextActive: {
    color: "#0F172A",
    fontWeight: "700",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.2xl,
  },
  emptyTitle: {
    fontFamily: font.family,
    fontSize: 20,
    fontWeight: "700",
    color: colors.onSurface,
    marginTop: spacing.md,
  },
  emptySub: {
    fontFamily: font.family,
    fontSize: 14,
    color: colors.onSurfaceSecondary,
    textAlign: "center",
    marginTop: spacing.xs,
  },
  reportCard: {
    backgroundColor: colors.surfaceSecondary,
    borderRadius: radii.md,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: "rgba(239,68,68,0.3)",
    marginBottom: spacing.md,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  tagPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(239,68,68,0.15)",
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radii.sm,
  },
  tagText: {
    fontFamily: font.family,
    fontSize: 10,
    fontWeight: "700",
    color: colors.error,
  },
  reasonText: {
    fontFamily: font.family,
    fontSize: 13,
    fontWeight: "600",
    color: colors.onSurfaceSecondary,
    marginLeft: spacing.xs,
  },
  contentText: {
    fontFamily: font.family,
    fontSize: 14,
    color: colors.onSurface,
    fontStyle: "italic",
    marginVertical: spacing.sm,
    lineHeight: 20,
  },
  actionRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  dismissBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.md,
    backgroundColor: colors.surfaceTertiary,
    justifyContent: "center",
  },
  dismissText: {
    fontFamily: font.family,
    fontSize: 13,
    fontWeight: "600",
    color: colors.onSurfaceSecondary,
  },
  deleteBtn: {
    borderRadius: radii.md,
    overflow: "hidden",
  },
  deleteInner: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  deleteText: {
    fontFamily: font.family,
    fontSize: 13,
    fontWeight: "700",
    color: "#FFFFFF",
  },
});
