import { StatusBar } from "expo-status-bar";
import { Image, StyleSheet, Text, View } from "react-native";

const menuOptions = [
  {
    tag: "BISTRO",
    name: "Grilled Chicken Salad",
    image: "https://via.placeholder.com/150",
    rating: 4.5,
  },
  {
    tag: "VITALITY",
    name: "Quinoa Veggie Bowl",
    image: "https://via.placeholder.com/150",
    rating: 4.0,
  },
];

export default function App() {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Elcappfet</Text>
      <Text style={styles.subheader}>Today's Lunch Menu</Text>
      <View style={styles.cardsContainer}>
        {menuOptions.map((option, index) => (
          <View key={index} style={styles.card}>
            <Image source={{ uri: option.image }} style={styles.image} />
            <Text style={styles.tag}>{option.tag}</Text>
            <Text style={styles.name}>{option.name}</Text>
            <View style={styles.ratingContainer}>
              {Array.from({ length: 5 }, (_, i) => (
                <Text key={i} style={styles.star}>
                  {i < Math.floor(option.rating) ? "★" : "☆"}
                </Text>
              ))}
              <Text style={styles.ratingText}> ({option.rating})</Text>
            </View>
          </View>
        ))}
      </View>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
  },
  subheader: {
    fontSize: 18,
    textAlign: "center",
    marginBottom: 20,
  },
  cardsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  card: {
    backgroundColor: "#f0f0f0",
    borderRadius: 10,
    padding: 10,
    width: "45%",
    alignItems: "center",
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 10,
    marginBottom: 10,
  },
  tag: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  name: {
    fontSize: 14,
    textAlign: "center",
    marginVertical: 5,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  star: {
    fontSize: 16,
    color: "#ffcc00",
  },
  ratingText: {
    fontSize: 14,
    color: "#333",
  },
});
