/**
 * ErrorState Component
 * Displays error messages with retry functionality
 */

import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
  showRetry?: boolean;
}

/**
 * ErrorState displays error message and optional retry button
 */
export const ErrorState: React.FC<ErrorStateProps> = ({
  message,
  onRetry,
  showRetry = true,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Text style={styles.iconText}>⚠️</Text>
      </View>

      <Text style={styles.title}>Oops! Something went wrong</Text>

      <Text style={styles.message}>{message}</Text>

      {showRetry && onRetry && (
        <TouchableOpacity
          style={styles.retryButton}
          onPress={onRetry}
          activeOpacity={0.8}
        >
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      )}

      <Text style={styles.hint}>Pull down to refresh or try again later</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
    paddingVertical: 48,
    gap: 16,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(250, 250, 250, 0.05)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  iconText: {
    fontSize: 40,
  },
  title: {
    fontSize: 20,
    lineHeight: 28,
    color: "#fafafa",
    fontWeight: "500",
    textAlign: "center",
  },
  message: {
    fontSize: 16,
    lineHeight: 24,
    color: "#a1a1a1",
    textAlign: "center",
    maxWidth: 300,
  },
  retryButton: {
    marginTop: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: "#fafafa",
    borderRadius: 10,
    minWidth: 120,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#0a0a0a",
    textAlign: "center",
  },
  hint: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 20,
    color: "#737373",
    textAlign: "center",
  },
});
