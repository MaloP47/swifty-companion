// app/other.tsx
import React, { useContext } from "react";
import { View, Text, Button, StyleSheet, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router"; // hook router :contentReference[oaicite:4]{index=4}
import { AuthContext } from "./context/AuthContext";
import { router } from "expo-router";
import { useAuth } from "./context/AuthContext";

export default function OtherScreen() {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    router.replace("/LoginScreen");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Other Screen</Text>
      <Text style={styles.subtitle}>Logged in as: {user?.login || "User"}</Text>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={() => router.back()}>
          <Text style={styles.buttonText}>Go Back to Home</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.logoutButton]}
          onPress={handleLogout}
        >
          <Text style={styles.buttonText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 30,
    color: "#666",
  },
  buttonContainer: {
    width: "100%",
    gap: 20,
  },
  button: {
    backgroundColor: "#00babc",
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 8,
    elevation: 3,
    alignItems: "center",
  },
  logoutButton: {
    backgroundColor: "#ff4444",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});
