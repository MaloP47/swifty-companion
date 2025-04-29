import React, { useContext, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  TextInput,
  Alert,
} from "react-native";
import { router } from "expo-router";
import { useAuth } from "../context/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import * as SecureStore from "expo-secure-store";

export default function HomeScreen() {
  const { logout, user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");

  const handleLogout = () => {
    logout();
    router.replace("/LoginScreen");
  };

  const handleSearch = async () => {
    const research = searchQuery.trim().toLowerCase();
    if (!research) {
      Alert.alert("Error", "Please enter a username to search");
      return;
    }

    try {
      const token = await SecureStore.getItemAsync("access_token");
      if (!token) {
        throw new Error("No access token found");
      }

      const response = await fetch(
        `https://api.intra.42.fr/v2/users/${research}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("User not found");
      }

      const userData = await response.json();
      router.push({
        pathname: "/OtherScreen",
        params: { userData: JSON.stringify(userData) },
      });
    } catch (error) {
      Alert.alert("Error", "User not found or error fetching user data");
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.backButton} />
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={24} color="black" />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search for a user..."
          placeholderTextColor="#666"
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={handleSearch}
        />
        <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
          <Ionicons name="search" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <View style={styles.profileContainer}>
        <Image
          source={
            user?.imageURL
              ? { uri: user.imageURL }
              : require("../assets/images/randomHacker.jpg")
          }
          style={styles.profileImage}
        />
        <Text style={styles.title}>
          Welcome, {user?.displayname || "User"}!
        </Text>
        <Text style={styles.subtitle}>Login: {user?.login}</Text>
        <Text style={styles.subtitle}>Level: {user?.level}</Text>
        <Text style={styles.subtitle}>Wallet: {user?.wallet || "0"}₳</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "transparent",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  backButton: {
    padding: 10,
  },
  logoutButton: {
    padding: 10,
    color: "blue",
  },
  searchContainer: {
    flexDirection: "row",
    marginBottom: 20,
  },
  searchInput: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 8,
    marginRight: 10,
    color: "#333",
  },
  searchButton: {
    backgroundColor: "#00babc",
    padding: 10,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  profileContainer: {
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    padding: 20,
    borderRadius: 12,
    elevation: 3,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 10,
    color: "#666",
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
