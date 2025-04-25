// app/index.tsx
import { Redirect } from "expo-router";
import { useAuth } from "../context/AuthContext";

export default function Index() {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Redirect href="/HomeScreen" />;
  }

  return <Redirect href="/LoginScreen" />;
}
