import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  StatusBar,
  RefreshControl,
} from "react-native";
import { Header } from "../components/Header";
import { DayFilter } from "../components/DayFilter";
import { MenuCard } from "../components/MenuCard";
import { Footer } from "../components/Footer";
import { LoadingState } from "../components/LoadingState";
import { ErrorState } from "../components/ErrorState";
import { useMenu } from "../hooks/useMenu";
import { DAY_NAMES_EN } from "../utils/constants";

export default function Index() {
  const [selectedDay, setSelectedDay] = useState(0);
  const { loading, error, data, weekInfo, refreshing, refetch } =
    useMenu(selectedDay);

  // Render loading state
  if (loading && !data) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" />
        <View style={styles.container}>
          <Header />
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.content}>
              <DayFilter
                selectedDay={selectedDay}
                onDaySelect={setSelectedDay}
              />
              <View style={styles.dayHeader}>
                <Text style={styles.dayTitle}>{DAY_NAMES_EN[selectedDay]}</Text>
              </View>
              <LoadingState count={2} />
            </View>
          </ScrollView>
        </View>
      </SafeAreaView>
    );
  }

  // Render error state (without cached data)
  if (error && !data) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" />
        <View style={styles.container}>
          <Header />
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={refetch}
                tintColor="#fafafa"
                colors={["#fafafa"]}
              />
            }
          >
            <View style={styles.content}>
              <DayFilter
                selectedDay={selectedDay}
                onDaySelect={setSelectedDay}
              />
              <ErrorState message={error} onRetry={refetch} />
            </View>
          </ScrollView>
        </View>
      </SafeAreaView>
    );
  }

  const menuItems = data || [];

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />
      <View style={styles.container}>
        <Header />

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={refetch}
              tintColor="#fafafa"
              colors={["#fafafa"]}
            />
          }
        >
          <View style={styles.content}>
            <DayFilter selectedDay={selectedDay} onDaySelect={setSelectedDay} />

            <View style={styles.dayHeader}>
              <Text style={styles.dayTitle}>{DAY_NAMES_EN[selectedDay]}</Text>
              {weekInfo && <Text style={styles.weekInfo}>{weekInfo}</Text>}
              <Text style={styles.daySubtitle}>
                {menuItems.length} item{menuItems.length !== 1 ? "s" : ""}{" "}
                available today
              </Text>
            </View>

            {error && (
              <View style={styles.errorBanner}>
                <Text style={styles.errorBannerText}>⚠️ {error}</Text>
              </View>
            )}

            {menuItems.length > 0 ? (
              <View style={styles.menuList}>
                {menuItems.map((item) => (
                  <MenuCard key={item.id} item={item} />
                ))}
              </View>
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>
                  No menu items available for this day
                </Text>
              </View>
            )}
          </View>

          <Footer />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#0a0a0a",
  },
  container: {
    flex: 1,
    backgroundColor: "#0a0a0a",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 24,
    gap: 24,
  },
  dayHeader: {
    gap: 4,
  },
  dayTitle: {
    fontSize: 20,
    lineHeight: 28,
    color: "#fafafa",
    fontWeight: "400",
  },
  daySubtitle: {
    fontSize: 14,
    lineHeight: 20,
    color: "#a1a1a1",
    fontWeight: "400",
  },
  weekInfo: {
    fontSize: 12,
    lineHeight: 16,
    color: "#737373",
    fontWeight: "400",
    marginTop: 2,
  },
  errorBanner: {
    backgroundColor: "rgba(239, 68, 68, 0.1)",
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: "rgba(239, 68, 68, 0.2)",
  },
  errorBannerText: {
    fontSize: 14,
    lineHeight: 20,
    color: "#ef4444",
    textAlign: "center",
  },
  menuList: {
    gap: 16,
    paddingBottom: 24,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 48,
  },
  emptyStateText: {
    fontSize: 16,
    color: "#a1a1a1",
    textAlign: "center",
  },
});
