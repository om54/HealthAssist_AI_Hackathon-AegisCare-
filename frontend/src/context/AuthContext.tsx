"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { getToken, getUserRole, getStoredUser, clearAuth as clearAuthStorage, setAuth as setAuthStorage, apiRequest } from "@/lib/api";
import { useRouter } from "next/navigation";

export type Role = "user" | "doctor" | "admin";

interface AuthContextType {
  token: string | null;
  role: Role | null;
  user: any;
  login: (token: string, role: Role, userData?: any) => void;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [role, setRole] = useState<Role | null>(null);
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const router = useRouter();

  useEffect(() => {
    const storedToken = getToken();
    const storedRole = getUserRole();
    const storedUserData = getStoredUser();

    if (storedToken && storedRole) {
      setToken(storedToken);
      setRole(storedRole);
      setUser(storedUserData);
    }
    setIsLoading(false);
  }, []);

  const login = (newToken: string, newRole: Role, userData?: any) => {
    setToken(newToken);
    setRole(newRole);
    setUser(userData || null);
    setAuthStorage(newToken, newRole, userData);
  };

  const logout = async () => {
    try {
      if (role === "user") {
        await apiRequest("/users/logout/", { method: "POST" });
      } else if (role === "doctor") {
        await apiRequest("/doctor-admin/logout/", { method: "POST" });
      } else if (role === "admin") {
        await apiRequest("/admin/logout/", { method: "POST" });
      }
    } catch (e) {
      console.warn("Logout request failed:", e);
    } finally {
      clearAuthStorage();
      setToken(null);
      setRole(null);
      setUser(null);
      router.push("/");
    }
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        role,
        user,
        login,
        logout,
        isAuthenticated: !!token,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
