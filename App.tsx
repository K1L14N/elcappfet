import React, { useState, useEffect } from "react";
import {
  Text,
  View,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Image,
} from "react-native";
import { MenuCard } from "./components/MenuCard";
import { generateMenuImage, MenuItem } from "./geminiService";

// Menu items data with ingredients
const menuItems: MenuItem[] = [
  {
    title: "Cordon bleu de dinde",
    ingredients: [
      "escalope de dinde",
      "jambon",
      "fromage",
      "chapelure",
      "oeufs",
      "farine",
    ],
  },
  {
    title: "Ananas rôti au miel et au thym",
    ingredients: [
      "escalope de dinde",
      "jambon",
      "fromage",
      "chapelure",
      "oeufs",
      "farine",
    ],
  },
];

export default function App() {
  const [generatedImages, setGeneratedImages] = useState<(string | null)[]>([]);

  useEffect(() => {
    const generateImages = async () => {
      const images = await Promise.all(
        menuItems.map((item) => generateMenuImage(item))
      );
      setGeneratedImages(images);
    };

    generateImages();
  }, []);
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.content}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Menu du jour</Text>
            <View style={styles.dateContainer}>
              <Image
                source={{
                  uri: "https://unsplash.it/16/16",
                }}
                style={styles.calendarIcon}
              />
              <Text style={styles.dateText}>lundi 6 octobre 2025</Text>
            </View>
          </View>

          {/* Menu Cards */}
          <View style={styles.cardsContainer}>
            <MenuCard
              imageUri={generatedImages[0] || undefined}
              menuName={menuItems[0].title}
            />
            <MenuCard
              imageUri={generatedImages[1] || undefined}
              menuName={menuItems[1].title}
            />
          </View>

          {/* Bottom Button */}
          <TouchableOpacity style={styles.bottomButton}>
            <Text style={styles.bottomButtonText}>
              Voir le menu de la semaine
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#e1e1e1",
  },
  container: {
    flex: 1,
    backgroundColor: "#e1e1e1",
    position: "relative",
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 50,
  },
  header: {
    height: 100,
    alignItems: "center",
  },
  dateContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 40,
  },
  calendarIcon: {
    width: 16,
    height: 16,
    marginRight: 8,
  },
  dateText: {
    fontSize: 14,
    color: "#4a5565",
    textTransform: "capitalize",
    fontFamily: "Arial",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#000",
    textAlign: "center",
    fontFamily: "Arial",
  },
  cardsContainer: {
    gap: 50,
  },
  bottomButton: {
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    borderWidth: 1.173,
    borderColor: "rgba(229, 231, 235, 0.5)",
    borderRadius: 20,
    height: 66,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 60,
    marginTop: 20,
  },
  bottomButtonText: {
    fontSize: 16,
    color: "#364153",
    fontFamily: "Arial",
    textAlign: "center",
  },
});
