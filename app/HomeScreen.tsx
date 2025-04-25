// app/home.tsx
import React, { useContext } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";
import { router } from "expo-router";
import { useAuth } from "../context/AuthContext";


export default function HomeScreen() {
  const { logout, user } = useAuth();

  const handleLogout = () => {
    logout();
    router.replace("/LoginScreen");
  };

  return (
    <View style={styles.container}>
      <Image
        source={
          user?.imageURL
            ? { uri: user.imageURL }
            : require("../assets/images/randomHacker.jpg")
        }
        style={styles.profileImage}
      />
      <Text style={styles.title}>Welcome, {user?.displayname || "User"}!</Text>
      <Text style={styles.title}>Login: {user?.login}</Text>
      <Text style={styles.title}>Level: {user?.level}</Text>
      <Text style={styles.title}>Wallet: {user?.wallet || "0"}₳</Text>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => router.push("/OtherScreen")}
        >
          <Text style={styles.buttonText}>Go to Other Screen</Text>
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
    marginBottom: 30,
    color: "#333",
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
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: "#00babc",
  },
});
