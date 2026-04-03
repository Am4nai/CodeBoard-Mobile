import { useAuth } from "@/src/hooks/auth/useAuth";
import { useTheme } from "@/src/theme/useTheme";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function Register() {
  const t = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { register } = useAuth();
  const [submitting, setSubmitting] = useState(false);

  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [error, setError] = useState("");

  const isDisabled =
    !email || !username || !password || !confirmPass || submitting;

  const handleSubmit = async () => {
    console.log(email, username, password, confirmPass);

    if (!email || !username || !password || !confirmPass) {
      setError("Please fill in all fields.");
      return;
    }

    if (password !== confirmPass) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      await register(username, email, password);

      router.replace("/(tabs)/home");
    } catch (e: any) {
      setError(e?.response?.data?.message ?? "Register failed. Try again.");
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
          Sign up to CodeBoard
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
          <Text style={{ color: t.textSecondary }}>
            Already have an account?
          </Text>

          <Pressable onPress={() => router.replace("/auth/login")}>
            <Text style={{ color: t.primary, fontWeight: "600" }}>Login</Text>
          </Pressable>
        </View>

        <Field
          label="Email"
          value={email}
          onChangeText={(v) => {
            setEmail(v);
            if (error) setError("");
          }}
          placeholder="you@example.com"
          t={t}
          autoCapitalize="none"
        />

        <Field
          label="Username"
          value={username}
          onChangeText={(v) => {
            setUsername(v);
            if (error) setError("");
          }}
          placeholder="your_username"
          t={t}
          autoCapitalize="none"
        />

        <Field
          label="Password"
          value={password}
          onChangeText={(v) => {
            setPassword(v);
            if (error) setError("");
          }}
          placeholder="••••••••"
          t={t}
          secureTextEntry
        />

        <Field
          label="Confirm password"
          value={confirmPass}
          onChangeText={(v) => {
            setConfirmPass(v);
            if (error) setError("");
          }}
          placeholder="••••••••"
          t={t}
          secureTextEntry
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
            {submitting ? "Signing up..." : "Continue"}
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

function Field({
  label,
  t,
  ...props
}: {
  label: string;
  t: any;
  value: string;
  onChangeText: (v: string) => void;
  placeholder: string;
  secureTextEntry?: boolean;
  autoCapitalize?: any;
}) {
  return (
    <View style={{ gap: 8, marginBottom: 14 }}>
      <Text style={{ color: t.textSecondary, fontSize: 12 }}>{label}</Text>

      <View
        style={{
          backgroundColor: t.surfaceLite,
          borderRadius: 10,
          borderWidth: 1,
          borderColor: t.surfaceLiteFocus,
          paddingHorizontal: 14,
          height: 50,
          justifyContent: "center",
        }}
      >
        <TextInput
          placeholderTextColor={t.textSecondary}
          style={{ color: t.text, fontSize: 14 }}
          {...props}
        />
      </View>
    </View>
  );
}
