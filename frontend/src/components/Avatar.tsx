import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { StyleSheet, View } from "react-native";

import { shadow } from "../theme";

type Props = {
  size?: number;
  gradient: readonly [string, string];
  icon: string;
  ring?: boolean;
};

export default function Avatar({ size = 44, gradient, icon, ring = false }: Props) {
  const iconSize = Math.round(size * 0.5);
  return (
    <View
      style={[
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          padding: ring ? 2 : 0,
          backgroundColor: ring ? "rgba(6,182,212,0.5)" : "transparent",
        },
        ring && shadow.glow,
      ]}
    >
      <LinearGradient
        colors={gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          styles.avatar,
          {
            width: ring ? size - 4 : size,
            height: ring ? size - 4 : size,
            borderRadius: (ring ? size - 4 : size) / 2,
          },
        ]}
      >
        <Ionicons name={icon as any} size={iconSize} color="#FFFFFF" />
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: {
    alignItems: "center",
    justifyContent: "center",
  },
});
