import { useAuth } from "@/src/hooks/auth/useAuth";
import { useTheme } from "@/src/theme/useTheme";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function Login() {
  const t = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { login } = useAuth();
  const [submitting, setSubmitting] = useState(false);

  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const isDisabled = !emailOrUsername || !password || submitting;

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      setError("");

      await login(emailOrUsername, password);

      router.replace("/(tabs)/home");
    } catch (e: any) {
      setError(JSON.stringify(e?.response?.data?.error));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView
      contentContainerStyle={{
        flexGrow: 1,
        justifyContent: "center",
        paddingTop: insets.top + 20,
        paddingBottom: insets.bottom + 20,
        paddingHorizontal: 20,
        backgroundColor: t.bg,
      }}
      keyboardShouldPersistTaps="handled"
    >
      <View
        style={{
          backgroundColor: t.surface,
          borderRadius: 24,
          paddingHorizontal: 20,
          paddingVertical: 32,
          borderWidth: 1,
          borderColor: t.surfaceLiteFocus,
          shadowColor: "#000",
          elevation: 10,
        }}
      >
        <Text
          style={{
            fontSize: 26,
            fontWeight: "700",
            color: t.text,
            textAlign: "center",
            marginBottom: 12,
          }}
        >
          Login to CodeBoard
        </Text>

        <View
          style={{
            flexDirection: "row",
            justifyContent: "center",
            flexWrap: "wrap",
            marginBottom: 24,
            gap: 6,
          }}
        >
          <Text style={{ color: t.textSecondary }}>Don’t have an account?</Text>

          <Pressable onPress={() => router.replace("/auth/register")}>
            <Text
              style={{
                color: t.primary,
                fontWeight: "600",
              }}
            >
              Sign up
            </Text>
          </Pressable>
        </View>

        <Text
          style={{
            color: t.textSecondary,
            fontSize: 12,
            marginBottom: 6,
          }}
        >
          Email or username
        </Text>

        <TextInput
          value={emailOrUsername}
          onChangeText={(v) => {
            setEmailOrUsername(v);
            if (error) setError("");
          }}
          placeholder="Enter your email or username"
          placeholderTextColor={t.textSecondary}
          autoCapitalize="none"
          style={{
            backgroundColor: t.surfaceLite,
            borderRadius: 10,
            paddingHorizontal: 14,
            paddingVertical: 14,
            color: t.text,
            marginBottom: 16,
            borderWidth: 1,
            borderColor: t.surfaceLiteFocus,
          }}
        />

        <Text
          style={{
            color: t.textSecondary,
            fontSize: 12,
            marginBottom: 6,
          }}
        >
          Password
        </Text>

        <TextInput
          value={password}
          onChangeText={(v) => {
            setPassword(v);
            if (error) setError("");
          }}
          placeholder="Enter your password"
          placeholderTextColor={t.textSecondary}
          secureTextEntry
          style={{
            backgroundColor: t.surfaceLite,
            borderRadius: 10,
            paddingHorizontal: 14,
            paddingVertical: 14,
            color: t.text,
            borderWidth: 1,
            borderColor: t.surfaceLiteFocus,
          }}
        />

        {error && (
          <View
            style={{
              marginTop: 16,
              borderRadius: 12,
              backgroundColor: `${t.error}20`,
              borderWidth: 1,
              borderColor: `${t.error}60`,
              paddingVertical: 10,
              paddingHorizontal: 12,
            }}
          >
            <Text style={{ color: t.error, fontSize: 13 }}>{error}</Text>
          </View>
        )}

        <Pressable
          onPress={handleSubmit}
          disabled={isDisabled}
          style={({ pressed }) => ({
            marginTop: 24,
            borderRadius: 14,
            paddingVertical: 16,
            alignItems: "center",
            backgroundColor: isDisabled
              ? t.surfaceLite
              : pressed
                ? t.secondaryHover
                : t.secondary,
            opacity: isDisabled ? 0.6 : 1,
          })}
        >
          <Text
            style={{
              color: t.textButtons,
              fontWeight: "600",
              fontSize: 15,
            }}
          >
            {submitting ? "Signing in..." : "Continue"}
          </Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => ({
            marginTop: 14,
            borderRadius: 14,
            paddingVertical: 16,
            alignItems: "center",
            backgroundColor: pressed ? t.primaryHover : t.primary,
          })}
        >
          <Text
            style={{
              color: t.textButtons,
              fontWeight: "600",
              fontSize: 15,
            }}
          >
            Continue with GitHub
          </Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}
