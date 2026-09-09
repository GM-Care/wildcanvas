"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { SessionPayload } from "@/lib/session";

interface AuthContextType {
  user: SessionPayload | null;
  isLoading: boolean;
  login: (email: string, role?: string) => Promise<boolean>;
  logout: () => Promise<void>;
  quickLogin: (type: "admin" | "tenant" | "buyer") => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SessionPayload | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSession = async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSession();
  }, []);

  const login = async (email: string, password?: string): Promise<boolean> => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setUser(null);
      window.location.href = "/";
    } catch {
      // Ignore
    }
  };

  const quickLogin = async (type: "admin" | "tenant" | "buyer") => {
    let email = "buyer@example.com";
    let password = "password123";
    if (type === "admin") {
      email = "admin@wildcanvas.com";
    } else if (type === "tenant") {
      email = "creator@wildcanvas.com";
    }

    const success = await login(email, password);
    if (success) {
      if (type === "admin") {
        window.location.href = "/admin";
      } else if (type === "tenant") {
        window.location.href = "/studio";
      } else {
        window.location.href = "/marketplace";
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        logout,
        quickLogin,
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
