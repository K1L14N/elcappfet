/**
 * LoadingState Component
 * Displays skeleton screens while menu data is loading
 */

import React from "react";
import { View, StyleSheet, Animated } from "react-native";

interface LoadingStateProps {
  count?: number; // Number of skeleton cards to show
}

/**
 * Skeleton card that mimics MenuCard structure
 */
const SkeletonCard: React.FC = () => {
  const pulseAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );

    pulse.start();

    return () => {
      pulse.stop();
    };
  }, [pulseAnim]);

  const opacity = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <View style={styles.card}>
      {/* Image skeleton */}
      <Animated.View style={[styles.imageSkeleton, { opacity }]} />

      {/* Content skeleton */}
      <View style={styles.contentContainer}>
        {/* Title and price row */}
        <View style={styles.headerRow}>
          <Animated.View style={[styles.titleSkeleton, { opacity }]} />
          <Animated.View style={[styles.priceSkeleton, { opacity }]} />
        </View>

        {/* Description lines */}
        <Animated.View style={[styles.descriptionSkeleton, { opacity }]} />
        <Animated.View style={[styles.descriptionSkeletonShort, { opacity }]} />

        {/* Tags */}
        <View style={styles.tagsContainer}>
          <Animated.View style={[styles.tagSkeleton, { opacity }]} />
          <Animated.View style={[styles.tagSkeleton, { opacity }]} />
        </View>
      </View>
    </View>
  );
};

/**
 * LoadingState displays multiple skeleton cards
 */
export const LoadingState: React.FC<LoadingStateProps> = ({ count = 2 }) => {
  return (
    <View style={styles.container}>
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonCard key={index} />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 16,
    paddingBottom: 24,
  },
  card: {
    backgroundColor: "#0a0a0a",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#262626",
    overflow: "hidden",
  },
  imageSkeleton: {
    width: "100%",
    height: 257,
    backgroundColor: "#1a1a1a",
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
  titleSkeleton: {
    width: "60%",
    height: 20,
    backgroundColor: "#1a1a1a",
    borderRadius: 4,
  },
  priceSkeleton: {
    width: 60,
    height: 28,
    backgroundColor: "#1a1a1a",
    borderRadius: 10,
  },
  descriptionSkeleton: {
    width: "100%",
    height: 16,
    backgroundColor: "#1a1a1a",
    borderRadius: 4,
  },
  descriptionSkeletonShort: {
    width: "70%",
    height: 16,
    backgroundColor: "#1a1a1a",
    borderRadius: 4,
  },
  tagsContainer: {
    flexDirection: "row",
    gap: 8,
  },
  tagSkeleton: {
    width: 80,
    height: 24,
    backgroundColor: "#1a1a1a",
    borderRadius: 8,
  },
});
