// app/_layout.tsx
import { Stack } from "expo-router";
import { AuthProvider, useAuth } from "../context/AuthContext";
import {
  ActivityIndicator,
  View,
  ImageBackground,
  SafeAreaView,
} from "react-native";
import { StatusBar } from "expo-status-bar";

function RootLayoutNav() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ImageBackground
      source={require("../assets/images/42bis.jpg")}
      style={{ flex: 1 }}
      resizeMode="cover"
    >
      <SafeAreaView style={{ flex: 1 }}>
        <StatusBar style="light" />
        <Stack>
          <Stack.Screen
            name="index"
            options={{ headerShown: false }}
            redirect={!isAuthenticated}
          />
          <Stack.Screen name="LoginScreen" options={{ headerShown: false }} />
          <Stack.Screen name="HomeScreen" options={{ headerShown: false }} />
          <Stack.Screen name="OtherScreen" options={{ headerShown: false }} />
        </Stack>
      </SafeAreaView>
    </ImageBackground>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}
