import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: {
          backgroundColor: "#0a0a0a",
        },
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: "Elcappfet",
        }}
      />
    </Stack>
  );
}
