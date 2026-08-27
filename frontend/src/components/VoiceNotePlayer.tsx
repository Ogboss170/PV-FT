import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useState, useEffect } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";

import { colors, font, radii, spacing } from "@/src/theme";

type VoiceNotePlayerProps = {
  duration?: number;
  audioUrl?: string;
  waveColor?: string;
};

export default function VoiceNotePlayer({
  duration = 18,
  waveColor = colors.brand,
}: VoiceNotePlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  const waveScale = useSharedValue(1);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying) {
      waveScale.value = withRepeat(
        withSequence(withTiming(1.3, { duration: 300 }), withTiming(1.0, { duration: 300 })),
        -1,
        true
      );

      timer = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 1) {
            setIsPlaying(false);
            return 0;
          }
          return prev + 0.05;
        });
      }, 300);
    } else {
      waveScale.value = withTiming(1.0);
    }
    return () => clearInterval(timer);
  }, [isPlaying, waveScale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: waveScale.value }],
  }));

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  const elapsed = Math.floor(progress * duration);

  return (
    <View style={styles.container} testID="voice-note-player">
      <LinearGradient colors={["#1E293B", "#0F172A"]} style={StyleSheet.absoluteFillObject} />

      <TouchableOpacity
        style={styles.playBtn}
        onPress={() => setIsPlaying(!isPlaying)}
        activeOpacity={0.85}
        testID="voice-note-play-btn"
      >
        <LinearGradient colors={["#06B6D4", "#0284C7"]} style={styles.playBtnInner}>
          <Ionicons name={isPlaying ? "pause" : "play"} size={18} color="#0F172A" />
        </LinearGradient>
      </TouchableOpacity>

      <View style={styles.waveformWrap}>
        <View style={styles.waveBars}>
          {[40, 70, 45, 90, 60, 30, 85, 50, 95, 65, 40, 80, 55, 35, 75, 45].map((h, i) => {
            const barProgress = (i + 1) / 16;
            const active = barProgress <= progress;
            return (
              <Animated.View
                key={i}
                style={[
                  styles.bar,
                  { height: h * 0.35 },
                  active ? { backgroundColor: waveColor } : { backgroundColor: "rgba(255,255,255,0.2)" },
                  isPlaying && active && animatedStyle,
                ]}
              />
            );
          })}
        </View>

        <View style={styles.timerRow}>
          <Text style={styles.timeText}>{formatTime(elapsed)}</Text>
          <Text style={styles.timeText}>/ {formatTime(duration)}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surfaceSecondary,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.md,
    borderWidth: 1,
    borderColor: "rgba(6,182,212,0.25)",
    overflow: "hidden",
    marginVertical: spacing.xs,
  },
  playBtn: {
    borderRadius: radii.pill,
    overflow: "hidden",
  },
  playBtnInner: {
    width: 38,
    height: 38,
    justifyContent: "center",
    alignItems: "center",
  },
  waveformWrap: {
    flex: 1,
  },
  waveBars: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    height: 32,
  },
  bar: {
    flex: 1,
    borderRadius: 2,
    minHeight: 4,
  },
  timerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 2,
  },
  timeText: {
    fontFamily: font.family,
    fontSize: 10,
    color: colors.onSurfaceSecondary,
  },
});
