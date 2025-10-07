import React from "react";
import { Text, View, Image, StyleSheet } from "react-native";

interface MenuCardProps {
  imageUri?: string;
  menuName: string;
  bistroIconUri?: string;
}

export const MenuCard: React.FC<MenuCardProps> = ({
  imageUri = "https://unsplash.it/343/224",
  menuName,
  bistroIconUri = "https://unsplash.it/16/16",
}) => {
  return (
    <View style={styles.card}>
      <View style={styles.menuCard}>
        <Image source={{ uri: imageUri }} style={styles.menuImage} />
        <View style={styles.bistroBadge}>
          <Image source={{ uri: bistroIconUri }} style={styles.bistroIcon} />
          <Text style={styles.bistroText}>BISTRO</Text>
        </View>
      </View>
      <View style={styles.cardContent}>
        <Text style={styles.menuName} numberOfLines={2}>
          {menuName}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 25,
    },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 25,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "rgba(229, 231, 235, 0.5)",
  },
  menuCard: {
    height: 224,
    position: "relative",
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
    overflow: "hidden",
  },
  menuImage: {
    width: "100%",
    height: "100%",
    position: "absolute",
  },
  bistroBadge: {
    position: "absolute",
    top: 16,
    left: 16,
    backgroundColor: "#fb2c36",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 10,
  },
  bistroIcon: {
    width: 16,
    height: 16,
  },
  bistroText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    fontFamily: "Arial",
    letterSpacing: 0.4,
  },
  cardContent: {
    padding: 24,
    paddingTop: 20,
    minHeight: 80,
    justifyContent: "center",
  },
  menuName: {
    fontSize: 20,
    color: "#e7000b",
    fontFamily: "Arial",
    lineHeight: 25,
  },
});
