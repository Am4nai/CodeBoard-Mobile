import { api } from "@/src/api/http";
import { useTheme } from "@/src/theme/useTheme";
import type {
  Collection,
  CollectionWithPostsResponse,
  PostCardProps,
} from "@/src/types/types";
import PostCard from "@/src/ui/components/PostCard";
import axios from "axios";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
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
        paddingVertical: 16,
        alignItems: "center",
        opacity: disabled ? 0.65 : 1,
      })}
    >
      <Text style={{ color: t.textButtons, fontWeight: "600" }}>{label}</Text>
    </Pressable>
  );
}

export default function Collections() {
  const t = useTheme();

  const [isCreating, setIsCreating] = useState(true);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [selectedCollection, setSelectedCollection] =
    useState<Collection | null>(null);
  const [posts, setPosts] = useState<PostCardProps[]>([]);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const [loadingCollections, setLoadingCollections] = useState(true);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");

  const fetchCollections = async () => {
    try {
      setError("");
      setLoadingCollections(true);

      const response = await api.get<Collection[]>("/collections");
      setCollections(response.data);
    } catch (err) {
      console.log(err);
      setError("Failed to load collections. Please try again.");
    } finally {
      setLoadingCollections(false);
    }
  };

  const createCollection = async () => {
    try {
      setError("");

      const name = title.trim();
      const desc = description.trim();

      if (!name) {
        setError("Name is required.");
        return;
      }

      setSaving(true);

      await api.post("/collections", {
        name,
        description: desc || null,
      });

      await fetchCollections();

      setTitle("");
      setDescription("");
    } catch (err) {
      console.log(err);

      if (axios.isAxiosError(err)) {
        const apiError = (err.response?.data as { error?: string } | undefined)
          ?.error;

        setError(apiError || "Failed to create collection. Please try again.");
      } else {
        setError("Failed to create collection. Please try again.");
      }
    } finally {
      setSaving(false);
    }
  };

  const fetchCollectionData = async (collectionId?: number) => {
    const idToLoad = collectionId ?? selectedCollection?.id;
    if (!idToLoad) return;

    try {
      setLoadingPosts(true);
      setError("");

      const res = await api.get<CollectionWithPostsResponse>(
        `/collections/${idToLoad}`,
      );

      const mapped: PostCardProps[] = res.data.posts.map((p) => ({
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

      if (axios.isAxiosError(err)) {
        const apiError = (err.response?.data as { error?: string } | undefined)
          ?.error;

        setError(apiError || "Failed to load collection. Please try again.");
      } else {
        setError("Failed to load collection. Please try again.");
      }

      setPosts([]);
    } finally {
      setLoadingPosts(false);
    }
  };

  const updateSelectedCollection = async () => {
    if (!selectedCollection) return;

    try {
      setError("");

      const name = title.trim();
      const desc = description.trim();

      if (!name) {
        setError("Name is required.");
        return;
      }

      setSaving(true);

      await api.put(`/collections/${selectedCollection.id}`, {
        name,
        description: desc || null,
      });

      await fetchCollections();

      setSelectedCollection((prev) =>
        prev ? { ...prev, name, description: desc } : prev,
      );
    } catch (err) {
      console.log(err);

      if (axios.isAxiosError(err)) {
        const apiError = (err.response?.data as { error?: string } | undefined)
          ?.error;

        setError(apiError || "Failed to update collection. Please try again.");
      } else {
        setError("Failed to update collection. Please try again.");
      }
    } finally {
      setSaving(false);
    }
  };

  const deleteSelectedCollection = async () => {
    if (!selectedCollection) return;

    Alert.alert(
      "Delete collection?",
      "Posts will not be deleted — only the collection and its links.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              setError("");
              setSaving(true);

              await api.delete(`/collections/${selectedCollection.id}`);

              setIsCreating(true);
              setSelectedCollection(null);
              setTitle("");
              setDescription("");
              setPosts([]);

              await fetchCollections();
            } catch (err) {
              console.log(err);

              if (axios.isAxiosError(err)) {
                const apiError = (
                  err.response?.data as { error?: string } | undefined
                )?.error;

                setError(
                  apiError || "Failed to delete collection. Please try again.",
                );
              } else {
                setError("Failed to delete collection. Please try again.");
              }
            } finally {
              setSaving(false);
            }
          },
        },
      ],
    );
  };

  const openCreate = () => {
    setError("");
    setIsCreating(true);
    setSelectedCollection(null);
    setTitle("");
    setDescription("");
    setPosts([]);
  };

  const openEdit = (col: Collection) => {
    setError("");
    setIsCreating(false);
    setSelectedCollection(col);
    setTitle(col.name);
    setDescription(col.description ?? "");
  };

  const removePostFromCollection = async (postId: number) => {
    if (!selectedCollection) return;

    try {
      await api.delete(`/collections/${selectedCollection.id}/posts/${postId}`);
      await fetchCollectionData(selectedCollection.id);
    } catch (err) {
      console.log(err);
      setError("Failed to remove post from collection.");
    }
  };

  useEffect(() => {
    fetchCollections();
  }, []);

  useEffect(() => {
    if (selectedCollection) {
      fetchCollectionData(selectedCollection.id);
    } else {
      setPosts([]);
    }
  }, [selectedCollection?.id]);

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

  const isEmptyPosts =
    !loadingPosts && !error && !isCreating && posts.length === 0;

  const selectorValue = isCreating
    ? "➕ Create collection"
    : (selectedCollection?.name ?? "Select collection...");

  return (
    <View style={{ flex: 1, backgroundColor: t.bg }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 8,
          paddingBottom: 120,
          paddingTop: 32,
        }}
      >
        <View style={{ marginBottom: 14, paddingHorizontal: 8 }}>
          <Text
            style={{
              color: t.text,
              fontSize: 26,
              fontWeight: "800",
              marginBottom: 6,
            }}
          >
            Collections
          </Text>

          <Text style={{ color: t.textSecondary, fontSize: 13 }}>
            Create collections and save posts you want to keep.
          </Text>

          {error ? (
            <View
              style={{
                marginTop: 12,
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
          ) : null}
        </View>

        <View
          style={{
            backgroundColor: t.surface,
            borderRadius: 20,
            borderWidth: 1,
            borderColor: t.surfaceLiteFocus,
            padding: 12,
            marginHorizontal: 8,
          }}
        >
          <SectionTitle>Select a collection</SectionTitle>

          <View
            style={{
              backgroundColor: t.surfaceLite,
              borderRadius: 14,
              paddingHorizontal: 14,
              height: 46,
              justifyContent: "center",
              borderWidth: 1,
              borderColor: t.surfaceLiteFocus,
              marginBottom: 10,
            }}
          >
            <Text style={{ color: t.textSecondary, fontSize: 12 }}>
              Selected
            </Text>
            <Text style={{ color: t.text, fontSize: 14, fontWeight: "600" }}>
              {loadingCollections ? "Loading..." : selectorValue}
            </Text>
          </View>

          <View style={{ gap: 8 }}>
            <Pressable
              onPress={openCreate}
              style={({ pressed }) => ({
                paddingVertical: 12,
                paddingHorizontal: 12,
                borderRadius: 14,
                backgroundColor: pressed ? t.surfaceFocus : t.surfaceLite,
                borderWidth: 1,
                borderColor: t.surfaceLiteFocus,
              })}
            >
              <Text style={{ color: t.text, fontWeight: "600" }}>
                ➕ Create collection
              </Text>
            </Pressable>

            {collections.map((col) => (
              <Pressable
                key={col.id}
                onPress={() => openEdit(col)}
                style={({ pressed }) => ({
                  paddingVertical: 12,
                  paddingHorizontal: 12,
                  borderRadius: 14,
                  backgroundColor: pressed ? t.surfaceFocus : t.surfaceLite,
                  borderWidth: 1,
                  borderColor: t.surfaceLiteFocus,
                })}
              >
                <Text style={{ color: t.text, fontWeight: "600" }}>
                  {col.name}
                </Text>

                {col.description ? (
                  <Text style={{ color: t.textSecondary, marginTop: 4 }}>
                    {col.description}
                  </Text>
                ) : null}
              </Pressable>
            ))}
          </View>
        </View>

        {isCreating ? (
          <View
            style={{
              marginTop: 14,
              backgroundColor: t.surface,
              borderRadius: 20,
              borderWidth: 1,
              borderColor: t.surfaceLiteFocus,
              padding: 12,
              marginHorizontal: 8,
            }}
          >
            <Text
              style={{
                color: t.text,
                fontSize: 18,
                fontWeight: "700",
                marginBottom: 10,
              }}
            >
              Create collection
            </Text>

            <SectionTitle>Name</SectionTitle>
            <InputBase
              placeholder="My collection..."
              value={title}
              onChangeText={(v) => {
                setTitle(v);
                if (error) setError("");
              }}
            />

            <View style={{ height: 12 }} />

            <SectionTitle>Description (optional)</SectionTitle>
            <InputBase
              placeholder="Short description..."
              value={description}
              onChangeText={(v) => {
                setDescription(v);
                if (error) setError("");
              }}
            />

            <View style={{ height: 14 }} />

            <ActionButton
              label={saving ? "Creating..." : "Create"}
              onPress={createCollection}
              variant="primary"
              disabled={saving}
            />
          </View>
        ) : (
          <View style={{ marginTop: 14 }}>
            <View
              style={{
                backgroundColor: t.surface,
                borderRadius: 20,
                borderWidth: 1,
                borderColor: t.surfaceLiteFocus,
                padding: 12,
                marginHorizontal: 8,
              }}
            >
              <Text
                style={{
                  color: t.text,
                  fontSize: 18,
                  fontWeight: "700",
                  marginBottom: 10,
                }}
              >
                Edit collection
              </Text>

              <SectionTitle>Name</SectionTitle>
              <InputBase
                placeholder="Title..."
                value={title}
                onChangeText={(v) => {
                  setTitle(v);
                  if (error) setError("");
                }}
              />

              <View style={{ height: 12 }} />

              <SectionTitle>Description (optional)</SectionTitle>
              <InputBase
                placeholder="Description..."
                value={description}
                onChangeText={(v) => {
                  setDescription(v);
                  if (error) setError("");
                }}
              />

              <View style={{ height: 14 }} />

              <View style={{ flexDirection: "row", gap: 10 }}>
                <View style={{ flex: 1 }}>
                  <ActionButton
                    label={saving ? "Saving..." : "Update"}
                    onPress={updateSelectedCollection}
                    variant="secondary"
                    disabled={saving}
                  />
                </View>

                <View style={{ flex: 1 }}>
                  <ActionButton
                    label="Delete"
                    onPress={deleteSelectedCollection}
                    variant="primary"
                    disabled={saving}
                  />
                </View>
              </View>
            </View>

            <View style={{ marginTop: 16 }}>
              {loadingPosts ? (
                <View
                  style={{
                    backgroundColor: t.surface,
                    borderRadius: 20,
                    borderWidth: 1,
                    borderColor: t.surfaceLiteFocus,
                    padding: 16,
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 10,
                    marginHorizontal: 8,
                  }}
                >
                  <ActivityIndicator />
                  <Text style={{ color: t.textSecondary }}>
                    Loading posts...
                  </Text>
                </View>
              ) : null}

              {!loadingPosts && posts.length > 0 && (
                <>
                  <View style={{ flexDirection: "row", gap: 8 }}>
                    <View style={{ flex: 1, gap: 8 }}>
                      {left.map((post) => (
                        <View key={post.id} style={{ gap: 8 }}>
                          <PostCard {...post} />

                          <Pressable
                            onPress={() => removePostFromCollection(post.id)}
                            style={({ pressed }) => ({
                              backgroundColor: pressed
                                ? t.surfaceFocus
                                : t.surfaceLite,
                              borderRadius: 14,
                              borderWidth: 1,
                              borderColor: t.surfaceLiteFocus,
                              paddingVertical: 10,
                              alignItems: "center",
                            })}
                          >
                            <Text style={{ color: t.error, fontWeight: "600" }}>
                              Remove
                            </Text>
                          </Pressable>
                        </View>
                      ))}
                    </View>

                    <View style={{ flex: 1, gap: 8 }}>
                      {right.map((post) => (
                        <View key={post.id} style={{ gap: 8 }}>
                          <PostCard {...post} />

                          <Pressable
                            onPress={() => removePostFromCollection(post.id)}
                            style={({ pressed }) => ({
                              backgroundColor: pressed
                                ? t.surfaceFocus
                                : t.surfaceLite,
                              borderRadius: 14,
                              borderWidth: 1,
                              borderColor: t.surfaceLiteFocus,
                              paddingVertical: 10,
                              alignItems: "center",
                            })}
                          >
                            <Text style={{ color: t.error, fontWeight: "600" }}>
                              Remove
                            </Text>
                          </Pressable>
                        </View>
                      ))}
                    </View>
                  </View>
                </>
              )}
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
