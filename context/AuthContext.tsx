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

WebBrowser.maybeCompleteAuthSession();

interface User {
  displayname: string;
  login: string;
  level: string;
  wallet: string;
  imageURL: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: () => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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
      console.log(token);
      const resp = await fetch("https://api.intra.42.fr/v2/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await resp.json();

      const mainCursus = data.cursus_users.find(
        (cursus: any) => cursus.cursus_id === 21
      );
      setUser({
        displayname: data.displayname,
        login: data.login,
        wallet: data.wallet,
        level: mainCursus?.level.toFixed(2) ?? "N/A",
        imageURL: data.image.link,
      });
      setIsAuthenticated(true);
    } catch (error) {
      console.error("Fetch user info error:", error);
      await SecureStore.deleteItemAsync("access_token");
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  const login = async () => {
    try {
      if (!request) {
        console.warn("OAuth request not ready");
        return;
      }
      const result = await promptAsync();
      if (result?.type === "cancel") {
        console.log("Login cancelled");
      }
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  const logout = async () => {
    try {
      await SecureStore.deleteItemAsync("access_token");
      setUser(null);
      setIsAuthenticated(false);
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
