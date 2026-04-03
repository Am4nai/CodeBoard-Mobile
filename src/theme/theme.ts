export const theme = {
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
} as const;

export type ThemeName = keyof typeof theme;
export type Theme = (typeof theme)[ThemeName];
