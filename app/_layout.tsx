import { AuthProvider } from "@/src/hooks/auth/useAuth";
import { ThemeProvider } from "@/src/theme/ThemeProvider";
import { useTheme } from "@/src/theme/useTheme";
import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";

function RootStack() {
  const t = useTheme();

  return (
    <SafeAreaProvider style={{ backgroundColor: t.bg }}>
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      />
    </SafeAreaProvider>
  );
}

export default function Layout() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <RootStack />
      </AuthProvider>
    </ThemeProvider>
  );
}
