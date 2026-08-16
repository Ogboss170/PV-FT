import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { colors, font, radii, spacing } from "@/src/theme";

export default function Login() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [focus, setFocus] = useState<string | null>(null);

  const canSubmit = identifier.length > 0 && password.length >= 6;

  const onLogin = () => {
    if (!canSubmit) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.replace("/(tabs)");
  };

  return (
    <View style={styles.container} testID="login-screen">
      <LinearGradient
        colors={["#0F172A", "#0B1220"]}
        style={StyleSheet.absoluteFillObject}
      />
      {/* Ambient glows */}
      <View style={[styles.blob, { top: -80, left: -60, backgroundColor: "rgba(139,92,246,0.20)" }]} />
      <View style={[styles.blob, { top: 180, right: -80, backgroundColor: "rgba(6,182,212,0.15)" }]} />

      <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <ScrollView
            contentContainerStyle={styles.scroll}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.logoWrap}>
                <LinearGradient
                  colors={["#8B5CF6", "#06B6D4"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.logoInner}
                >
                  <Ionicons name="mic" size={26} color="#FFFFFF" />
                </LinearGradient>
              </View>
              <Text style={styles.brand}>Private Voices</Text>
              <Text style={styles.welcome}>Welcome back to your private space</Text>
              <Text style={styles.subtitle}>
                Connect, share, and express yourself anonymously.
              </Text>
            </View>

            {/* Glass card */}
            <View style={styles.card}>
              {/* Username / Email */}
              <Text style={styles.label}>Username or Email</Text>
              <View style={[styles.inputWrap, focus === "id" && styles.inputFocused]}>
                <Ionicons name="person-outline" size={18} color={focus === "id" ? colors.brand : colors.onSurfaceMuted} />
                <TextInput
                  value={identifier}
                  onChangeText={setIdentifier}
                  placeholder="Enter username or email"
                  placeholderTextColor={colors.onSurfaceDim}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  onFocus={() => setFocus("id")}
                  onBlur={() => setFocus(null)}
                  style={styles.input}
                  testID="login-identifier-input"
                />
              </View>

              {/* Password */}
              <Text style={[styles.label, { marginTop: spacing.md }]}>Password</Text>
              <View style={[styles.inputWrap, focus === "pwd" && styles.inputFocused]}>
                <Ionicons name="lock-closed-outline" size={18} color={focus === "pwd" ? colors.brand : colors.onSurfaceMuted} />
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Enter password"
                  placeholderTextColor={colors.onSurfaceDim}
                  secureTextEntry={!showPassword}
                  onFocus={() => setFocus("pwd")}
                  onBlur={() => setFocus(null)}
                  style={styles.input}
                  testID="login-password-input"
                />
                <TouchableOpacity onPress={() => setShowPassword((v) => !v)} testID="login-show-password">
                  <Ionicons
                    name={showPassword ? "eye-off-outline" : "eye-outline"}
                    size={18}
                    color={colors.onSurfaceMuted}
                  />
                </TouchableOpacity>
              </View>

              {/* Forgot */}
              <TouchableOpacity
                onPress={() => router.push("/auth/forgot-password")}
                style={styles.forgotBtn}
                testID="login-forgot-btn"
              >
                <Text style={styles.forgotText}>Forgot password?</Text>
              </TouchableOpacity>

              {/* Login button */}
              <TouchableOpacity
                onPress={onLogin}
                activeOpacity={0.85}
                disabled={!canSubmit}
                style={[styles.primaryBtn, !canSubmit && { opacity: 0.5 }]}
                testID="login-submit-btn"
              >
                <LinearGradient
                  colors={["#8B5CF6", "#06B6D4"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={StyleSheet.absoluteFillObject}
                />
                <Text style={styles.primaryText}>Login</Text>
                <Ionicons name="arrow-forward" size={18} color="#FFFFFF" style={{ marginLeft: 8 }} />
              </TouchableOpacity>

              {/* Divider */}
              <View style={styles.dividerRow}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>OR</Text>
                <View style={styles.dividerLine} />
              </View>

              {/* Social auth */}
              <TouchableOpacity style={styles.socialBtn} activeOpacity={0.85} testID="login-google-btn">
                <Ionicons name="logo-google" size={18} color="#F8FAFC" />
                <Text style={styles.socialText}>Continue with Google</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.socialBtn, { marginTop: 10 }]} activeOpacity={0.85} testID="login-apple-btn">
                <Ionicons name="logo-apple" size={20} color="#F8FAFC" />
                <Text style={styles.socialText}>Continue with Apple</Text>
              </TouchableOpacity>
            </View>

            {/* Register */}
            <View style={styles.registerRow}>
              <Text style={styles.registerHint}>New to Private Voices?</Text>
              <TouchableOpacity
                onPress={() => router.push("/auth/register")}
                style={styles.createBtn}
                activeOpacity={0.85}
                testID="login-create-account-btn"
              >
                <Ionicons name="add-circle-outline" size={16} color={colors.brand} />
                <Text style={styles.createBtnText}>Create Anonymous Account</Text>
              </TouchableOpacity>
            </View>

            {/* Privacy footer */}
            <View style={styles.privacyRow}>
              <Ionicons name="lock-closed" size={13} color={colors.success} />
              <Text style={styles.privacyText}>
                Your real identity is never shown publicly.
              </Text>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  blob: {
    position: "absolute",
    width: 300,
    height: 300,
    borderRadius: 300,
  },
  scroll: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  header: { alignItems: "center", marginTop: spacing.xl, marginBottom: spacing.xl },
  logoWrap: {
    width: 60,
    height: 60,
    borderRadius: 30,
    padding: 2,
    backgroundColor: "rgba(255,255,255,0.06)",
    shadowColor: "#8B5CF6",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 10,
  },
  logoInner: {
    flex: 1,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  brand: { ...font.h1, fontSize: 26, marginTop: spacing.md, letterSpacing: -0.5 },
  welcome: { ...font.body, color: colors.onSurface, fontSize: 14, marginTop: 8, fontWeight: "600" },
  subtitle: {
    ...font.caption,
    color: colors.onSurfaceMuted,
    textAlign: "center",
    marginTop: 4,
    paddingHorizontal: spacing.md,
  },
  card: {
    backgroundColor: colors.surfaceSecondary,
    borderRadius: radii.xl,
    padding: spacing.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.glassBorder,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 6,
  },
  label: {
    ...font.caption,
    color: colors.onSurface,
    fontWeight: "700",
    fontSize: 12,
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  inputWrap: {
    height: 52,
    borderRadius: radii.md,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1.5,
    borderColor: colors.glassBorder,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  inputFocused: {
    borderColor: colors.brand,
    backgroundColor: "rgba(6,182,212,0.06)",
  },
  input: { flex: 1, color: colors.onSurface, fontSize: 15, fontWeight: "500" },
  forgotBtn: { alignSelf: "flex-end", marginTop: 10, paddingVertical: 4 },
  forgotText: { color: colors.brand, fontSize: 13, fontWeight: "700" },
  primaryBtn: {
    height: 54,
    borderRadius: radii.md,
    marginTop: spacing.lg,
    overflow: "hidden",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#8B5CF6",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 14,
    elevation: 8,
  },
  primaryText: { color: "#FFFFFF", fontWeight: "800", fontSize: 15, letterSpacing: 0.3 },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: spacing.lg,
  },
  dividerLine: { flex: 1, height: StyleSheet.hairlineWidth, backgroundColor: colors.divider },
  dividerText: {
    ...font.small,
    marginHorizontal: 12,
    letterSpacing: 2,
    fontWeight: "700",
    color: colors.onSurfaceDim,
  },
  socialBtn: {
    height: 50,
    borderRadius: radii.md,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.glassBorder,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  socialText: { color: colors.onSurface, fontSize: 14, fontWeight: "700", marginLeft: 10 },
  registerRow: { alignItems: "center", marginTop: spacing.xl },
  registerHint: { ...font.caption, color: colors.onSurfaceMuted },
  createBtn: {
    marginTop: 10,
    height: 46,
    paddingHorizontal: 20,
    borderRadius: radii.pill,
    borderWidth: 1.5,
    borderColor: colors.brandBorder,
    backgroundColor: colors.brandSoft,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  createBtnText: { color: colors.brand, fontWeight: "700", fontSize: 14, marginLeft: 6 },
  privacyRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: spacing.xl,
    gap: 6,
  },
  privacyText: { ...font.small, color: colors.onSurfaceMuted, fontSize: 12 },
});
