import React from "react";
import { View, Text, StyleSheet } from "react-native";

export const Footer: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Fresh ingredients • Made to order</Text>
      <Text style={styles.text}>Questions? Contact cafeteria@company.com</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderTopWidth: 1,
    borderTopColor: "#262626",
    paddingTop: 25,
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 4,
    alignItems: "center",
  },
  text: {
    fontSize: 12,
    lineHeight: 16,
    color: "#a1a1a1",
    fontWeight: "400",
    textAlign: "center",
  },
});
