import { useTheme } from "@/src/theme/useTheme";
import { useRouter } from "expo-router";
import { Image, Pressable, Text, View } from "react-native";

export default function Header() {
  const router = useRouter();
  const t = useTheme();

  return (
    <View
      style={{
        paddingTop: 40,
        paddingHorizontal: 16,
        paddingBottom: 12,
        backgroundColor: t.bg,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Text
          style={{
            color: t.text,
            fontSize: 24,
            fontWeight: "700",
          }}
        >
          CodeBoard
        </Text>

        <Pressable onPress={() => router.navigate("/(tabs)/profile")}>
          <Image
            source={{ uri: "https://i.pravatar.cc/100" }}
            style={{
              width: 36,
              height: 36,
              borderRadius: 11,
              borderWidth: 1,
              borderColor: t.surfaceLiteFocus,
            }}
          />
        </Pressable>
      </View>
    </View>
  );
}
