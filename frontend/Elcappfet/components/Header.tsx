import React from "react";
import { View, Text, StyleSheet } from "react-native";

const ClockIcon = () => (
  <View style={styles.icon}>
    <Text style={styles.iconText}>🕐</Text>
  </View>
);

const LocationIcon = () => (
  <View style={styles.icon}>
    <Text style={styles.iconText}>📍</Text>
  </View>
);

export const Header: React.FC = () => {
  return (
    <View style={styles.container}>
      <View style={styles.titleContainer}>
        <Text style={styles.title}>Elcappfet</Text>
        <Text style={styles.subtitle}>Office Cafeteria Menu</Text>
      </View>

      <View style={styles.infoContainer}>
        <View style={styles.infoItem}>
          <ClockIcon />
          <Text style={styles.infoText}>7:30 AM - 6:00 PM</Text>
        </View>

        <View style={styles.infoItem}>
          <LocationIcon />
          <Text style={styles.infoText}>Building A, Level 2</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "rgba(10, 10, 10, 0.8)",
    borderBottomWidth: 1,
    borderBottomColor: "#262626",
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 16,
    gap: 16,
  },
  titleContainer: {
    gap: 8,
    alignItems: "center",
  },
  title: {
    fontSize: 30,
    lineHeight: 36,
    color: "#fafafa",
    fontWeight: "400",
    letterSpacing: -0.75,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    color: "#a1a1a1",
    fontWeight: "400",
    textAlign: "center",
  },
  infoContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 16,
    flexWrap: "wrap",
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  icon: {
    width: 12,
    height: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  iconText: {
    fontSize: 10,
  },
  infoText: {
    fontSize: 12,
    lineHeight: 16,
    color: "#a1a1a1",
    fontWeight: "400",
  },
});
