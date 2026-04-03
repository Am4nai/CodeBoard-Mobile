import { api } from "@/src/api/http";
import type { AuthContextType, User } from "@/src/types/typesAuth";
import { AuthStatus } from "@/src/types/typesAuth";
import * as SecureStore from "expo-secure-store";
import React, { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LS_USER_KEY = "user";
const LS_TOKEN_KEY = "token";

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<AuthStatus>("loading");

  useEffect(() => {
    const bootstrap = async () => {
      const storedUser = await SecureStore.getItemAsync(LS_USER_KEY);
      const storedToken = await SecureStore.getItemAsync(LS_TOKEN_KEY);

      try {
        if (storedUser && storedToken) {
          setUser(JSON.parse(storedUser));
          setStatus("authenticated");
        } else {
          setStatus("unauthenticated");
        }
      } catch {
        await SecureStore.deleteItemAsync(LS_USER_KEY);
        await SecureStore.deleteItemAsync(LS_TOKEN_KEY);
        setUser(null);
        setStatus("unauthenticated");
      }
    };

    bootstrap();
  }, []);

  const login: AuthContextType["login"] = async (emailOrUsername, password) => {
    const res = await api.post("/auth/login", { emailOrUsername, password });
    const { user: nextUser, token } = res.data;

    await SecureStore.setItemAsync(LS_USER_KEY, JSON.stringify(nextUser));
    await SecureStore.setItemAsync(LS_TOKEN_KEY, token);

    setUser(nextUser);
    setStatus("authenticated");
  };

  const register: AuthContextType["register"] = async (
    username,
    email,
    password,
  ) => {
    const res = await api.post("/auth/register", { username, email, password });
    const { user: nextUser, token } = res.data;

    await SecureStore.setItemAsync(LS_USER_KEY, JSON.stringify(nextUser));
    await SecureStore.setItemAsync(LS_TOKEN_KEY, token);

    setUser(nextUser);
    setStatus("authenticated");
  };

  const logout = async () => {
    await SecureStore.deleteItemAsync(LS_USER_KEY);
    await SecureStore.deleteItemAsync(LS_TOKEN_KEY);
    setUser(null);
    setStatus("unauthenticated");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: status === "authenticated",
        login,
        register,
        logout,
        status,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
