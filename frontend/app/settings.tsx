import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Alert, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import Avatar from "@/src/components/Avatar";
import { AVATAR_GRADIENTS } from "@/src/mockData";
import { colors, font, radii, spacing } from "@/src/theme";
import InviteFriendsModal from "@/src/components/InviteFriendsModal";
import { logout } from "@/src/services/authService";

type Row = {
  icon: string;
  label: string;
  hint?: string;
  color?: string;
  toggle?: boolean;
  destructive?: boolean;
  chevron?: boolean;
  onPress?: () => void;
};

export default function Settings() {
  const router = useRouter();
  const [notif, setNotif] = useState(true);
  const [readReceipts, setReadReceipts] = useState(false);
  const [darkMode] = useState(true);
  const [inviteModalVisible, setInviteModalVisible] = useState(false);

  const handleLogout = () => {
    Alert.alert(
      "Log Out",
      "Are you sure you want to log out of Private Voices?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Log Out",
          style: "destructive",
          onPress: async () => {
            await logout();
            router.replace("/auth/login");
          },
        },
      ]
    );
  };

  const sections: { title: string; rows: (Row & { onToggle?: (v: boolean) => void; toggleValue?: boolean })[] }[] = [
    {
      title: "Privacy",
      rows: [
        { icon: "lock-closed-outline", label: "Privacy", hint: "Control who sees your echoes", chevron: true },
        { icon: "person-remove-outline", label: "Blocked users", hint: "3 accounts blocked", chevron: true },
        { icon: "eye-off-outline", label: "Read receipts", toggle: true, toggleValue: readReceipts, onToggle: setReadReceipts },
      ],
    },
    {
      title: "Preferences & Growth",
      rows: [
        { icon: "gift-outline", label: "Invite Friends", hint: "Get your anonymous link", chevron: true, onPress: () => setInviteModalVisible(true) },
        { icon: "notifications-outline", label: "Notifications", toggle: true, toggleValue: notif, onToggle: setNotif },
        { icon: "moon-outline", label: "Dark mode", hint: "Always on", toggle: true, toggleValue: darkMode },
        { icon: "language-outline", label: "Language", hint: "English", chevron: true },
      ],
    },
    {
      title: "Support",
      rows: [
        { icon: "help-circle-outline", label: "Report a problem", chevron: true },
        { icon: "book-outline", label: "Community guidelines", chevron: true },
        { icon: "information-circle-outline", label: "About Private Voices", chevron: true },
      ],
    },
    {
      title: "Account",
      rows: [
        { icon: "log-out-outline", label: "Log out", destructive: true, onPress: handleLogout },
      ],
    },
  ];


  return (
    <View style={styles.container} testID="settings-screen">
      <LinearGradient colors={["#0F172A", "#0B1220"]} style={StyleSheet.absoluteFillObject} />

      <SafeAreaView edges={["top"]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn} testID="settings-back">
            <Ionicons name="chevron-back" size={22} color={colors.onSurface} />
          </TouchableOpacity>
          <Text style={styles.title}>Settings</Text>
          <View style={{ width: 40 }} />
        </View>
      </SafeAreaView>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingBottom: 60 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile summary */}
        <View style={styles.profileCard}>
          <Avatar size={56} gradient={AVATAR_GRADIENTS[0]} icon="flash" ring />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.profileName}>@ShadowFox_42</Text>
            <View style={styles.privacyRow}>
              <Ionicons name="shield-checkmark" size={12} color={colors.success} />
              <Text style={styles.privacyText}>Identity protected</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.editBtn} onPress={() => router.push("/(tabs)/profile")} testID="settings-edit-profile">
            <Text style={styles.editBtnText}>Edit</Text>
          </TouchableOpacity>
        </View>

        {sections.map((section) => (
          <View key={section.title} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.sectionCard}>
              {section.rows.map((row, i) => (
                <TouchableOpacity
                  key={row.label}
                  onPress={row.onPress}
                  style={[styles.row, i < section.rows.length - 1 && styles.rowDivider]}
                  activeOpacity={0.7}
                  testID={`settings-row-${row.label.toLowerCase().replace(/\s+/g, "-")}`}
                >
                  <View style={[styles.rowIcon, row.destructive && { backgroundColor: "rgba(239,68,68,0.15)" }]}>
                    <Ionicons
                      name={row.icon as any}
                      size={18}
                      color={row.destructive ? colors.error : colors.brand}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.rowLabel, row.destructive && { color: colors.error }]}>{row.label}</Text>
                    {row.hint && <Text style={styles.rowHint}>{row.hint}</Text>}
                  </View>
                  {row.toggle ? (
                    <Switch
                      value={row.toggleValue}
                      onValueChange={row.onToggle}
                      trackColor={{ false: "rgba(255,255,255,0.15)", true: colors.brand }}
                      thumbColor="#FFFFFF"
                      ios_backgroundColor="rgba(255,255,255,0.15)"
                    />
                  ) : row.chevron ? (
                    <Ionicons name="chevron-forward" size={18} color={colors.onSurfaceDim} />
                  ) : null}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        <Text style={styles.version}>Private Voices · v1.0.0</Text>
      </ScrollView>

      <InviteFriendsModal
        visible={inviteModalVisible}
        onClose={() => setInviteModalVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
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
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.md,
    borderRadius: radii.xl,
    backgroundColor: colors.surfaceSecondary,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.brandBorder,
    marginBottom: spacing.xl,
  },
  profileName: { ...font.title, fontSize: 15 },
  privacyRow: { flexDirection: "row", alignItems: "center", marginTop: 3 },
  privacyText: { ...font.small, color: colors.success, fontWeight: "600", marginLeft: 4 },
  editBtn: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: radii.pill,
    backgroundColor: colors.brandSoft,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.brandBorder,
  },
  editBtnText: { color: colors.brand, fontWeight: "700", fontSize: 12 },
  section: { marginBottom: spacing.xl },
  sectionTitle: {
    ...font.caption,
    color: colors.onSurfaceMuted,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1,
    fontSize: 11,
    marginBottom: spacing.sm,
    marginLeft: 4,
  },
  sectionCard: {
    backgroundColor: colors.surfaceSecondary,
    borderRadius: radii.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.glassBorder,
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
  },
  rowDivider: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.divider },
  rowIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: colors.brandSoft,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  rowLabel: { ...font.title, fontSize: 14 },
  rowHint: { ...font.small, marginTop: 2 },
  version: {
    textAlign: "center",
    color: colors.onSurfaceDim,
    fontSize: 12,
    marginTop: spacing.md,
  },
});
