import { useThemeContext } from "@/src/theme/ThemeProvider";
import { useTheme } from "@/src/theme/useTheme";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function Settings() {
  const t = useTheme();
  const { mode, setMode } = useThemeContext();

  const isDark = mode === "dark";

  const toggleTheme = () => {
    setMode(isDark ? "light" : "dark");
  };

  return (
    <View style={[styles.container, { backgroundColor: t.bg }]}>
      <Text style={[styles.title, { color: t.text }]}>Settings</Text>

      <TouchableOpacity
        activeOpacity={0.7}
        onPress={toggleTheme}
        style={[
          styles.button,
          {
            backgroundColor: t.surface,
            borderColor: t.surfaceLiteFocus,
          },
        ]}
      >
        <View style={styles.row}>
          <Ionicons
            name={isDark ? "moon" : "sunny"}
            size={22}
            color={isDark ? t.primary : "#F59E0B"}
          />

          <Text style={[styles.buttonText, { color: t.text }]}>Theme</Text>
        </View>

        <View
          style={[
            styles.badge,
            {
              backgroundColor: isDark ? t.surfaceLite : t.surfaceLiteFocus,
            },
          ]}
        >
          <Text style={[styles.badgeText, { color: t.textSecondary }]}>
            {isDark ? "Dark" : "Light"}
          </Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    marginBottom: 32,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 18,
    borderRadius: 20,
    borderWidth: 1,
    elevation: 6,
    shadowColor: "#000",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "500",
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
  },
});
