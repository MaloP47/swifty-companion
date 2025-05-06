import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from "react-native";
import { useAuth } from "../context/AuthContext";
import { router } from "expo-router";

export default function LoginScreen() {
  const { login, isAuthenticated } = useAuth();

  const handleLogin = async () => {
    await login();
    if (isAuthenticated) {
        router.replace("/HomeScreen");
    }
  }

  return (

    <View style={styles.container}>
      <Text style={styles.title}>Welcome to Swifty-Companion</Text>
      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Login with 42</Text>
      </TouchableOpacity>
    </View>

  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    // backgroundColor: "#f5f5f5",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 30,
    color: "#333",
    textAlign: "center",
  },
  button: {
    backgroundColor: "#00babc",
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 8,
    elevation: 3,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});
