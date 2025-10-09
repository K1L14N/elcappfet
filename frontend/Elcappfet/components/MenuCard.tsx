import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ImageSourcePropType,
} from "react-native";
import { Badge } from "./Badge";

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl?: string;
  dietaryTags?: string[];
}

interface MenuCardProps {
  item: MenuItem;
}

export const MenuCard: React.FC<MenuCardProps> = ({ item }) => {
  return (
    <View style={styles.card}>
      <View style={styles.imageContainer}>
        {item.imageUrl ? (
          <Image
            source={{ uri: item.imageUrl }}
            style={styles.image}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.imagePlaceholder} />
        )}
        <View style={styles.categoryBadgeContainer}>
          <Badge label={item.category} variant="category" />
        </View>
      </View>

      <View style={styles.contentContainer}>
        <View style={styles.headerRow}>
          <Text style={styles.title} numberOfLines={1}>
            {item.name}
          </Text>
          <View style={styles.priceContainer}>
            <Text style={styles.price}>CHF {item.price.toFixed(2)}</Text>
          </View>
        </View>

        <Text style={styles.description} numberOfLines={2}>
          {item.description}
        </Text>

        {item.dietaryTags && item.dietaryTags.length > 0 && (
          <View style={styles.tagsContainer}>
            {item.dietaryTags.map((tag, index) => (
              <Badge
                key={index}
                label={tag}
                variant="dietary"
                style={styles.dietaryBadge}
              />
            ))}
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#0a0a0a", // neutral-950
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#262626", // neutral-800
    overflow: "hidden",
  },
  imageContainer: {
    width: "100%",
    height: 257,
    position: "relative",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  imagePlaceholder: {
    width: "100%",
    height: "100%",
    backgroundColor: "#262626",
  },
  categoryBadgeContainer: {
    position: "absolute",
    top: 14,
    left: 12,
  },
  contentContainer: {
    padding: 16,
    gap: 12,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    flex: 1,
    fontSize: 18,
    lineHeight: 28,
    color: "#fafafa", // neutral-50
    fontWeight: "400",
    marginRight: 8,
  },
  priceContainer: {
    backgroundColor: "rgba(250, 250, 250, 0.1)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    minWidth: 58,
    alignItems: "center",
  },
  price: {
    fontSize: 18,
    lineHeight: 28,
    color: "#fafafa",
    fontWeight: "400",
  },
  description: {
    fontSize: 14,
    lineHeight: 22.75,
    color: "#a1a1a1", // neutral-400
    fontWeight: "400",
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  dietaryBadge: {
    marginRight: 0,
  },
});
