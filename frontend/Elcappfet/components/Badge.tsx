import React from "react";
import { View, Text, StyleSheet, ViewStyle } from "react-native";

interface BadgeProps {
  label: string;
  variant?: "category" | "dietary";
  style?: ViewStyle;
}

export const Badge: React.FC<BadgeProps> = ({
  label,
  variant = "dietary",
  style,
}) => {
  const isCategory = variant === "category";

  return (
    <View
      style={[
        styles.badge,
        isCategory ? styles.categoryBadge : styles.dietaryBadge,
        style,
      ]}
    >
      <Text style={styles.badgeText}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  categoryBadge: {
    backgroundColor: "rgba(10, 10, 10, 0.8)",
    borderWidth: 1,
    borderColor: "transparent",
  },
  dietaryBadge: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#262626", // neutral-800
  },
  badgeText: {
    color: "#fafafa", // neutral-50
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "400",
  },
});
