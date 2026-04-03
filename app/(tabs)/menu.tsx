import { useTheme } from "@/src/theme/useTheme";
import { useRouter } from "expo-router";
import React from "react";
import { Image, Pressable, ScrollView, Text, View } from "react-native";

export default function Menu() {
  const router = useRouter();
  const t = useTheme();

  return (
    <View style={{ flex: 1, backgroundColor: t.bg }}>
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 48,
          paddingBottom: 120,
        }}
      >
        <View
          style={{
            backgroundColor: t.surface,
            borderRadius: 20,
            borderWidth: 1,
            borderColor: t.surfaceLiteFocus,
            overflow: "hidden",
            marginBottom: 20,
          }}
        >
          <View
            style={{
              padding: 16,
              borderBottomWidth: 1,
              borderBottomColor: t.surfaceLiteFocus,
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Image
                source={{ uri: "https://i.pravatar.cc/150" }}
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 18,
                  marginRight: 14,
                  borderWidth: 1,
                  borderColor: t.surfaceLiteFocus,
                }}
              />

              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    color: t.text,
                    fontSize: 18,
                    fontWeight: "700",
                  }}
                  numberOfLines={1}
                >
                  Andrey Malyshev
                </Text>

                <Text
                  style={{
                    color: t.textSecondary,
                    marginTop: 4,
                  }}
                  numberOfLines={1}
                >
                  @codeboard_dev
                </Text>
              </View>
            </View>
          </View>

          <MenuItem
            label="Profile"
            onPress={() => router.navigate("/profile")}
            t={t}
          />

          <View
            style={{
              height: 1,
              backgroundColor: t.surfaceLiteFocus,
              marginLeft: 16,
              marginRight: 16,
            }}
          />

          <MenuItem
            label="Collections"
            onPress={() => router.navigate("/collections")}
            t={t}
          />
        </View>

        <View
          style={{
            backgroundColor: t.surface,
            borderRadius: 20,
            borderWidth: 1,
            borderColor: t.surfaceLiteFocus,
            overflow: "hidden",
          }}
        >
          <MenuItem
            label="Settings"
            onPress={() => router.navigate("/settings")}
            t={t}
          />

          <View
            style={{
              height: 1,
              backgroundColor: t.surfaceLiteFocus,
              marginLeft: 16,
              marginRight: 16,
            }}
          />

          <MenuItem
            label="Logout"
            onPress={() => router.replace("/auth/login")}
            t={t}
            destructive
          />
        </View>
      </ScrollView>
    </View>
  );
}

function MenuItem({
  label,
  onPress,
  destructive,
  t,
}: {
  label: string;
  onPress: () => void;
  destructive?: boolean;
  t: any;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        paddingVertical: 16,
        paddingHorizontal: 16,
        backgroundColor: pressed ? t.surfaceFocus : "transparent",
      })}
    >
      <Text
        style={{
          color: destructive ? t.error : t.text,
          fontSize: 16,
          fontWeight: "600",
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}
