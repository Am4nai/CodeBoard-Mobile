import { useTheme } from "@/src/theme/useTheme";
import { LinearGradient } from "expo-linear-gradient";
import React, { useMemo } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";

type Item = {
  id: string;
  h: number;
};

const TAGS = ["React", "API", "Auth", "UI", "Hooks", "DB", "TS", "Node"];
const LANGS = ["TS", "JS", "Python", "Go", "Rust", "Java"];

function SearchHeader() {
  const t = useTheme();

  return (
    <View
      style={{
        paddingTop: 32,
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
        Search
      </Text>

      <View
        style={{
          marginTop: 12,
          backgroundColor: t.surfaceLite,
          borderRadius: 14,
          paddingHorizontal: 14,
          height: 46,
          justifyContent: "center",
          borderWidth: 1,
          borderColor: t.surfaceLiteFocus,
        }}
      >
        <TextInput
          placeholder="Search by title, tag, language..."
          placeholderTextColor={t.textSecondary}
          autoCapitalize="none"
          autoCorrect={false}
          spellCheck={false}
          style={{
            color: t.text,
            fontSize: 14,
          }}
        />
      </View>
    </View>
  );
}

function Chip({
  label,
  variant = "tag",
}: {
  label: string;
  variant?: "tag" | "lang";
}) {
  const t = useTheme();

  const paddingHorizontal = variant === "tag" ? 12 : 10;
  const paddingVertical = variant === "tag" ? 7 : 6;
  const fontSize = variant === "tag" ? 13 : 12;

  return (
    <Pressable
      style={({ pressed }) => ({
        backgroundColor: pressed ? t.surfaceFocus : t.surfaceLite,
        paddingHorizontal,
        paddingVertical,
        borderRadius: 999,
        marginRight: 8,
        borderWidth: 1,
        borderColor: t.surfaceLiteFocus,
      })}
    >
      <Text style={{ color: t.textSecondary, fontSize }}>
        {variant === "tag" ? `#${label}` : label}
      </Text>
    </Pressable>
  );
}

function SectionHeader({
  title,
  rightHint,
}: {
  title: string;
  rightHint?: string;
}) {
  const t = useTheme();

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "baseline",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        marginTop: 12,
        marginBottom: 8,
      }}
    >
      <Text style={{ color: t.textSecondary, fontSize: 13 }}>{title}</Text>

      {rightHint ? (
        <Text style={{ color: t.textSecondary, fontSize: 12 }}>
          {rightHint}
        </Text>
      ) : null}
    </View>
  );
}

function Card({ item }: { item: Item }) {
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

export default function Search() {
  const t = useTheme();

  const data = useMemo(() => {
    return Array.from({ length: 30 }).map((_, i) => ({
      id: String(i),
      h: 140 + ((i * 29) % 100),
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
      <SearchHeader />

      <View style={{ flex: 1 }}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingBottom: 120,
          }}
        >
          <SectionHeader title="Popular tags" rightHint="Tap to filter" />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingLeft: 16, paddingRight: 8 }}
          >
            {TAGS.map((tag) => (
              <Chip key={tag} label={tag} variant="tag" />
            ))}
          </ScrollView>

          <SectionHeader title="Languages" rightHint="Choose one" />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingLeft: 16, paddingRight: 8 }}
          >
            {LANGS.map((lang) => (
              <Chip key={lang} label={lang} variant="lang" />
            ))}
          </ScrollView>

          <View
            style={{
              flexDirection: "row",
              gap: 8,
              paddingHorizontal: 8,
              marginTop: 14,
            }}
          >
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
