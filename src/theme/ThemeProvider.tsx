import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

type ThemeMode = "dark" | "light";

type ThemeTokens = {
  bg: string;

  surface: string;
  surfaceFocus: string;
  surfaceLite: string;
  surfaceLiteFocus: string;

  primary: string;
  primaryHover: string;

  secondary: string;
  secondaryHover: string;

  text: string;
  textPrimary: string;
  textSecondary: string;
  textButtons: string;

  success: string;
  warning: string;
  error: string;
};

const STORAGE_KEY = "codeboard.themeMode";

const themes: Record<ThemeMode, ThemeTokens> = {
  dark: {
    bg: "#0D1117",

    surface: "#161B22",
    surfaceFocus: "#0F141A",
    surfaceLite: "#1E252E",
    surfaceLiteFocus: "#252D38",

    primary: "#E0316F",
    primaryHover: "#B82558",

    secondary: "#3D7BDB",
    secondaryHover: "#2D61B0",

    text: "#E6EDF3",
    textPrimary: "#F06292",
    textSecondary: "#8B98A5",
    textButtons: "#E6EDF3",

    success: "#10B981",
    warning: "#F59E0B",
    error: "#DC2626",
  },
  light: {
    bg: "#F9FBFF",

    surface: "#EDF2F7",
    surfaceFocus: "#E2E8F0",
    surfaceLite: "#E2E8F0",
    surfaceLiteFocus: "#CBD5E1",

    primary: "#E0316F",
    primaryHover: "#B82558",

    secondary: "#3D7BDB",
    secondaryHover: "#2D61B0",

    text: "#2D3748",
    textPrimary: "#B91C1C",
    textSecondary: "#64748B",
    textButtons: "#E6EDF3",

    success: "#059669",
    warning: "#D97706",
    error: "#B91C1C",
  },
};

type ThemeContextValue = {
  mode: ThemeMode;
  theme: ThemeTokens;
  setMode: (mode: ThemeMode) => void;
  toggleMode: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>("dark");

  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        if (saved === "dark" || saved === "light") setModeState(saved);
      } catch {}
    })();
  }, []);

  const setMode = (next: ThemeMode) => {
    setModeState(next);
    AsyncStorage.setItem(STORAGE_KEY, next).catch(() => {});
  };

  const toggleMode = () => setMode(mode === "dark" ? "light" : "dark");

  const value = useMemo<ThemeContextValue>(() => {
    return { mode, theme: themes[mode], setMode, toggleMode };
  }, [mode]);

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useThemeContext() {
  const ctx = useContext(ThemeContext);
  if (!ctx)
    throw new Error("useThemeContext must be used within ThemeProvider");
  return ctx;
}
