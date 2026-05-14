import { api } from "@/src/api/http";
import { useAuth } from "@/src/hooks/auth/useAuth";
import { useTheme } from "@/src/theme/useTheme";
import type { Language, PostByIdResponse, Tag } from "@/src/types/types";
import axios from "axios";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
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
          minHeight: 46,
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

export default function EditPostPage() {
  const t = useTheme();
  const router = useRouter();
  const { user } = useAuth();
  const { id } = useLocalSearchParams<{ id: string }>();

  const postId = Number(id);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [about, setAbout] = useState("");
  const [code, setCode] = useState("");

  const [languages, setLanguages] = useState<Language[]>([]);
  const [languageId, setLanguageId] = useState<number | "">("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");

  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [foundTags, setFoundTags] = useState<Tag[]>([]);
  const [tagSearch, setTagSearch] = useState("");
  const [newTagInput, setNewTagInput] = useState("");
  const [isTagsModalOpen, setIsTagsModalOpen] = useState(false);
  const [tagsLoading, setTagsLoading] = useState(false);
  const [createTagLoading, setCreateTagLoading] = useState(false);
  const [tagsError, setTagsError] = useState("");

  const lineNumbers = useMemo(() => {
    const count = Math.max(1, code.split("\n").length);
    return Array.from({ length: count }, (_, i) => i + 1);
  }, [code]);

  const loadLanguages = async () => {
    try {
      const res = await api.get<Language[]>("/languages");
      setLanguages(res.data);
    } catch {
      setLanguages([]);
    }
  };

  const fetchPost = async () => {
    if (!Number.isFinite(postId)) {
      setError("Invalid post id.");
      setLoading(false);
      return;
    }

    try {
      setError("");
      setLoading(true);

      const postRes = await api.get<PostByIdResponse>(`/posts/${postId}`);
      const p = postRes.data;

      setTitle(p.title);
      setCode(p.code);
      setDescription(p.description ?? "");
      setAbout(p.about ?? "");
      setLanguageId(p.language_id);
      setSelectedTags(
        (p.tags ?? []).map((tag, index) => ({
          id: -(index + 1),
          name: tag,
          posts_count: 0,
        })),
      );
    } catch (err) {
      console.log(err);

      if (axios.isAxiosError(err)) {
        const status = err.response?.status;
        const apiError = (err.response?.data as { error?: string } | undefined)
          ?.error;

        if (status === 404) setError("Post not found.");
        else setError(apiError || "Failed to load post. Please try again.");
      } else {
        setError("Failed to load post. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const loadAllTags = async () => {
    try {
      setTagsLoading(true);
      setTagsError("");

      const res = await api.get<Tag[]>("/tags");
      setAllTags(res.data);

      setFoundTags(
        res.data.filter(
          (tag) =>
            !selectedTags.some(
              (selected) =>
                selected.name.toLowerCase() === tag.name.toLowerCase(),
            ),
        ),
      );
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const apiError = (err.response?.data as { error?: string } | undefined)
          ?.error;
        setTagsError(apiError || "Failed to load tags.");
      } else {
        setTagsError("Failed to load tags.");
      }
    } finally {
      setTagsLoading(false);
    }
  };

  const searchTags = async () => {
    const query = tagSearch.trim();

    try {
      setTagsLoading(true);
      setTagsError("");

      if (!query) {
        setFoundTags(
          allTags.filter(
            (tag) =>
              !selectedTags.some(
                (selected) =>
                  selected.name.toLowerCase() === tag.name.toLowerCase(),
              ),
          ),
        );
        return;
      }

      const res = await api.get<Tag[]>("/tags/search", {
        params: {
          q: query,
          limit: 10,
        },
      });

      setFoundTags(
        res.data.filter(
          (tag) =>
            !selectedTags.some(
              (selected) =>
                selected.name.toLowerCase() === tag.name.toLowerCase(),
            ),
        ),
      );
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const apiError = (err.response?.data as { error?: string } | undefined)
          ?.error;
        setTagsError(apiError || "Failed to search tags.");
      } else {
        setTagsError("Failed to search tags.");
      }
    } finally {
      setTagsLoading(false);
    }
  };

  const addExistingTag = (tag: Tag) => {
    const alreadySelected = selectedTags.some(
      (selected) => selected.name.toLowerCase() === tag.name.toLowerCase(),
    );

    if (alreadySelected) return;

    setSelectedTags((prev) => [...prev, tag]);
    setFoundTags((prev) => prev.filter((item) => item.id !== tag.id));
  };

  const removeSelectedTag = (tagName: string) => {
    setSelectedTags((prev) => prev.filter((tag) => tag.name !== tagName));
  };

  const createNewTag = async () => {
    const normalized = newTagInput.trim().replace(/^#/, "").toLowerCase();

    if (!normalized) return;

    const existsInSelected = selectedTags.some(
      (tag) => tag.name.toLowerCase() === normalized,
    );

    if (existsInSelected) {
      setNewTagInput("");
      return;
    }

    try {
      setCreateTagLoading(true);
      setTagsError("");

      const res = await api.post<Tag>("/tags", {
        name: normalized,
      });

      const createdTag = res.data;

      setSelectedTags((prev) => [...prev, createdTag]);
      setAllTags((prev) => {
        const alreadyExists = prev.some((tag) => tag.id === createdTag.id);
        if (alreadyExists) return prev;
        return [...prev, createdTag].sort((a, b) =>
          a.name.localeCompare(b.name),
        );
      });

      setFoundTags((prev) => prev.filter((tag) => tag.id !== createdTag.id));
      setNewTagInput("");
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const status = err.response?.status;
        const apiError = (err.response?.data as { error?: string } | undefined)
          ?.error;

        if (status === 409) {
          setTagsError("This tag already exists. Try searching for it.");
          return;
        }

        if (status === 400) {
          setTagsError(apiError || "Tag name is required.");
          return;
        }

        setTagsError(apiError || "Failed to create tag.");
        return;
      }

      setTagsError("Failed to create tag.");
    } finally {
      setCreateTagLoading(false);
    }
  };

  const openTagsModal = async () => {
    setIsTagsModalOpen(true);
    await loadAllTags();
  };

  const closeTagsModal = () => {
    setIsTagsModalOpen(false);
    setTagSearch("");
    setNewTagInput("");
    setTagsError("");
  };

  const postUpdate = async () => {
    if (!Number.isFinite(postId)) return;

    const cleanTitle = title.trim();
    const cleanCode = code.trim();

    if (!cleanTitle || !cleanCode || languageId === "") {
      setError("Please fill in title, code, and select a language.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      await api.put(`/posts/${postId}`, {
        title: cleanTitle,
        code,
        language_id: Number(languageId),
        description: description.trim() || null,
        about: about.trim() || null,
        tags: selectedTags.map((tag) => tag.name),
      });

      if (user?.id) {
        router.replace({
          pathname: "/(tabs)/profile",
          params: { id: String(user.id) },
        });
      }
    } catch (err) {
      console.log(err);

      if (axios.isAxiosError(err)) {
        const status = err.response?.status;
        const apiError = (err.response?.data as { error?: string } | undefined)
          ?.error;

        if (status === 401) setError("You need to log in to edit a post.");
        else if (status === 403)
          setError("You can't edit someone else's post.");
        else setError(apiError || "Failed to update post. Please try again.");
      } else {
        setError("Failed to update post. Please try again.");
      }
    } finally {
      setSaving(false);
    }
  };

  const postDelete = async () => {
    if (!Number.isFinite(postId)) return;

    Alert.alert("Delete post?", "This action cannot be undone.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            setSaving(true);
            setError("");

            await api.delete(`/posts/${postId}`);

            if (user?.id) {
              router.replace({
                pathname: "/(tabs)/profile",
                params: { id: String(user.id) },
              });
            }
          } catch (err) {
            console.log(err);

            if (axios.isAxiosError(err)) {
              const status = err.response?.status;
              const apiError = (
                err.response?.data as { error?: string } | undefined
              )?.error;

              if (status === 401)
                setError("You need to log in to delete a post.");
              else if (status === 403)
                setError("You can't delete someone else's post.");
              else setError(apiError || "Failed to delete post.");
            } else {
              setError("Failed to delete post.");
            }
          } finally {
            setSaving(false);
          }
        },
      },
    ]);
  };

  useEffect(() => {
    loadLanguages();
    fetchPost();
  }, [id]);

  useEffect(() => {
    if (!isTagsModalOpen) return;

    const timer = setTimeout(() => {
      searchTags();
    }, 300);

    return () => clearTimeout(timer);
  }, [tagSearch, isTagsModalOpen, allTags, selectedTags]);

  return (
    <View style={{ flex: 1, backgroundColor: t.bg }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: 48,
          paddingHorizontal: 16,
          paddingBottom: 120,
        }}
      >
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => ({
            width: 42,
            height: 42,
            borderRadius: 14,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: pressed ? t.surfaceFocus : t.surfaceLite,
            borderWidth: 1,
            borderColor: t.surfaceLiteFocus,
            marginBottom: 18,
          })}
        >
          <Text style={{ color: t.text, fontSize: 20 }}>←</Text>
        </Pressable>

        <Text
          style={{
            color: t.text,
            fontSize: 26,
            fontWeight: "800",
            marginBottom: 6,
          }}
        >
          Edit post
        </Text>

        <Text
          style={{ color: t.textSecondary, fontSize: 13, marginBottom: 16 }}
        >
          Update your post details or delete it permanently.
        </Text>

        {error ? (
          <View
            style={{
              backgroundColor: `${t.error}20`,
              borderWidth: 1,
              borderColor: `${t.error}60`,
              borderRadius: 12,
              padding: 12,
              marginBottom: 14,
            }}
          >
            <Text style={{ color: t.error, fontSize: 13 }}>{error}</Text>
          </View>
        ) : null}

        {loading ? (
          <View
            style={{
              backgroundColor: t.surface,
              borderRadius: 18,
              borderWidth: 1,
              borderColor: t.surfaceLiteFocus,
              padding: 16,
              flexDirection: "row",
              alignItems: "center",
              gap: 10,
            }}
          >
            <ActivityIndicator />
            <Text style={{ color: t.textSecondary }}>Loading post...</Text>
          </View>
        ) : (
          <>
            <View
              style={{
                backgroundColor: t.surface,
                borderRadius: 20,
                borderWidth: 1,
                borderColor: t.surfaceLiteFocus,
                padding: 14,
                marginBottom: 14,
              }}
            >
              <SectionTitle>Title</SectionTitle>
              <InputBase
                placeholder="Title..."
                value={title}
                onChangeText={setTitle}
                editable={!saving}
              />
            </View>

            <View
              style={{
                backgroundColor: t.surface,
                borderRadius: 20,
                borderWidth: 1,
                borderColor: t.surfaceLiteFocus,
                padding: 14,
                marginBottom: 14,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  marginBottom: 10,
                }}
              >
                <Text
                  style={{ color: t.text, fontSize: 16, fontWeight: "700" }}
                >
                  Code
                </Text>
                <Text style={{ color: t.textSecondary, fontSize: 12 }}>
                  {saving ? "Saving..." : ""}
                </Text>
              </View>

              <View
                style={{
                  flexDirection: "row",
                  backgroundColor: t.surfaceLite,
                  borderRadius: 16,
                  borderWidth: 1,
                  borderColor: t.surfaceLiteFocus,
                  overflow: "hidden",
                  minHeight: 300,
                }}
              >
                <View
                  style={{
                    backgroundColor: t.surfaceFocus,
                    borderRightWidth: 1,
                    borderRightColor: t.surfaceLiteFocus,
                    paddingVertical: 12,
                    paddingHorizontal: 8,
                  }}
                >
                  {lineNumbers.map((line) => (
                    <Text
                      key={line}
                      style={{
                        color: t.textSecondary,
                        fontFamily: "monospace",
                        fontSize: 12,
                        lineHeight: 20,
                        textAlign: "right",
                      }}
                    >
                      {line}
                    </Text>
                  ))}
                </View>

                <TextInput
                  value={code}
                  onChangeText={setCode}
                  editable={!saving}
                  multiline
                  autoCorrect={false}
                  spellCheck={false}
                  textAlignVertical="top"
                  style={{
                    flex: 1,
                    color: t.text,
                    fontFamily: "monospace",
                    fontSize: 12,
                    lineHeight: 20,
                    padding: 12,
                    minHeight: 300,
                  }}
                />
              </View>
            </View>

            <View
              style={{
                backgroundColor: t.surface,
                borderRadius: 20,
                borderWidth: 1,
                borderColor: t.surfaceLiteFocus,
                padding: 14,
                marginBottom: 14,
              }}
            >
              <SectionTitle>Language</SectionTitle>

              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                {languages.map((lang) => {
                  const active = languageId === lang.id;

                  return (
                    <Pressable
                      key={lang.id}
                      onPress={() => setLanguageId(lang.id)}
                      disabled={saving}
                      style={({ pressed }) => ({
                        backgroundColor: active
                          ? t.secondary
                          : pressed
                            ? t.surfaceFocus
                            : t.surfaceLite,
                        borderRadius: 999,
                        borderWidth: 1,
                        borderColor: active ? t.secondary : t.surfaceLiteFocus,
                        paddingHorizontal: 12,
                        paddingVertical: 8,
                      })}
                    >
                      <Text
                        style={{
                          color: active ? t.textButtons : t.textSecondary,
                          fontSize: 12,
                          fontWeight: "600",
                        }}
                      >
                        {lang.name}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              <View style={{ marginTop: 14 }}>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 8,
                  }}
                >
                  <SectionTitle>Tags</SectionTitle>

                  <Pressable onPress={openTagsModal} disabled={saving}>
                    <Text style={{ color: t.textSecondary, fontWeight: "700" }}>
                      Manage tags
                    </Text>
                  </Pressable>
                </View>

                <View
                  style={{
                    backgroundColor: t.surfaceLite,
                    borderRadius: 14,
                    borderWidth: 1,
                    borderColor: t.surfaceLiteFocus,
                    padding: 10,
                    minHeight: 48,
                    flexDirection: "row",
                    flexWrap: "wrap",
                    gap: 8,
                    alignItems: "center",
                  }}
                >
                  {selectedTags.length > 0 ? (
                    selectedTags.map((tag) => (
                      <Text
                        key={`${tag.id}-${tag.name}`}
                        style={{
                          color: t.textSecondary,
                          backgroundColor: t.surfaceFocus,
                          borderRadius: 999,
                          paddingHorizontal: 10,
                          paddingVertical: 8,
                          justifyContent: "center",
                          overflow: "hidden",
                          height: 36,
                        }}
                      >
                        #{tag.name}
                      </Text>
                    ))
                  ) : (
                    <Text style={{ color: t.textSecondary }}>
                      No tags selected
                    </Text>
                  )}
                </View>
              </View>

              <View style={{ marginTop: 14 }}>
                <SectionTitle>Description</SectionTitle>
                <TextArea
                  value={description}
                  onChangeText={setDescription}
                  editable={!saving}
                  placeholder="Description..."
                  style={{
                    minHeight: 100,
                    color: t.textSecondary,
                  }}
                />
              </View>

              <View style={{ marginTop: 14 }}>
                <SectionTitle>About</SectionTitle>
                <TextArea
                  value={about}
                  onChangeText={setAbout}
                  editable={!saving}
                  placeholder="About..."
                  style={{
                    minHeight: 160,
                    color: t.textSecondary,
                  }}
                />
              </View>

              <View style={{ flexDirection: "row", gap: 10, marginTop: 16 }}>
                <View style={{ flex: 1 }}>
                  <Pressable
                    onPress={postUpdate}
                    disabled={saving}
                    style={({ pressed }) => ({
                      backgroundColor: pressed ? t.secondaryHover : t.secondary,
                      borderRadius: 16,
                      paddingVertical: 15,
                      alignItems: "center",
                      opacity: saving ? 0.65 : 1,
                    })}
                  >
                    <Text style={{ color: t.textButtons, fontWeight: "700" }}>
                      {saving ? "Saving..." : "Update"}
                    </Text>
                  </Pressable>
                </View>

                <View style={{ flex: 1 }}>
                  <Pressable
                    onPress={postDelete}
                    disabled={saving}
                    style={({ pressed }) => ({
                      backgroundColor: pressed ? t.primaryHover : t.primary,
                      borderRadius: 16,
                      paddingVertical: 15,
                      alignItems: "center",
                      opacity: saving ? 0.65 : 1,
                    })}
                  >
                    <Text style={{ color: t.textButtons, fontWeight: "700" }}>
                      Delete
                    </Text>
                  </Pressable>
                </View>
              </View>
            </View>
          </>
        )}
      </ScrollView>

      <Modal visible={isTagsModalOpen} animationType="slide" transparent>
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.6)",
            justifyContent: "center",
            padding: 16,
          }}
        >
          <View
            style={{
              backgroundColor: t.surface,
              borderRadius: 22,
              borderWidth: 1,
              borderColor: t.surfaceLiteFocus,
              padding: 16,
              maxHeight: "88%",
            }}
          >
            <ScrollView showsVerticalScrollIndicator={false}>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 16,
                }}
              >
                <Text
                  style={{ color: t.text, fontSize: 20, fontWeight: "800" }}
                >
                  Manage tags
                </Text>

                <Pressable onPress={closeTagsModal}>
                  <Text style={{ color: t.textSecondary, fontWeight: "700" }}>
                    Close
                  </Text>
                </Pressable>
              </View>

              {tagsError ? (
                <View
                  style={{
                    backgroundColor: `${t.error}20`,
                    borderWidth: 1,
                    borderColor: `${t.error}60`,
                    borderRadius: 12,
                    padding: 10,
                    marginBottom: 12,
                  }}
                >
                  <Text style={{ color: t.error, fontSize: 13 }}>
                    {tagsError}
                  </Text>
                </View>
              ) : null}

              <SectionTitle>Selected tags</SectionTitle>

              <View
                style={{
                  backgroundColor: t.surfaceLite,
                  borderRadius: 14,
                  borderWidth: 1,
                  borderColor: t.surfaceLiteFocus,
                  padding: 10,
                  minHeight: 52,
                  flexDirection: "row",
                  flexWrap: "wrap",
                  gap: 8,
                  marginBottom: 14,
                }}
              >
                {selectedTags.length > 0 ? (
                  selectedTags.map((tag) => (
                    <Pressable
                      key={`${tag.id}-${tag.name}`}
                      onPress={() => removeSelectedTag(tag.name)}
                      style={({ pressed }) => ({
                        backgroundColor: pressed
                          ? t.surfaceLiteFocus
                          : t.surfaceFocus,
                        borderRadius: 999,
                        paddingHorizontal: 10,
                        paddingVertical: 6,
                      })}
                    >
                      <Text style={{ color: t.textSecondary }}>
                        #{tag.name} ×
                      </Text>
                    </Pressable>
                  ))
                ) : (
                  <Text style={{ color: t.textSecondary }}>
                    No tags selected
                  </Text>
                )}
              </View>

              <SectionTitle>Find existing tag</SectionTitle>
              <InputBase
                value={tagSearch}
                onChangeText={setTagSearch}
                placeholder="Search among existing tags..."
                style={{ marginBottom: 12 }}
              />

              <View
                style={{
                  backgroundColor: t.surfaceLite,
                  borderRadius: 14,
                  borderWidth: 1,
                  borderColor: t.surfaceLiteFocus,
                  padding: 10,
                  minHeight: 120,
                  flexDirection: "row",
                  flexWrap: "wrap",
                  alignContent: "flex-start",
                  gap: 8,
                  marginBottom: 14,
                }}
              >
                {tagsLoading ? (
                  <Text style={{ color: t.textSecondary }}>
                    Loading tags...
                  </Text>
                ) : foundTags.length > 0 ? (
                  foundTags.map((tag) => (
                    <Pressable
                      key={tag.id}
                      onPress={() => addExistingTag(tag)}
                      style={({ pressed }) => ({
                        backgroundColor: pressed
                          ? t.surfaceFocus
                          : t.surfaceLite,
                        borderWidth: 1,
                        borderColor: t.surfaceLiteFocus,
                        borderRadius: 999,
                        paddingHorizontal: 10,
                        paddingVertical: 6,
                      })}
                    >
                      <Text style={{ color: t.textSecondary }}>
                        + #{tag.name}
                      </Text>
                    </Pressable>
                  ))
                ) : (
                  <Text style={{ color: t.textSecondary }}>
                    Nothing found. You can create a new tag below.
                  </Text>
                )}
              </View>

              <SectionTitle>Create new tag</SectionTitle>

              <InputBase
                value={newTagInput}
                onChangeText={setNewTagInput}
                placeholder="Enter a new tag..."
                style={{ marginBottom: 10 }}
              />

              <Pressable
                onPress={createNewTag}
                disabled={createTagLoading}
                style={({ pressed }) => ({
                  backgroundColor: pressed ? t.primaryHover : t.primary,
                  borderRadius: 16,
                  paddingVertical: 14,
                  alignItems: "center",
                  opacity: createTagLoading ? 0.65 : 1,
                })}
              >
                <Text style={{ color: t.textButtons, fontWeight: "700" }}>
                  {createTagLoading ? "Creating..." : "Create"}
                </Text>
              </Pressable>

              <Text
                style={{
                  color: t.textSecondary,
                  fontSize: 12,
                  marginTop: 10,
                }}
              >
                Create a new tag only if there is no suitable existing tag.
              </Text>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}
