"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export type ThemeMode = "light" | "dark" | "fever";

interface ThemeContextType {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  toggleFeverMode: () => void;
  isFeverMode: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode>("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("health_app_theme") as ThemeMode;
    if (saved && (saved === "light" || saved === "dark" || saved === "fever")) {
      setThemeState(saved);
      applyTheme(saved);
    } else {
      applyTheme("dark");
    }
  }, []);

  const applyTheme = (mode: ThemeMode) => {
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    root.classList.remove("light", "dark", "fever-mode");

    if (mode === "fever") {
      root.classList.add("dark", "fever-mode");
    } else if (mode === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.add("light");
    }
  };

  const setTheme = (mode: ThemeMode) => {
    setThemeState(mode);
    localStorage.setItem("health_app_theme", mode);
    applyTheme(mode);
  };

  const toggleFeverMode = () => {
    if (theme === "fever") {
      setTheme("dark");
    } else {
      setTheme("fever");
    }
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        toggleFeverMode,
        isFeverMode: theme === "fever",
      }}
    >
      <div className={mounted && theme === "fever" ? "fever-mode" : ""}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
