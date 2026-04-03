import { useAuth } from "@/src/hooks/auth/useAuth";
import { useTheme } from "@/src/theme/useTheme";
import { LinearGradient } from "expo-linear-gradient";
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";

type Item = { id: string; h: number };

function SectionTitle({ children }: { children: React.ReactNode }) {
  const t = useTheme();
  return (
    <Text style={{ color: t.textSecondary, fontSize: 13, marginBottom: 6 }}>
      {children}
    </Text>
  );
}

function InputBase(props: React.ComponentProps<typeof TextInput>) {
  const t = useTheme();
  return (
    <TextInput
      placeholderTextColor={t.textSecondary}
      autoCorrect={false}
      spellCheck={false}
      style={[
        {
          backgroundColor: t.surfaceLite,
          color: t.text,
          borderRadius: 14,
          paddingHorizontal: 14,
          height: 46,
          borderWidth: 1,
          borderColor: t.surfaceLiteFocus,
          fontSize: 14,
        },
        props.style,
      ]}
      {...props}
    />
  );
}

function TextArea(props: React.ComponentProps<typeof TextInput>) {
  const t = useTheme();
  return (
    <TextInput
      placeholderTextColor={t.textSecondary}
      multiline
      textAlignVertical="top"
      autoCorrect={false}
      spellCheck={false}
      style={[
        {
          backgroundColor: t.surfaceLite,
          color: t.text,
          borderRadius: 18,
          paddingHorizontal: 14,
          paddingVertical: 12,
          minHeight: 110,
          borderWidth: 1,
          borderColor: t.surfaceLiteFocus,
          fontSize: 14,
        },
        props.style,
      ]}
      {...props}
    />
  );
}

function ActionButton({
  label,
  onPress,
  variant,
  disabled,
}: {
  label: string;
  onPress: () => void;
  variant: "primary" | "secondary";
  disabled?: boolean;
}) {
  const t = useTheme();
  const bg = variant === "primary" ? t.primary : t.secondary;
  const bgHover = variant === "primary" ? t.primaryHover : t.secondaryHover;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => ({
        backgroundColor: disabled ? t.surfaceLite : pressed ? bgHover : bg,
        borderRadius: 16,
        paddingVertical: 14,
        alignItems: "center",
        opacity: disabled ? 0.65 : 1,
      })}
    >
      <Text style={{ color: t.textButtons, fontWeight: "600" }}>{label}</Text>
    </Pressable>
  );
}

