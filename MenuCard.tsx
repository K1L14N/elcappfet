import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";

interface MenuCardProps {
  imageUri: string;
  badgeText: string;
  badgeColor: string;
  badgeWidth: number;
  title: string;
  titleColor: string;
  ingredients: string[];
  stars: string;
  rating: string;
  loading?: boolean;
}

const MenuCard: React.FC<MenuCardProps> = ({
  imageUri,
  badgeText,
  badgeColor,
  badgeWidth,
  title,
  titleColor,
  ingredients,
  stars,
  rating,
  loading = false,
}) => {
  if (loading) {
    return (
      <View style={[styles.card, styles.loadingCard]}>
        <Text style={styles.loadingText}>Loading menu...</Text>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <View style={styles.menuCard}>
        <Image source={{ uri: imageUri }} style={styles.image} />
        <View style={[styles.overlay]} />
        <View style={styles.gradient} />
        <View
          style={[
            styles.badge,
            { backgroundColor: badgeColor, width: badgeWidth },
          ]}
        >
          <Text style={styles.badgeText}>{badgeText}</Text>
        </View>
      </View>
      <View style={styles.cardContent}>
        <Text style={[styles.dishTitle, { color: titleColor }]}>{title}</Text>
        <View style={styles.ingredients}>
          {ingredients.map((ingredient, index) => (
            <Text key={index} style={styles.ingredient}>
              • {ingredient}
            </Text>
          ))}
        </View>
        <View style={styles.rating}>
          <Text style={styles.stars}>{stars}</Text>
          <Text style={styles.ratingText}>{rating}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: "100%",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(229,231,235,0.5)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 25 },
    shadowOpacity: 0.25,
    shadowRadius: 50,
    elevation: 5,
    overflow: "hidden",
    marginBottom: 31.983,
  },
  menuCard: {
    height: 223.989,
    width: "100%",
    position: "relative",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  gradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 79.984,
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  badge: {
    position: "absolute",
    top: 15.98,
    left: 15.98,
    borderRadius: 20,
    paddingHorizontal: 15.982,
    paddingVertical: 7.991,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  badgeText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "white",
    letterSpacing: 0.4,
  },
  cardContent: {
    paddingTop: 27.987,
    paddingHorizontal: 23.991,
  },
  dishTitle: {
    fontSize: 20,
    lineHeight: 25,
    marginBottom: 11.987,
  },
  ingredients: {
    marginBottom: 15,
  },
  ingredient: {
    fontSize: 16,
    color: "#4a5565",
    lineHeight: 26,
    marginBottom: 7.991,
  },
  rating: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  stars: {
    fontSize: 24,
    color: "#fbbf24",
    marginRight: 10,
  },
  ratingText: {
    fontSize: 24,
    color: "#4a5565",
  },
  loadingCard: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  loadingText: {
    fontSize: 18,
    color: "#666",
  },
});

export default MenuCard;
