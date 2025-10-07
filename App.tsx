import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import {
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { WebView } from "react-native-webview";
import MenuCard from "./MenuCard";
import { generateMenuImage, MenuItem } from "./geminiService";

const imgImageWithFallback =
  "http://localhost:3845/assets/e9c225d16e16f85d26f3d856f1a76b45695452d6.png";
const imgImageWithFallback1 =
  "http://localhost:3845/assets/d17e85401c9e477d4d5bd136e9df0e55cb91ba16.png";

export default function App() {
  const [loading, setLoading] = useState(true);
  const [bistro, setBistro] = useState<MenuItem | null>(null);
  const [vitality, setVitality] = useState<MenuItem | null>(null);
  const [bistroImage, setBistroImage] = useState<string | null>(null);
  const [vitalityImage, setVitalityImage] = useState<string | null>(null);
  const [imageLoading, setImageLoading] = useState(false);

  const handleWebViewMessage = (event: any) => {
    console.log("Received WebView message:", event.nativeEvent.data);
    try {
      const data = JSON.parse(event.nativeEvent.data);
      console.log("Parsed data:", data);

      if (!data.bistro || !data.vitality) {
        console.error("Missing bistro or vitality data in WebView message");
        setLoading(false);
        return;
      }

      const bistroLines = data.bistro
        .split("\n")
        .filter((line: string) => line.trim());
      const vitalityLines = data.vitality
        .split("\n")
        .filter((line: string) => line.trim());

      console.log("Bistro lines:", bistroLines);
      console.log("Vitality lines:", vitalityLines);

      // Handle case where menu data might not be properly formatted
      if (
        !data.bistro ||
        data.bistro === "Bistro menu not found" ||
        !data.vitality ||
        data.vitality === "Vitality menu not found"
      ) {
        console.error("Failed to extract menu data from website");
        setLoading(false);
        return;
      }

      const bistroMenuData = {
        title: bistroLines[0] || "Bistro Menu",
        ingredients: bistroLines.slice(1),
      };
      const vitalityMenuData = {
        title: vitalityLines[0] || "Vitality Menu",
        ingredients: vitalityLines.slice(1),
      };

      console.log("Bistro data:", bistroMenuData);
      console.log("Vitality data:", vitalityMenuData);

      setBistro(bistroMenuData);
      setVitality(vitalityMenuData);
      setLoading(false);
    } catch (error) {
      console.error("Error parsing webview message:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    const generateImages = async () => {
      if (bistro && vitality && !imageLoading) {
        setImageLoading(true);
        try {
          const [bistroImg, vitalityImg] = await Promise.all([
            generateMenuImage(bistro),
            generateMenuImage(vitality),
          ]);
          setBistroImage(bistroImg || imgImageWithFallback);
          setVitalityImage(vitalityImg || imgImageWithFallback1);
        } catch (error) {
          console.error("Error generating images:", error);
          setBistroImage(imgImageWithFallback);
          setVitalityImage(imgImageWithFallback1);
        } finally {
          setImageLoading(false);
        }
      }
    };
    generateImages();
  }, [bistro, vitality, imageLoading]);

  const injectJavaScript = `
    (function() {
      console.log('Injected JavaScript executed');
      console.log('Document ready state:', document.readyState);

      // Extract BISTRO menu from first frame
      const bistroFrame = document.querySelector('.frame1 .containWaitMenu');
      const bistroElement = bistroFrame ? bistroFrame.querySelector('p') : null;

      // Extract VITALITY menu from second frame
      const vitalityFrame = document.querySelector('.frame2 .containWaitMenu');
      const vitalityElement = vitalityFrame ? vitalityFrame.querySelector('p') : null;

      console.log('Bistro frame:', bistroFrame);
      console.log('Vitality frame:', vitalityFrame);
      console.log('Bistro element:', bistroElement);
      console.log('Vitality element:', vitalityElement);

      const bistro = bistroElement ? bistroElement.textContent.trim() : 'Bistro menu not found';
      const vitality = vitalityElement ? vitalityElement.textContent.trim() : 'Vitality menu not found';

      console.log('Bistro content:', bistro);
      console.log('Vitality content:', vitality);

      window.ReactNativeWebView.postMessage(JSON.stringify({bistro, vitality}));
    })();
  `;

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ alignItems: "center" }}
      >
        <WebView
          source={{
            uri: "https://dev2.eldora.ch/ecran/9677-tech/menu/index_wall.php",
          }}
          style={{ flex: 0, opacity: 1, height: 0 }}
          injectedJavaScript={injectJavaScript}
          onMessage={handleWebViewMessage}
          onLoadStart={() => console.log("WebView load started")}
          onLoad={() => console.log("WebView loaded successfully")}
          onLoadEnd={() => console.log("WebView load ended")}
          onError={(syntheticEvent) => {
            const { nativeEvent } = syntheticEvent;
            console.error("WebView error:", nativeEvent);
          }}
          onHttpError={(syntheticEvent) => {
            const { nativeEvent } = syntheticEvent;
            console.error("WebView HTTP error:", nativeEvent);
          }}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          thirdPartyCookiesEnabled={true}
        />
        <View style={styles.app}>
          <View style={styles.mainContainer}>
            <View style={styles.header}>
              <Text style={styles.date}>lundi 6 octobre 2025</Text>
              <Text style={styles.title}>Menu du jour</Text>
            </View>
            <View style={styles.cardsContainer}>
              <MenuCard
                imageUri={bistroImage || imgImageWithFallback}
                badgeText="BISTRO"
                badgeColor="#fb2c36"
                badgeWidth={112.114}
                title={bistro?.title || ""}
                titleColor="#e7000b"
                ingredients={bistro?.ingredients || []}
                stars="⭐⭐⭐⭐⭐"
                rating="4.8"
                loading={loading || imageLoading}
              />
              <MenuCard
                imageUri={vitalityImage || imgImageWithFallback1}
                badgeText="VITALITY"
                badgeColor="#00c950"
                badgeWidth={123.294}
                title={vitality?.title || ""}
                titleColor="#00a63e"
                ingredients={vitality?.ingredients || []}
                stars="⭐⭐⭐⭐☆"
                rating="4.6"
                loading={loading || imageLoading}
              />
            </View>
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.button}
                onPress={() =>
                  Linking.openURL("https://menu.eldora.ch/PDF/#!Menu/9677/")
                }
              >
                <Text style={styles.buttonText}>
                  Voir le menu de la semaine
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
        <StatusBar style="auto" />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#e1e1e1",
  },
  app: {
    width: 375,
    minHeight: 1373,
    position: "relative",
  },
  mainContainer: {
    position: "absolute",
    left: 15.98,
    top: 31.98,
    width: 343.398,
    height: 1309.99,
  },
  header: {
    height: 111.912,
    width: "100%",
    position: "relative",
  },
  date: {
    position: "absolute",
    top: 62.02,
    left: 0,
    right: 0,
    fontSize: 14,
    color: "#4a5565",
    textAlign: "center",
  },
  title: {
    position: "absolute",
    top: 21.02,
    left: 0,
    right: 0,
    fontSize: 24,
    fontWeight: "bold",
    color: "black",
    textAlign: "center",
  },
  cardsContainer: {
    marginTop: 47.983,
  },
  card: {
    height: 454,
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
    backgroundColor: "rgba(251,44,54,0.2)",
  },
  overlay2: {
    backgroundColor: "rgba(0,201,80,0.2)",
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
    width: 112.114,
    backgroundColor: "#fb2c36",
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
  badge2: {
    width: 123.294,
    backgroundColor: "#00c950",
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
    color: "#e7000b",
    lineHeight: 25,
    marginBottom: 11.987,
  },
  dishTitle2: {
    color: "#00a63e",
  },
  ingredients: {
    marginBottom: 27.987,
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
  buttonContainer: {
    marginTop: 47.983,
    alignItems: "center",
  },
  button: {
    width: 237.9,
    height: 66.293,
    backgroundColor: "rgba(255,255,255,0.8)",
    borderWidth: 1.173,
    borderColor: "rgba(229,231,235,0.5)",
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: {
    fontSize: 16,
    color: "#364153",
    textAlign: "center",
  },
});
