// app/login.tsx
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  ImageBackground,
} from "react-native";
import { useAuth } from "../context/AuthContext";
import { SafeAreaView } from "react-native-safe-area-context";

export default function LoginScreen() {
  const { login } = useAuth();

  return (
    // <SafeAreaView style={styles.safe}>
    //   <ImageBackground
    //     source={require("../assets/images/42bis.jpg")}
    //     style={{ zIndex: -1000, flex: 1 }}
    //   >
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to Swifty-Companion</Text>
      <TouchableOpacity style={styles.button} onPress={login}>
        <Text style={styles.buttonText}>Login with 42</Text>
      </TouchableOpacity>
    </View>
    //   </ImageBackground>
    // </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    justifyContent: "center",
    paddingTop: Platform.OS === "android" ? -60 : -50,
    paddingBottom: -50,
    backgroundColor: "pink",
  },
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