function CardSkeleton({ item }: { item: Item }) {
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

export default function Profile() {
  const t = useTheme();
  const { user } = useAuth();

  const isOwner = true;

  const initialAvatar =
    user?.profile?.avatar_url ?? "https://placehold.co/128x128";
  const [avatarUrl, setAvatarUrl] = useState(initialAvatar);

  const [username, setUsername] = useState(user?.username ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [description, setDescription] = useState(
    user?.profile?.description ?? "",
  );
  const [about, setAbout] = useState(user?.profile?.about ?? "");

  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const loadingProfile = false;
  const loadingPosts = false;

  const data = useMemo(() => {
    return Array.from({ length: 18 }).map((_, i) => ({
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

  const createdAtLabel = user?.created_at
    ? new Date(user.created_at).toLocaleDateString()
    : "";

  const handleUpdate = async () => {
    try {
      setSaving(true);
      setError("");
    } catch {
      setError("Failed to update profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: t.bg, paddingTop: 32 }}>
      <View style={{ flex: 1 }}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ padding: 16, paddingBottom: 120 }}
        >
          {error ? (
            <View
              style={{
                borderRadius: 12,
                backgroundColor: `${t.error}20`,
                borderWidth: 1,
                borderColor: `${t.error}60`,
                paddingVertical: 10,
                paddingHorizontal: 12,
                marginBottom: 12,
              }}
            >
              <Text style={{ color: t.error, fontSize: 13 }}>{error}</Text>
            </View>
          ) : null}

          <View
            style={{
              backgroundColor: t.surface,
              borderRadius: 24,
              borderWidth: 1,
              borderColor: t.surfaceLiteFocus,
              padding: 14,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 12,
              }}
            >
              <Text style={{ color: t.text, fontSize: 22, fontWeight: "800" }}>
                Profile
              </Text>

              {isOwner ? (
                <View style={{ width: 130 }}>
                  <ActionButton
                    label={saving ? "Saving..." : "Update"}
                    onPress={handleUpdate}
                    variant="primary"
                    disabled={saving || loadingProfile}
                  />
                </View>
              ) : null}
            </View>

            <View
              style={{
                flexDirection: "row",
                gap: 14,
              }}
            >
              <Image
                source={{ uri: avatarUrl || "https://placehold.co/128x128" }}
                style={{
                  width: 92,
                  height: 92,
                  borderRadius: 46,
                  borderWidth: 1,
                  borderColor: t.surfaceLiteFocus,
                  backgroundColor: t.surfaceLite,
                }}
              />

              <View style={{ flex: 1, gap: 10 }}>
                {isOwner ? (
                  <InputBase
                    value={avatarUrl}
                    onChangeText={(v) => {
                      setAvatarUrl(v);
                      if (error) setError("");
                    }}
                    placeholder="Avatar URL..."
                    editable={!saving && !loadingProfile}
                  />
                ) : null}

                <InputBase
                  value={username}
                  onChangeText={(v) => {
                    setUsername(v);
                    if (error) setError("");
                  }}
                  editable={isOwner && !saving && !loadingProfile}
                />

                <InputBase
                  value={email}
                  onChangeText={(v) => {
                    setEmail(v);
                    if (error) setError("");
                  }}
                  editable={isOwner && !saving && !loadingProfile}
                />

                <Text style={{ color: t.textSecondary, fontSize: 12 }}>
                  Account created: {createdAtLabel}
                </Text>
              </View>
            </View>

            <View style={{ marginTop: 14, gap: 12 }}>
              <View>
                <SectionTitle>Description</SectionTitle>
                <TextArea
                  value={description}
                  onChangeText={(v) => {
                    setDescription(v);
                    if (error) setError("");
                  }}
                  placeholder={isOwner ? "Tell something short..." : ""}
                  editable={isOwner && !saving && !loadingProfile}
                />
              </View>

              <View>
                <SectionTitle>About</SectionTitle>
                <TextArea
                  value={about}
                  onChangeText={(v) => {
                    setAbout(v);
                    if (error) setError("");
                  }}
                  placeholder={isOwner ? "More details about you..." : ""}
                  editable={isOwner && !saving && !loadingProfile}
                />
              </View>

              {loadingProfile ? (
                <Text style={{ color: t.textSecondary, fontSize: 13 }}>
                  Loading profile...
                </Text>
              ) : null}
            </View>
          </View>

          <View style={{ marginTop: 18 }}>
            <Text style={{ color: t.text, fontSize: 22, fontWeight: "800" }}>
              {isOwner ? "My posts" : "Posts"}
            </Text>
            <Text
              style={{ color: t.textSecondary, marginTop: 4, fontSize: 13 }}
            >
              {isOwner ? "Your recent posts." : "User's recent posts."}
            </Text>

            {loadingPosts ? (
              <View
                style={{
                  marginTop: 12,
                  backgroundColor: t.surface,
                  borderRadius: 20,
                  borderWidth: 1,
                  borderColor: t.surfaceLiteFocus,
                  padding: 16,
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 10,
                }}
              >
                <ActivityIndicator />
                <Text style={{ color: t.textSecondary }}>Loading posts...</Text>
              </View>
            ) : (
              <View style={{ marginTop: 12 }}>
                <View style={{ flexDirection: "row", gap: 8 }}>
                  <View style={{ flex: 1, gap: 8 }}>
                    {left.map((item) => (
                      <CardSkeleton key={item.id} item={item} />
                    ))}
                  </View>

                  <View style={{ flex: 1, gap: 8 }}>
                    {right.map((item) => (
                      <CardSkeleton key={item.id} item={item} />
                    ))}
                  </View>
                </View>
              </View>
            )}
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
