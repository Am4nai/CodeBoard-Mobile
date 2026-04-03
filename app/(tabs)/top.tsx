import { useTheme } from "@/src/theme/useTheme";
import { LinearGradient } from "expo-linear-gradient";
import React, { useMemo } from "react";
import { ScrollView, Text, View } from "react-native";

type Item = {
  id: string;
  h: number;
};

function Header() {
  const t = useTheme();

  return (
    <View
      style={{
        paddingTop: 18,
        paddingHorizontal: 16,
        paddingBottom: 12,
        backgroundColor: t.bg,
        borderBottomWidth: 1,
        borderBottomColor: t.bg,
      }}
    >
      <Text
        style={{
          color: t.text,
          fontSize: 24,
          fontWeight: "700",
        }}
      >
        Top Posts
      </Text>

      <Text
        style={{
          color: t.textSecondary,
          marginTop: 4,
          fontSize: 13,
        }}
      >
        🔥 Trending this week
      </Text>
    </View>
  );
}

function Card({ item, index }: { item: Item; index: number }) {
  const t = useTheme();

  return (
    <View
      style={{
        backgroundColor: t.surfaceLite,
        borderRadius: 16,
        padding: 12,
        height: item.h,
        borderWidth: 1,
        borderColor: t.surfaceLiteFocus,
      }}
    >
      {index < 3 && (
        <View
          style={{
            position: "absolute",
            top: 10,
            right: 10,
            backgroundColor: t.primary,
            paddingHorizontal: 8,
            paddingVertical: 4,
            borderRadius: 999,
            zIndex: 1,
          }}
        >
          <Text
            style={{
              color: t.textButtons,
              fontSize: 10,
              fontWeight: "600",
            }}
          >
            TOP {index + 1}
          </Text>
        </View>
      )}

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
            width: "70%",
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

export default function Top() {
  const t = useTheme();

  const data = useMemo(() => {
    return Array.from({ length: 24 }).map((_, i) => ({
      id: String(i),
      h: 160 + ((i * 41) % 120),
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
            paddingTop: 16,
            paddingBottom: 120,
          }}
        >
          <View style={{ flexDirection: "row", gap: 8 }}>
            <View style={{ flex: 1, gap: 8 }}>
              {left.map((item, index) => (
                <Card key={item.id} item={item} index={index} />
              ))}
            </View>

            <View style={{ flex: 1, gap: 8 }}>
              {right.map((item, index) => (
                <Card key={item.id} item={item} index={index + left.length} />
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
