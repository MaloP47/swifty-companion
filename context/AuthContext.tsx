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
import { router } from "expo-router";

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
      console.log(
        "[AuthProvider] Checking for valid access token on startup..."
      );
      const token = await getValidAccessToken();
      if (token) {
        await fetchUserInfo(token);
      } else {
        setIsAuthenticated(false);
        setUser(null);
      }
      setIsLoading(false);
    })();
  }, []);

  useEffect(() => {
    if (response?.type === "success" && response.params.code) {
      (async () => {
        try {
          console.log("[AuthProvider] Exchanging code for tokens...");
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
            console.log(
              "[AuthProvider] Received access token:",
              tokenResponse.accessToken
            );
            await SecureStore.setItemAsync(
              "access_token",
              tokenResponse.accessToken
            );
            if (tokenResponse.refreshToken) {
              console.log(
                "[AuthProvider] Received refresh token:",
                tokenResponse.refreshToken
              );
              await SecureStore.setItemAsync(
                "refresh_token",
                tokenResponse.refreshToken
              );
            }
            if (tokenResponse.expiresIn) {
              const expiry = (
                Date.now() +
                tokenResponse.expiresIn * 1000
              ).toString();
              console.log(
                `[AuthProvider] Token expires in ${
                  tokenResponse.expiresIn
                } seconds (at ${new Date(parseInt(expiry)).toLocaleString()})`
              );
              await SecureStore.setItemAsync("token_expiry", expiry);
            }
            await fetchUserInfo(tokenResponse.accessToken);
            setIsAuthenticated(true);
          }
        } catch (error) {
          console.log("[AuthProvider] Token exchange error:", error);
          setIsAuthenticated(false);
        }
      })();
    }
  }, [response]);

  const fetchUserInfo = async (token: string) => {
    try {
      console.log("[fetchUserInfo] Using access token:", token);
      const resp = await fetch("https://api.intra.42.fr/v2/me", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (resp.status === 401) {
        console.log(
          "[fetchUserInfo] Received 401, attempting token refresh..."
        );
        const newToken = await refreshAccessToken();
        if (newToken) {
          console.log(
            "[fetchUserInfo] Retrying with new access token:",
            newToken
          );
          return await fetchUserInfo(newToken); // retry once
        } else {
          throw new Error("Unable to refresh token after 401");
        }
      }

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
      console.log("[fetchUserInfo] User info set:", data.login);
    } catch (error) {
      console.log("[fetchUserInfo] Error:", error);
      await SecureStore.deleteItemAsync("access_token");
      await SecureStore.deleteItemAsync("refresh_token");
      await SecureStore.deleteItemAsync("token_expiry");
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  const refreshAccessToken = async () => {
    try {
      const refreshToken = await SecureStore.getItemAsync("refresh_token");
      if (!refreshToken) throw new Error("No refresh token found");
      console.log("[refreshAccessToken] Using refresh token:", refreshToken);

      const resp = await fetch(discovery.tokenEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `grant_type=refresh_token&client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}&refresh_token=${refreshToken}`,
      });
      const data = await resp.json();

      if (data.access_token) {
        console.log(
          "[refreshAccessToken] New access token:",
          data.access_token
        );
        await SecureStore.setItemAsync("access_token", data.access_token);
        if (data.refresh_token) {
          console.log(
            "[refreshAccessToken] New refresh token:",
            data.refresh_token
          );
          await SecureStore.setItemAsync("refresh_token", data.refresh_token);
        }
        if (data.expires_in) {
          const expiry = (Date.now() + data.expires_in * 1000).toString();
          console.log(
            `[refreshAccessToken] Token expires in ${
              data.expires_in
            } seconds (at ${new Date(parseInt(expiry)).toLocaleString()})`
          );
          await SecureStore.setItemAsync("token_expiry", expiry);
        }
        return data.access_token;
      } else {
        console.log("[refreshAccessToken] Failed to refresh token:", data);
        throw new Error("Failed to refresh token");
      }
    } catch (error) {
      console.log("[refreshAccessToken] Error:", error);
      await SecureStore.deleteItemAsync("access_token");
      await SecureStore.deleteItemAsync("refresh_token");
      await SecureStore.deleteItemAsync("token_expiry");
      setUser(null);
      setIsAuthenticated(false);
      return null;
    }
  };

  const getValidAccessToken = async () => {
    const token = await SecureStore.getItemAsync("access_token");
    console.log("bbbbb", token);
    const expiry = await SecureStore.getItemAsync("token_expiry");
    if (token && expiry) {
      const expiresAt = parseInt(expiry);
      const now = Date.now();
      console.log(
        `[getValidAccessToken] Current time: ${new Date(
          now
        ).toLocaleString()}, Token expires at: ${new Date(
          expiresAt
        ).toLocaleString()}`
      );
      if (now < expiresAt - 60000) {
        // refresh 1 min before expiry
        console.log("[getValidAccessToken] Access token is still valid.");
        return token;
      } else {
        console.log(
          "[getValidAccessToken] Access token expired or about to expire, refreshing..."
        );
        return await refreshAccessToken();
      }
    } else {
      console.log("[getValidAccessToken] No access token or expiry found.");
      return null;
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
        setIsAuthenticated(false);
        router.replace("/LoginScreen");
        return;
      }
      if (result?.type === "success") {
        setIsAuthenticated(true);
        router.replace("/HomeScreen");
      }
    } catch (error) {
      console.log("Login error:", error);
      setIsAuthenticated(false);
      router.replace("/LoginScreen");
    }
  };

  const logout = async () => {
    try {
      await SecureStore.deleteItemAsync("access_token");
      const test = await SecureStore.getItemAsync("access_token");
      console.log("After deletion, access_token:", test); // Should be null
      await SecureStore.deleteItemAsync("refresh_token");
      await SecureStore.deleteItemAsync("token_expiry");
      setUser(null);
      setIsAuthenticated(false);
      router.replace("/LoginScreen");
    } catch (error) {
      console.log("Logout error:", error);
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
