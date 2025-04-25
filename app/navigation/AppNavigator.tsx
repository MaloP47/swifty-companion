import React, { useContext } from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { AuthContext } from "../../context/AuthContext";
import LoginScreen from "../LoginScreen";
import HomeScreen from "../HomeScreen";
import OtherScreen from "../OtherScreen";

export type RootStackParamList = {
  Login: undefined;
  Home: undefined;
  Other: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  const { user, logout } = useContext(AuthContext)!;

  return (
    <Stack.Navigator>
      {user ? (
        <>
          <Stack.Screen
            name="Home"
            component={HomeScreen}
            options={{ headerTitle: "Accueil" }}
          />
          <Stack.Screen
            name="Other"
            component={OtherScreen}
            options={{ headerTitle: "Autre" }}
          />
        </>
      ) : (
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ headerShown: false }}
        />
      )}
    </Stack.Navigator>
  );
}
