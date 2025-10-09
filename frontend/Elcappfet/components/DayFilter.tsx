import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { DAY_NAMES_SHORT } from "../utils/constants";

// Only weekdays (Monday-Friday)
const DAYS = DAY_NAMES_SHORT;

interface DayFilterProps {
  selectedDay: number; // 0-6 for Mon-Sun
  onDaySelect: (dayIndex: number) => void;
}

export const DayFilter: React.FC<DayFilterProps> = ({
  selectedDay,
  onDaySelect,
}) => {
  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {DAYS.map((day, index) => {
          const isSelected = selectedDay === index;
          return (
            <TouchableOpacity
              key={day}
              style={[styles.dayButton, isSelected && styles.dayButtonSelected]}
              onPress={() => onDaySelect(index)}
              activeOpacity={0.7}
            >
              <Text
                style={[styles.dayText, isSelected && styles.dayTextSelected]}
              >
                {day}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#262626", // neutral-800
    borderRadius: 14,
    height: 48,
    overflow: "hidden",
  },
  scrollContent: {
    paddingHorizontal: 4,
    paddingVertical: 4,
    gap: 4,
    alignItems: "center",
  },
  dayButton: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    minWidth: 48,
  },
  dayButtonSelected: {
    backgroundColor: "#fafafa", // neutral-50
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 6,
  },
  dayText: {
    fontSize: 14,
    lineHeight: 20,
    color: "#a1a1a1", // neutral-400
    fontWeight: "400",
  },
  dayTextSelected: {
    color: "#0a0a0a", // neutral-900
    fontWeight: "400",
  },
});
