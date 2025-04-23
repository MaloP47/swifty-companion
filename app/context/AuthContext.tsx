import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import * as SecureStore from "expo-secure-store";
import Constants from "expo-constants";
import * as WebBrowser from "expo-web-browser";
import {
  makeRedirectUri,
  useAuthRequest,
  exchangeCodeAsync,
} from "expo-auth-session";
import { Platform } from "react-native";

WebBrowser.maybeCompleteAuthSession();

interface User {
  name: string;
  login: string;
  // Add other user properties as needed
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: () => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loginAttempted, setLoginAttempted] = useState(false);

  const SCOPES = Constants.expoConfig?.extra?.SCOPES;
  const CLIENT_ID = Constants.expoConfig?.extra?.UID;
  const CLIENT_SECRET = Constants.expoConfig?.extra?.SECRET;

  const discovery = {
    authorizationEndpoint: "https://api.intra.42.fr/oauth/authorize",
    tokenEndpoint: "https://api.intra.42.fr/oauth/token",
  };

  const redirectUri = makeRedirectUri({
    scheme: Constants.expoConfig!.scheme as string,
    path: "/",
  });

  const [request, response, promptAsync] = useAuthRequest(
    {
      clientId: CLIENT_ID,
      scopes: SCOPES.split(" "),
      redirectUri,
    },
    discovery
  );

  useEffect(() => {
    (async () => {
      const token = await SecureStore.getItemAsync("access_token");
      if (token) {
        await fetchUserInfo(token);
      }
      setIsLoading(false);
    })();
  }, []);

  useEffect(() => {
    if (response?.type === "success" && response.params.code) {
      (async () => {
        try {
          const tokenResponse = await exchangeCodeAsync(
            {
              code: response.params.code,
              clientId: CLIENT_ID,
              clientSecret: CLIENT_SECRET,
              redirectUri,
            },
            discovery
          );

          if (tokenResponse.accessToken) {
            await SecureStore.setItemAsync(
              "access_token",
              tokenResponse.accessToken
            );
            await fetchUserInfo(tokenResponse.accessToken);
          }
        } catch (error) {
          console.error("Token exchange error:", error);
        }
      })();
    }
  }, [response]);

  const fetchUserInfo = async (token: string) => {
    try {
      const resp = await fetch("https://api.intra.42.fr/v2/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data: User = await resp.json();
      setUser({ name: data.login, login: data.login });
      setIsAuthenticated(true);
      setLoginAttempted(false);
    } catch (error) {
      console.error("Fetch user info error:", error);
      await SecureStore.deleteItemAsync("access_token");
      setUser(null);
      setIsAuthenticated(false);
      setLoginAttempted(false);
    }
  };

  const login = async () => {
    // if (loginAttempted) {
    //   return;
    // }

    try {
      if (!request) {
        console.warn("OAuth request not ready");
        return;
      }
      setLoginAttempted(true);
      const result = await promptAsync();
      if (result?.type === "cancel") {
        console.log("Login cancelled");
        setLoginAttempted(false);
      }
    } catch (error) {
      console.error("Login error:", error);
      setLoginAttempted(false);
    }
  };

  const logout = async () => {
    try {
      await SecureStore.deleteItemAsync("access_token");
      setUser(null);
      setIsAuthenticated(false);
      setLoginAttempted(false);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, user, login, logout, isLoading }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
