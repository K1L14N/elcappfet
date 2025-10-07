import React, { useState, useEffect, useRef } from "react";
import {
  Text,
  View,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Modal,
  Alert,
  Dimensions,
} from "react-native";
import { WebView } from "react-native-webview";
import * as Sharing from "expo-sharing";
import { Linking } from "react-native";
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
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [pdfUrl, setPdfUrl] = useState("");
  const [webViewSource, setWebViewSource] = useState<{ uri: string } | null>(
    null
  );
  const webViewRef = useRef<WebView>(null);

  // useEffect(() => {
  //   const generateImages = async () => {
  //     const images = await Promise.all(
  //       menuItems.map((item) => generateMenuImage(item))
  //     );
  //     setGeneratedImages(images); //images
  //   };

  //   generateImages();
  // }, []);

  const handleShowWeeklyMenu = async () => {
    setIsProcessing(true);

    try {
      // Step 1: Load the first URL to trigger PDF generation
      setWebViewSource({ uri: "https://menu.eldora.ch/PDF/#!Menu/9677/" });

      // Set a timeout in case the PDF URL is not detected
      setTimeout(() => {
        if (isProcessing && !showPdfModal) {
          setIsProcessing(false);
          setWebViewSource(null);
          Alert.alert(
            "Erreur",
            "Le PDF n'a pas pu être généré. Veuillez réessayer."
          );
        }
      }, 15000); // 15 second timeout
    } catch (error) {
      setIsProcessing(false);
      setWebViewSource(null);
      Alert.alert("Erreur", "Impossible d'ouvrir le menu. Veuillez réessayer.");
      console.error("Error:", error);
    }
  };

  const handleWebViewNavigation = async (navState: any) => {
    const { url, title, loading } = navState;
    console.log("WebView navigation:", { url, title, loading });

    // When we detect the PDF URL, show the native modal directly
    if (url.includes("PDFSemaineA4_1.pdf") && !showPdfModal && !loading) {
      console.log("PDF URL detected:", url);
      setPdfUrl(url);
      setShowPdfModal(true);
      setIsProcessing(false);
      setWebViewSource(null);
    }
  };

  return (
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
        <TouchableOpacity
          style={styles.bottomButton}
          onPress={handleShowWeeklyMenu}
          disabled={isProcessing}
        >
          <Text style={styles.bottomButtonText}>
            {isProcessing ? "Traitement..." : "Voir le menu de la semaine"}
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Hidden WebView for PDF processing - only loads when source is set */}
      {webViewSource && (
        <View style={{ position: "absolute", width: 1, height: 1, opacity: 0 }}>
          <WebView
            ref={webViewRef}
            source={webViewSource}
            onNavigationStateChange={handleWebViewNavigation}
            javaScriptEnabled={true}
            domStorageEnabled={true}
          />
        </View>
      )}

      {/* Native PDF Modal */}
      <Modal
        visible={showPdfModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => {
          setShowPdfModal(false);
          setWebViewSource(null);
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Menu de la semaine</Text>
            <Text style={styles.modalText}>
              Le PDF du menu a été téléchargé. Voulez-vous l'ouvrir?
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalButtonSecondary}
                onPress={() => {
                  setShowPdfModal(false);
                  setWebViewSource(null);
                }}
              >
                <Text style={styles.modalButtonSecondaryText}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalButtonPrimary}
                onPress={async () => {
                  setShowPdfModal(false);
                  try {
                    console.log("Attempting to open PDF:", pdfUrl);

                    // Try to open the PDF URL directly in the device's default app
                    const supported = await Linking.canOpenURL(pdfUrl);

                    if (supported) {
                      await Linking.openURL(pdfUrl);
                      console.log("PDF opened successfully");
                    } else {
                      // Fallback to sharing if direct opening isn't supported
                      const isSharingAvailable =
                        await Sharing.isAvailableAsync();
                      if (isSharingAvailable) {
                        await Sharing.shareAsync(pdfUrl, {
                          mimeType: "application/pdf",
                          dialogTitle: "Menu de la semaine",
                        });
                      } else {
                        Alert.alert(
                          "Erreur",
                          "Impossible d'ouvrir le PDF. Vous pouvez essayer cette URL dans votre navigateur: " +
                            pdfUrl
                        );
                      }
                    }
                  } catch (error) {
                    console.error("Opening error:", error);
                    Alert.alert(
                      "Erreur",
                      "Impossible d'ouvrir le PDF. Vous pouvez essayer cette URL dans votre navigateur: " +
                        pdfUrl
                    );
                    setWebViewSource(null);
                  }
                }}
              >
                <Text style={styles.modalButtonPrimaryText}>Ouvrir</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
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
  webViewContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  hiddenWebView: {
    width: 1,
    height: 1,
    opacity: 0,
  },
  cancelButton: {
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 20,
  },
  cancelButtonText: {
    color: "#000",
    fontSize: 16,
    fontFamily: "Arial",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    width: "80%",
    maxWidth: 300,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
    textAlign: "center",
    marginBottom: 16,
    fontFamily: "Arial",
  },
  modalText: {
    fontSize: 16,
    color: "#364153",
    textAlign: "center",
    marginBottom: 24,
    fontFamily: "Arial",
    lineHeight: 22,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  modalButtonPrimary: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    flex: 1,
    alignItems: "center",
  },
  modalButtonPrimaryText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "Arial",
    fontWeight: "600",
  },
  modalButtonSecondary: {
    backgroundColor: "#F2F2F7",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    flex: 1,
    alignItems: "center",
  },
  modalButtonSecondaryText: {
    color: "#000",
    fontSize: 16,
    fontFamily: "Arial",
    fontWeight: "600",
  },
});
