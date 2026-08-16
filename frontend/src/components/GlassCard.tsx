import { BlurView } from "expo-blur";
import React from "react";
import { StyleSheet, View, ViewProps } from "react-native";

import { colors, radii } from "../theme";

type Props = ViewProps & {
  intensity?: number;
  radius?: number;
  tint?: string;
  bordered?: boolean;
};

export default function GlassCard({
  children,
  intensity = 40,
  radius = radii.xl,
  tint = colors.glass,
  bordered = true,
  style,
  ...rest
}: Props) {
  return (
    <View
      style={[
        {
          borderRadius: radius,
          overflow: "hidden",
          borderWidth: bordered ? StyleSheet.hairlineWidth : 0,
          borderColor: colors.glassBorder,
        },
        style,
      ]}
      {...rest}
    >
      <BlurView intensity={intensity} tint="dark" style={StyleSheet.absoluteFill} />
      <View
        style={[
          StyleSheet.absoluteFill,
          { backgroundColor: tint },
        ]}
      />
      {children}
    </View>
  );
}
