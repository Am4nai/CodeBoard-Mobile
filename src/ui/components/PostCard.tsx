import { useTheme } from "@/src/theme/useTheme";
import type { PostCardProps } from "@/src/types/types";
import { useRouter } from "expo-router";
import { Pressable, Text, View } from "react-native";

export default function PostCard({
  id,
  title,
  description,
  authorName,
  createdAt,
  likes = 0,
  comments = 0,
  views = 0,
  editable,
}: PostCardProps) {
  const t = useTheme();
  const router = useRouter();

  const handleOpen = () => {
    router.push({
      pathname: editable ? "/post/edit/[id]" : "/post/[id]",
      params: { id: String(id) },
    });
  };

  return (
    <Pressable
      onPress={handleOpen}
      style={({ pressed }) => ({
        backgroundColor: pressed ? t.surfaceFocus : t.surfaceLite,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: t.surfaceLiteFocus,
        overflow: "hidden",
      })}
    >
      <View
        style={{ paddingHorizontal: 14, paddingTop: 12, paddingBottom: 10 }}
      >
        <Text
          style={{
            color: t.text,
            fontSize: 15,
            fontWeight: "700",
            lineHeight: 20,
          }}
        >
          {title}
        </Text>

        {description ? (
          <Text
            style={{
              color: t.textSecondary,
              fontSize: 12,
              lineHeight: 17,
              marginTop: 6,
            }}
          >
            {description}
          </Text>
        ) : null}
      </View>

      <View
        style={{
          backgroundColor: t.surfaceFocus,
          paddingHorizontal: 14,
          paddingVertical: 10,
          borderTopWidth: 1,
          borderTopColor: t.surfaceLiteFocus,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            gap: 10,
          }}
        >
          <View style={{ flex: 1 }}>
            <Text style={{ color: t.text, fontSize: 12 }}>{authorName}</Text>

            <Text
              style={{ color: t.textSecondary, fontSize: 10, marginTop: 2 }}
            >
              {new Date(createdAt).toLocaleDateString()}
            </Text>
          </View>

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
            }}
          >
            <Text style={{ color: t.textSecondary, fontSize: 11 }}>
              {views} 👁
            </Text>
            <Text style={{ color: t.textSecondary, fontSize: 11 }}>
              {likes} ❤️
            </Text>
            <Text style={{ color: t.textSecondary, fontSize: 11 }}>
              {comments} 💬
            </Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}
