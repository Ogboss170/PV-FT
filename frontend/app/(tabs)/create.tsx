import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Image as ExpoImage } from "expo-image";
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
  ActivityIndicator,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import Avatar from "@/src/components/Avatar";
import { AVATAR_GRADIENTS, Community } from "@/src/mockData";
import { colors, font, radii, spacing } from "@/src/theme";
import { createPostInFirestore } from "@/src/services/postService";
import { uploadMediaToFirebase } from "@/src/services/mediaService";
import { checkRateLimit, evaluateContentSafety } from "@/src/services/safetyService";
import { subscribeToCommunities } from "@/src/services/communityService";
import { auth } from "@/src/firebase";

const VISIBILITIES = [
  { key: "public", label: "Public", icon: "globe-outline" },
  { key: "followers", label: "Followers", icon: "people-outline" },
  { key: "community", label: "Community", icon: "shield-half-outline" },
];

import { pickImagesFromGallery } from "@/src/utils/imagePicker";

export default function Create() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [text, setText] = useState("");
  const [visibility, setVisibility] = useState(0);
  const [liveCommunities, setLiveCommunities] = useState<Community[]>([]);
  const [community, setCommunity] = useState<Community | null>(null);
  const [pollMode, setPollMode] = useState(false);
  const [pollOptions, setPollOptions] = useState(["", ""]);
  const [submitting, setSubmitting] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [safetyError, setSafetyError] = useState("");

  React.useEffect(() => {
    const unsub = subscribeToCommunities((comms) => {
      setLiveCommunities(comms);
      if (comms.length > 0 && !community) {
        setCommunity(comms[0]);
      }
    });
    return () => unsub();
  }, []);

  const addPollOption = () => {
    if (pollOptions.length < 4) setPollOptions([...pollOptions, ""]);
  };
  const updateOption = (i: number, v: string) => {
    const next = [...pollOptions];
    next[i] = v;
    setPollOptions(next);
  };

  const handlePickImage = async () => {
    if (images.length >= 4) {
      alert("You can attach a maximum of 4 images per post.");
      return;
    }
    const maxToPick = 4 - images.length;
    const selected = await pickImagesFromGallery({ multiple: true, maxImages: maxToPick });
    if (selected.length > 0) {
      setImages((prev) => [...prev, ...selected].slice(0, 4));
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleMoveImage = (fromIndex: number, direction: "left" | "right") => {
    const toIndex = direction === "left" ? fromIndex - 1 : fromIndex + 1;
    if (toIndex < 0 || toIndex >= images.length) return;
    const next = [...images];
    const temp = next[fromIndex];
    next[fromIndex] = next[toIndex];
    next[toIndex] = temp;
    setImages(next);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const onPost = async () => {
    // Text-only, Image-only, or Text + Images allowed
    if (!text.trim() && !pollMode && images.length === 0) {
      setSafetyError("Post must contain text, an image, or a poll.");
      return;
    }

    // Hard constraint: Maximum 4 images per post
    if (images.length > 4) {
      setSafetyError("A single post cannot contain more than 4 images.");
      return;
    }

    setSafetyError("");

    // 1. Rate limit check
    if (!checkRateLimit("post")) {
      setSafetyError("Rate limit reached. Please wait a minute before posting again.");
      return;
    }

    // 2. Safety & Threat Evaluation on text (if present)
    if (text.trim()) {
      const safetyCheck = evaluateContentSafety(text);
      if (!safetyCheck.safe) {
        setSafetyError(safetyCheck.reason || "Content violates safety guidelines.");
        return;
      }
    }

    setSubmitting(true);
    const userId = auth?.currentUser?.uid || "anon-user";
    const userHandle = auth?.currentUser?.displayName || auth?.currentUser?.email?.split("@")[0] || "Anonymous";

    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      // Upload selected images to Firebase Storage
      const uploadedUrls: string[] = [];
      for (let i = 0; i < images.length; i++) {
        const imgUri = images[i];
        if (imgUri.startsWith("http://") || imgUri.startsWith("https://")) {
          uploadedUrls.push(imgUri);
        } else {
          const path = `uploads/${userId}/posts/${Date.now()}_${i}.jpg`;
          const firestoreUrl = await uploadMediaToFirebase(imgUri, path, (progress) => {
            setUploadProgress(progress);
          });
          uploadedUrls.push(firestoreUrl);
        }
      }

      await createPostInFirestore({
        username: userHandle,
        avatarColor: AVATAR_GRADIENTS[0],
        avatarIcon: "flash",
        community: community?.name || "Public Feed",
        communityEmoji: community?.emoji || "🌐",
        text: text.trim(),
        image: uploadedUrls[0] || undefined,
        images: uploadedUrls.length > 0 ? uploadedUrls : undefined,
        userId: userId,
        ...(pollMode && pollOptions.filter(o => o.trim()).length >= 2 ? {
          poll: {
            question: text.trim() || "Community Poll",
            options: pollOptions.filter(o => o.trim()).map(label => ({ label, votes: 0 })),
            total: 0
          }
        } : {})
      });

      router.back();
    } catch (e: any) {
      console.error("Failed to publish post:", e);
      setSafetyError(e.message || "Failed to publish post. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handle = auth?.currentUser?.displayName || auth?.currentUser?.email?.split("@")[0] || "Anonymous";

  return (
    <View style={styles.container} testID="create-post-screen">
      <LinearGradient
        colors={["#0F172A", "#0B1220"]}
        style={StyleSheet.absoluteFillObject}
      />

      <SafeAreaView edges={["top"]} style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn} testID="create-cancel">
          <Ionicons name="close" size={22} color={colors.onSurface} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Post</Text>
        <TouchableOpacity onPress={onPost} disabled={submitting} activeOpacity={0.85} testID="create-post-submit">
          <LinearGradient
            colors={["#06B6D4", "#0284C7"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.postBtn}
          >
            {submitting ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.postBtnText}>Post</Text>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </SafeAreaView>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={0}
      >
        <ScrollView
          contentContainerStyle={{ paddingBottom: 200 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Safety / Validation Error */}
          {safetyError ? (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle" size={16} color="#EF4444" />
              <Text style={styles.errorText}>{safetyError}</Text>
            </View>
          ) : null}

          {/* Author row */}
          <View style={styles.authorRow}>
            <Avatar size={44} gradient={AVATAR_GRADIENTS[0]} icon="flash" />
            <View style={{ marginLeft: spacing.md, flex: 1 }}>
              <Text style={styles.authorName}>@{handle}</Text>
              <View style={styles.anonRow}>
                <Ionicons name="shield-checkmark" size={12} color={colors.success} />
                <Text style={styles.anonText}>Anonymous · always on</Text>
              </View>
            </View>
          </View>

          {/* Text input */}
          <TextInput
            value={text}
            onChangeText={setText}
            placeholder="What's echoing on your mind?"
            placeholderTextColor={colors.onSurfaceDim}
            multiline
            style={styles.textInput}
            testID="create-post-text"
          />

          {/* Attached images preview (up to 4 images with reorder & remove) */}
          {images.length > 0 && (
            <View style={styles.imagePreviewWrap}>
              <Text style={styles.imageCountBadge}>
                {images.length} / 4 Images (Drag/Move & Preview)
              </Text>
              <View style={styles.imagePreviewRow}>
                {images.map((imgUri, idx) => (
                  <View key={idx} style={styles.imageThumbWrap}>
                    <ExpoImage source={{ uri: imgUri }} style={styles.imageThumb} contentFit="cover" />
                    
                    {/* Move controls */}
                    <View style={styles.reorderOverlay}>
                      {idx > 0 && (
                        <TouchableOpacity
                          style={styles.reorderBtn}
                          onPress={() => handleMoveImage(idx, "left")}
                          testID={`move-left-${idx}`}
                        >
                          <Ionicons name="chevron-back" size={12} color="#FFFFFF" />
                        </TouchableOpacity>
                      )}
                      {idx < images.length - 1 && (
                        <TouchableOpacity
                          style={styles.reorderBtn}
                          onPress={() => handleMoveImage(idx, "right")}
                          testID={`move-right-${idx}`}
                        >
                          <Ionicons name="chevron-forward" size={12} color="#FFFFFF" />
                        </TouchableOpacity>
                      )}
                    </View>

                    <TouchableOpacity
                      style={styles.removeImgBtn}
                      onPress={() => handleRemoveImage(idx)}
                      testID={`remove-image-${idx}`}
                    >
                      <Ionicons name="close" size={14} color="#FFFFFF" />
                    </TouchableOpacity>
                  </View>
                ))}
                {images.length < 4 && (
                  <TouchableOpacity style={styles.addMoreImgBtn} onPress={handlePickImage}>
                    <Ionicons name="add" size={24} color={colors.brand} />
                    <Text style={styles.addMoreImgText}>Add Image</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}
          {pollMode && (
            <View style={styles.pollBuilder}>
              <View style={styles.pollHeader}>
                <Ionicons name="stats-chart" size={16} color={colors.brand} />
                <Text style={styles.pollHeaderText}>Poll</Text>
                <View style={{ flex: 1 }} />
                <TouchableOpacity onPress={() => setPollMode(false)}>
                  <Ionicons name="close-circle" size={18} color={colors.onSurfaceDim} />
                </TouchableOpacity>
              </View>
              {pollOptions.map((opt, i) => (
                <View key={i} style={styles.pollField}>
                  <View style={styles.pollDot} />
                  <TextInput
                    value={opt}
                    onChangeText={(v) => updateOption(i, v)}
                    placeholder={`Option ${i + 1}`}
                    placeholderTextColor={colors.onSurfaceDim}
                    style={styles.pollInput}
                    testID={`poll-option-${i}`}
                  />
                </View>
              ))}
              {pollOptions.length < 4 && (
                <TouchableOpacity onPress={addPollOption} style={styles.pollAdd} testID="poll-add-option">
                  <Ionicons name="add-circle" size={18} color={colors.brand} />
                  <Text style={styles.pollAddText}>Add option</Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          {/* Visibility */}
          <Text style={styles.sectionLabel}>Who can see this echo?</Text>
          <View style={styles.visRow}>
            {VISIBILITIES.map((v, i) => {
              const active = i === visibility;
              return (
                <TouchableOpacity
                  key={v.key}
                  onPress={() => setVisibility(i)}
                  style={[styles.visCard, active && styles.visCardActive]}
                  testID={`visibility-${v.key}`}
                >
                  <Ionicons name={v.icon as any} size={18} color={active ? colors.brand : colors.onSurfaceMuted} />
                  <Text style={[styles.visText, active && { color: colors.brand, fontWeight: "700" }]}>{v.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* AI helper */}
          <View style={styles.aiCard}>
            <LinearGradient
              colors={["rgba(6,182,212,0.15)", "rgba(139,92,246,0.05)"]}
              style={StyleSheet.absoluteFillObject}
            />
            <View style={styles.aiIcon}>
              <Ionicons name="sparkles" size={16} color={colors.brand} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.aiTitle}>AI kindness check</Text>
              <Text style={styles.aiSub}>We&apos;ll gently flag anything that reads unkind before you post.</Text>
            </View>
          </View>
        </ScrollView>

        {/* Bottom toolbar */}
        <View style={[styles.toolbar, { paddingBottom: 12 + insets.bottom }]}>
          <LinearGradient
            colors={["rgba(15,23,42,0)", "rgba(15,23,42,0.95)"]}
            style={StyleSheet.absoluteFillObject}
          />
          <View style={styles.toolbarRow}>
            <TouchableOpacity style={styles.toolBtn} onPress={handlePickImage} testID="attach-image-btn">
              <Ionicons name="image-outline" size={22} color={images.length > 0 ? colors.brand : colors.onSurfaceMuted} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.toolBtn, pollMode && styles.toolBtnActive]}
              onPress={() => setPollMode(!pollMode)}
              testID="attach-poll-btn"
            >
              <Ionicons name="stats-chart-outline" size={22} color={pollMode ? colors.brand : colors.onSurfaceMuted} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.toolBtn} testID="attach-emoji-btn">
              <Ionicons name="happy-outline" size={22} color={colors.onSurfaceMuted} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.toolBtn} testID="attach-gif-btn">
              <Ionicons name="film-outline" size={22} color={colors.onSurfaceMuted} />
            </TouchableOpacity>

            <View style={{ flex: 1 }} />

            <View style={styles.anonToggle}>
              <Ionicons name="lock-closed" size={14} color={colors.brand} />
              <Text style={styles.anonToggleText}>Anonymous</Text>
              <View style={styles.switch}>
                <View style={styles.switchThumb} />
              </View>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
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
    paddingBottom: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.divider,
  },
  headerBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.05)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: { ...font.h3, fontSize: 17, color: colors.onSurface },
  communityName: { color: colors.brand, fontWeight: "700", fontSize: 13, marginRight: 4 },
  postBtn: {
    height: 40,
    paddingHorizontal: 20,
    borderRadius: radii.pill,
    alignItems: "center",
    justifyContent: "center",
  },
  postBtnText: { color: "#0F172A", fontWeight: "800", fontSize: 14 },
  authorRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  authorName: { ...font.title, fontSize: 15 },
  anonRow: { flexDirection: "row", alignItems: "center", marginTop: 3 },
  anonText: { ...font.small, color: colors.success, marginLeft: 4, fontWeight: "600" },
  textInput: {
    minHeight: 160,
    fontSize: 18,
    color: colors.onSurface,
    padding: spacing.lg,
    textAlignVertical: "top",
    lineHeight: 26,
  },
  pollBuilder: {
    marginHorizontal: spacing.lg,
    padding: spacing.md,
    backgroundColor: colors.surfaceSecondary,
    borderRadius: radii.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.brandBorder,
    marginBottom: spacing.md,
  },
  pollHeader: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  pollHeaderText: { ...font.title, fontSize: 14, marginLeft: 6 },
  pollField: {
    flexDirection: "row",
    alignItems: "center",
    height: 46,
    borderRadius: radii.md,
    backgroundColor: "rgba(255,255,255,0.05)",
    paddingHorizontal: 12,
    marginTop: 8,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.glassBorder,
  },
  pollDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: colors.brand,
    marginRight: 10,
  },
  pollInput: { flex: 1, color: colors.onSurface, fontSize: 14 },
  pollAdd: { flexDirection: "row", alignItems: "center", marginTop: 10 },
  pollAddText: { color: colors.brand, marginLeft: 6, fontWeight: "600", fontSize: 13 },
  sectionLabel: {
    ...font.caption,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    fontSize: 11,
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  visRow: { flexDirection: "row", gap: 8, paddingHorizontal: spacing.lg },
  visCard: {
    flex: 1,
    height: 74,
    borderRadius: radii.lg,
    backgroundColor: colors.surfaceSecondary,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: "transparent",
  },
  visCardActive: { borderColor: colors.brand, backgroundColor: colors.brandSoft },
  visText: { ...font.caption, marginTop: 6, fontWeight: "600" },
  aiCard: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.xl,
    padding: spacing.md,
    borderRadius: radii.lg,
    flexDirection: "row",
    alignItems: "center",
    overflow: "hidden",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.brandBorder,
    backgroundColor: colors.surfaceSecondary,
  },
  aiIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.brandSoft,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  aiTitle: { ...font.title, fontSize: 13 },
  aiSub: { ...font.small, marginTop: 2 },
  toolbar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingTop: spacing.md,
    paddingHorizontal: spacing.lg,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.divider,
    backgroundColor: colors.surface,
  },
  toolbarRow: { flexDirection: "row", alignItems: "center" },
  toolBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "rgba(255,255,255,0.04)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.glassBorder,
  },
  toolBtnActive: { backgroundColor: colors.brandSoft, borderColor: colors.brandBorder },
  anonToggle: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.brandSoft,
    paddingLeft: 10,
    paddingRight: 4,
    height: 34,
    borderRadius: radii.pill,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.brandBorder,
  },
  anonToggleText: { color: colors.brand, fontWeight: "700", fontSize: 12, marginLeft: 4, marginRight: 8 },
  switch: {
    width: 34,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.brand,
    justifyContent: "center",
    alignItems: "flex-end",
    padding: 2,
  },
  switchThumb: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#FFFFFF",
  },
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    padding: spacing.md,
    backgroundColor: "rgba(239, 68, 68, 0.12)",
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: "rgba(239, 68, 68, 0.3)",
  },
  errorText: {
    color: "#EF4444",
    fontSize: 13,
    fontWeight: "600",
    flex: 1,
  },
  imagePreviewWrap: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  imageCountBadge: {
    color: colors.brand,
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    marginBottom: 8,
  },
  imagePreviewRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  imageThumbWrap: {
    position: "relative",
    width: 85,
    height: 85,
    borderRadius: radii.md,
    overflow: "hidden",
  },
  imageThumb: {
    width: "100%",
    height: "100%",
  },
  reorderOverlay: {
    position: "absolute",
    bottom: 4,
    left: 4,
    flexDirection: "row",
    gap: 4,
  },
  reorderBtn: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "rgba(0,0,0,0.65)",
    alignItems: "center",
    justifyContent: "center",
  },
  removeImgBtn: {
    position: "absolute",
    top: 4,
    right: 4,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "rgba(0,0,0,0.65)",
    alignItems: "center",
    justifyContent: "center",
  },
  addMoreImgBtn: {
    width: 85,
    height: 85,
    borderRadius: radii.md,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: colors.brandBorder,
    backgroundColor: colors.brandSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  addMoreImgText: {
    fontSize: 10,
    fontWeight: "700",
    color: colors.brand,
    marginTop: 2,
  },
});
