import { useTheme } from "@/src/theme/useTheme";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useMemo } from "react";
import { Image, Pressable, ScrollView, Text, View } from "react-native";

type Item = {
  id: string;
  h: number;
};

function Header() {
  const router = useRouter();
  const t = useTheme();

  return (
    <View
      style={{
        paddingTop: 32,
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

function Card({ item }: { item: Item }) {
  const t = useTheme();

  return (
    <View
      style={{
        backgroundColor: t.surfaceLite,
        borderRadius: 12,
        padding: 12,
        height: item.h,
        borderWidth: 1,
        borderColor: t.surfaceLiteFocus,
      }}
    >
      <View style={{ gap: 8 }}>
        <View
          style={{
            height: 8,
            borderRadius: 6,
            backgroundColor: t.surfaceLiteFocus,
          }}
        />
        <View
          style={{
            height: 8,
            borderRadius: 6,
            backgroundColor: t.surfaceLiteFocus,
            width: "75%",
          }}
        />
        <View
          style={{
            height: 8,
            borderRadius: 6,
            backgroundColor: t.surfaceLiteFocus,
            width: "60%",
          }}
        />
      </View>
    </View>
  );
}

export default function Home() {
  const t = useTheme();

  const data = useMemo(() => {
    return Array.from({ length: 40 }).map((_, i) => ({
      id: String(i),
      h: 150 + ((i * 37) % 120),
    }));
  }, []);

  const { left, right } = useMemo(() => {
    const l: Item[] = [];
    const r: Item[] = [];
    let lh = 0;
    let rh = 0;

    for (const it of data) {
      if (lh <= rh) {
        l.push(it);
        lh += it.h;
      } else {
        r.push(it);
        rh += it.h;
      }
    }

    return { left: l, right: r };
  }, [data]);

  return (
    <View style={{ flex: 1, backgroundColor: t.bg }}>
      <Header />

      <View style={{ flex: 1 }}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 8,
            paddingBottom: 120,
            paddingTop: 16,
          }}
        >
          <View style={{ flexDirection: "row", gap: 8 }}>
            <View style={{ flex: 1, gap: 8 }}>
              {left.map((item) => (
                <Card key={item.id} item={item} />
              ))}
            </View>

            <View style={{ flex: 1, gap: 8 }}>
              {right.map((item) => (
                <Card key={item.id} item={item} />
              ))}
            </View>
          </View>
        </ScrollView>

        <LinearGradient
          pointerEvents="none"
          colors={[t.bg, "transparent"]}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 18,
          }}
        />
      </View>
    </View>
  );
}
