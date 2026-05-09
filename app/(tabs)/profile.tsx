import { api } from "@/src/api/http";
import { useAuth } from "@/src/hooks/auth/useAuth";
import { useTheme } from "@/src/theme/useTheme";
import type {
  PostCardProps,
  UserPostsResponse,
  UserResponse,
} from "@/src/types/types";
import PostCard from "@/src/ui/components/PostCard";
import axios from "axios";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams } from "expo-router";
import * as SecureStore from "expo-secure-store";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";

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

export default function Profile() {
  const t = useTheme();
  const { user } = useAuth();
  const params = useLocalSearchParams<{ id?: string }>();

  const profileUserId = params.id ?? String(user?.id ?? "");
  const isOwner = !!user?.id && String(user.id) === String(profileUserId);

  const [posts, setPosts] = useState<PostCardProps[]>([]);

  const [userId, setUserId] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState("https://placehold.co/128x128");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [description, setDescription] = useState("");
  const [about, setAbout] = useState("");
  const [createdAt, setCreatedAt] = useState("");

  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingPosts, setLoadingPosts] = useState(true);

  const fetchPosts = async (uid: string) => {
    try {
      setLoadingPosts(true);
      setError("");

      const response = await api.get<UserPostsResponse>(`/users/${uid}/posts`);

      const mapped: PostCardProps[] = response.data.posts.map((p) => ({
        id: p.id,
        title: p.title,
        description: p.description ?? "",
        code: p.code,
        language: p.language_name,
        authorName: p.author_name,
        createdAt: p.created_at,
        likes: p.like_count,
        comments: p.comment_count,
        views: p.views_count,
      }));

      setPosts(mapped);
    } catch (err) {
      console.log(err);
      setError("Failed to load posts. Please try again.");
    } finally {
      setLoadingPosts(false);
    }
  };

  const getProfile = async () => {
    if (!profileUserId) {
      setError("Invalid user id.");
      setLoadingProfile(false);
      setLoadingPosts(false);
      return;
    }

    try {
      setLoadingProfile(true);
      setError("");

      const userRes = await api.get<UserResponse>(`/users/${profileUserId}`);
      const u = userRes.data;

      setUserId(u.id);
      setUsername(u.username);
      setEmail(u.email);
      setCreatedAt(u.created_at);

      setAvatarUrl(u.profile?.avatar_url || "https://placehold.co/128x128");
      setDescription(u.profile?.description ?? "");
      setAbout(u.profile?.about ?? "");

      setPosts([]);
      await fetchPosts(u.id);
    } catch (err) {
      console.log(err);

      if (axios.isAxiosError(err) && err.response?.status === 404) {
        setError("User not found.");
      } else {
        setError("Failed to load profile. Please try again.");
      }

      setLoadingPosts(false);
    } finally {
      setLoadingProfile(false);
    }
  };

  const handleUpdate = async () => {
    if (!userId) return;

    try {
      setSaving(true);
      setError("");

      const res = await api.put<UserResponse>(`/users/${userId}`, {
        username,
        email,
        avatar_url: avatarUrl,
        description,
        about,
      });

      const u = res.data;

      setUsername(u.username);
      setEmail(u.email);
      setAvatarUrl(u.profile?.avatar_url || "https://placehold.co/128x128");
      setDescription(u.profile?.description ?? "");
      setAbout(u.profile?.about ?? "");

      if (isOwner) {
        await SecureStore.setItemAsync("user", JSON.stringify(u));
      }
    } catch (err) {
      console.log(err);

      if (axios.isAxiosError(err)) {
        const status = err.response?.status;
        const apiError = (err.response?.data as { error?: string } | undefined)
          ?.error;

        if (status === 401) setError("Please sign in to update your profile.");
        else if (status === 403)
          setError("You don't have permission to update this profile.");
        else if (status === 409)
          setError(apiError || "Username or email is already taken.");
        else
          setError(apiError || "Failed to update profile. Please try again.");
      } else {
        setError("Failed to update profile. Please try again.");
      }
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    getProfile();
  }, [profileUserId]);

  const { left, right } = useMemo(() => {
    const l: PostCardProps[] = [];
    const r: PostCardProps[] = [];
    let lh = 0;
    let rh = 0;

    for (const post of posts) {
      const estimatedHeight =
        130 + (post.description?.length ?? 0) * 0.35 + post.title.length * 0.25;

      if (lh <= rh) {
        l.push(post);
        lh += estimatedHeight;
      } else {
        r.push(post);
        rh += estimatedHeight;
      }
    }

    return { left: l, right: r };
  }, [posts]);

  const createdAtLabel = createdAt
    ? new Date(createdAt).toLocaleDateString()
    : "";
  const isEmptyPosts = !loadingPosts && posts.length === 0 && !error;

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

            <View style={{ flexDirection: "row", gap: 14 }}>
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
            ) : null}

            {isEmptyPosts ? (
              <View
                style={{
                  marginTop: 12,
                  backgroundColor: t.surface,
                  borderRadius: 20,
                  borderWidth: 1,
                  borderColor: t.surfaceLiteFocus,
                  padding: 16,
                }}
              >
                <Text style={{ color: t.text, fontWeight: "700" }}>
                  No posts yet
                </Text>
                <Text style={{ color: t.textSecondary, marginTop: 6 }}>
                  {isOwner
                    ? "Create your first post and it will appear here."
                    : "This user hasn't posted anything yet."}
                </Text>
              </View>
            ) : null}

            {!loadingPosts && posts.length > 0 && (
              <View style={{ marginTop: 12 }}>
                <View style={{ flexDirection: "row", gap: 8 }}>
                  <View style={{ flex: 1, gap: 8 }}>
                    {left.map((post) => (
                      <PostCard
                        key={post.id}
                        {...post}
                        editable={isOwner}
                        mode="add"
                      />
                    ))}
                  </View>

                  <View style={{ flex: 1, gap: 8 }}>
                    {right.map((post) => (
                      <PostCard
                        key={post.id}
                        {...post}
                        editable={isOwner}
                        mode="add"
                      />
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
