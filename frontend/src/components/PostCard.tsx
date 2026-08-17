import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { colors, font, radii, shadow, spacing } from "../theme";
import Avatar from "./Avatar";
import { Post } from "../mockData";
import { toggleLikePost, voteOnPollInFirestore } from "../services/postService";
import { auth } from "../firebase";

type Props = { post: Post };

export default function PostCard({ post }: Props) {
  const router = useRouter();
  const [liked, setLiked] = useState(!!post.liked);
  const [saved, setSaved] = useState(!!post.saved);
  const [likes, setLikes] = useState(post.likes);
  const [pollVote, setPollVote] = useState<number | null>(null);

  const onLike = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const newLikedState = !liked;
    setLiked(newLikedState);
    setLikes((c) => (liked ? c - 1 : c + 1));

    const userId = auth.currentUser?.uid || "anon-user";
    toggleLikePost(post.id, userId, liked).catch(console.error);
  };
  const onSave = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSaved((v) => !v);
  };

  const handlePollVote = (idx: number) => {
    if (pollVote === null && post.poll) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setPollVote(idx);
      voteOnPollInFirestore(post.id, idx, post.poll).catch(console.error);
    }
  };

  const pollTotal = post.poll
    ? post.poll.total + (pollVote !== null ? 1 : 0)
    : 0;

  return (
    <TouchableOpacity
      activeOpacity={0.92}
      onPress={() => router.push({ pathname: "/post/[id]", params: { id: post.id } } as any)}
      style={styles.card}
      testID={`post-card-${post.id}`}
    >
      {/* Header */}
      <View style={styles.header}>
        <Avatar size={40} gradient={post.avatarColor} icon={post.avatarIcon} />
        <View style={{ marginLeft: spacing.md, flex: 1 }}>
          <View style={styles.nameRow}>
            <Text style={styles.username}>{post.username}</Text>
            <View style={styles.dot} />
            <Text style={styles.time}>{post.time}</Text>
          </View>
          <View style={styles.communityChip}>
            <Text style={styles.communityEmoji}>{post.communityEmoji}</Text>
            <Text style={styles.communityText}>{post.community}</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.moreBtn} testID={`post-more-${post.id}`}>
          <Ionicons name="ellipsis-horizontal" size={18} color={colors.onSurfaceMuted} />
        </TouchableOpacity>
      </View>

      {/* Text */}
      <Text style={styles.text}>{post.text}</Text>

      {/* Image */}
      {post.image ? (
        <View style={styles.imageWrap}>
          <Image
            source={{ uri: post.image }}
            style={styles.image}
            contentFit="cover"
            transition={300}
          />
        </View>
      ) : null}

      {/* Poll */}
      {post.poll ? (
        <View style={styles.pollWrap}>
          {post.poll.options.map((opt, idx) => {
            const votes = opt.votes + (pollVote === idx ? 1 : 0);
            const pct = pollTotal > 0 ? Math.round((votes / pollTotal) * 100) : 0;
            const isPicked = pollVote === idx;
            return (
              <TouchableOpacity
                key={idx}
                activeOpacity={0.85}
                onPress={() => handlePollVote(idx)}
                style={styles.pollRow}
                testID={`post-poll-${post.id}-${idx}`}
              >
                <LinearGradient
                  colors={isPicked ? ["rgba(6,182,212,0.35)", "rgba(6,182,212,0.10)"] : ["rgba(148,163,184,0.15)", "rgba(148,163,184,0.05)"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[
                    StyleSheet.absoluteFillObject,
                    { borderRadius: radii.md, width: `${pollVote !== null ? pct : 0}%` },
                  ]}
                />
                <View style={styles.pollRowInner}>
                  <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
                    {isPicked && (
                      <Ionicons name="checkmark-circle" size={16} color={colors.brand} style={{ marginRight: 6 }} />
                    )}
                    <Text style={[styles.pollLabel, isPicked && { color: colors.brand, fontWeight: "700" }]} numberOfLines={1}>
                      {opt.label}
                    </Text>
                  </View>
                  {pollVote !== null && <Text style={styles.pollPct}>{pct}%</Text>}
                </View>
              </TouchableOpacity>
            );
          })}
          <Text style={styles.pollMeta}>{pollTotal.toLocaleString()} votes · {pollVote !== null ? "Voted" : "Tap to vote"}</Text>
        </View>
      ) : null}

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionBtn} onPress={onLike} testID={`post-like-${post.id}`}>
          <Ionicons
            name={liked ? "heart" : "heart-outline"}
            size={22}
            color={liked ? "#EC4899" : colors.onSurfaceMuted}
          />
          <Text style={[styles.actionText, liked && { color: "#EC4899" }]}>{likes.toLocaleString()}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} testID={`post-comment-${post.id}`}>
          <Ionicons name="chatbubble-outline" size={20} color={colors.onSurfaceMuted} />
          <Text style={styles.actionText}>{post.comments}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} testID={`post-repost-${post.id}`}>
          <Ionicons name="repeat-outline" size={22} color={colors.onSurfaceMuted} />
          <Text style={styles.actionText}>{post.reposts}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} testID={`post-share-${post.id}`}>
          <Ionicons name="paper-plane-outline" size={19} color={colors.onSurfaceMuted} />
        </TouchableOpacity>
        <View style={{ flex: 1 }} />
        <TouchableOpacity onPress={onSave} testID={`post-save-${post.id}`}>
          <Ionicons
            name={saved ? "bookmark" : "bookmark-outline"}
            size={20}
            color={saved ? colors.brand : colors.onSurfaceMuted}
          />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surfaceSecondary,
    borderRadius: radii.xl,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.glassBorder,
    ...shadow.card,
  },
  header: { flexDirection: "row", alignItems: "center" },
  nameRow: { flexDirection: "row", alignItems: "center" },
  username: { ...font.title, fontSize: 15 },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: colors.onSurfaceDim,
    marginHorizontal: 8,
  },
  time: { ...font.small },
  communityChip: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
    alignSelf: "flex-start",
    backgroundColor: colors.brandSoft,
    borderRadius: radii.pill,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.brandBorder,
  },
  communityEmoji: { fontSize: 11, marginRight: 4 },
  communityText: { ...font.small, color: colors.brand, fontWeight: "600" },
  moreBtn: { padding: 6 },
  text: { ...font.body, marginTop: spacing.md },
  imageWrap: {
    marginTop: spacing.md,
    borderRadius: radii.lg,
    overflow: "hidden",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.glassBorder,
  },
  image: { width: "100%", height: 220, backgroundColor: colors.surfaceTertiary },
  pollWrap: { marginTop: spacing.md },
  pollRow: {
    height: 44,
    borderRadius: radii.md,
    marginBottom: 8,
    overflow: "hidden",
    backgroundColor: "rgba(148,163,184,0.08)",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.glassBorder,
  },
  pollRowInner: {
    flex: 1,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  pollLabel: { ...font.body, fontSize: 14 },
  pollPct: { ...font.caption, color: colors.onSurface, fontWeight: "700" },
  pollMeta: { ...font.small, marginTop: 4 },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.divider,
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: spacing.xl,
  },
  actionText: { ...font.caption, marginLeft: 6, fontWeight: "600" },
});
