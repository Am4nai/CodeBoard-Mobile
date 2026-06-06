import { api } from "@/src/api/http";
import axios from "axios";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

export type Tag = {
  id: number;
  name: string;
  posts_count: number;
};

interface TagsModalProps {
  visible: boolean;
  onClose: () => void;
  selectedTags: Tag[];
  setSelectedTags: React.Dispatch<React.SetStateAction<Tag[]>>;
  theme: any;
}

export default function TagsModal({
  visible,
  onClose,
  selectedTags,
  setSelectedTags,
  theme: t,
}: TagsModalProps) {
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [foundTags, setFoundTags] = useState<Tag[]>([]);
  const [tagSearch, setTagSearch] = useState("");
  const [newTagInput, setNewTagInput] = useState("");

  const [tagsLoading, setTagsLoading] = useState(false);
  const [createTagLoading, setCreateTagLoading] = useState(false);
  const [tagsError, setTagsError] = useState("");

  useEffect(() => {
    if (!visible) return;

    const loadAllTags = async () => {
      try {
        setTagsLoading(true);
        setTagsError("");

        const res = await api.get<Tag[]>("/tags");

        setAllTags(res.data);
        setFoundTags(
          res.data.filter(
            (tag) => !selectedTags.some((selected) => selected.id === tag.id),
          ),
        );
      } catch (err) {
        if (axios.isAxiosError(err)) {
          const apiError = (
            err.response?.data as { error?: string } | undefined
          )?.error;
          setTagsError(apiError || "Failed to load tags.");
        } else {
          setTagsError("Failed to load tags.");
        }
      } finally {
        setTagsLoading(false);
      }
    };

    loadAllTags();
  }, [visible]);

  useEffect(() => {
    if (!visible) return;

    const timer = setTimeout(async () => {
      const query = tagSearch.trim();

      try {
        setTagsLoading(true);
        setTagsError("");

        if (!query) {
          setFoundTags(
            allTags.filter(
              (tag) => !selectedTags.some((selected) => selected.id === tag.id),
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
            (tag) => !selectedTags.some((selected) => selected.id === tag.id),
          ),
        );
      } catch (err) {
        if (axios.isAxiosError(err)) {
          const apiError = (
            err.response?.data as { error?: string } | undefined
          )?.error;
          setTagsError(apiError || "Failed to search tags.");
        } else {
          setTagsError("Failed to search tags.");
        }
      } finally {
        setTagsLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [tagSearch, visible, allTags, selectedTags]);

  const addExistingTag = (tag: Tag) => {
    if (selectedTags.some((selected) => selected.id === tag.id)) return;
    setSelectedTags((prev) => [...prev, tag]);
    setFoundTags((prev) => prev.filter((item) => item.id !== tag.id));
  };

  const removeSelectedTag = (tagId: number) => {
    setSelectedTags((prev) => prev.filter((tag) => tag.id !== tagId));
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

  const handleClose = () => {
    setTagSearch("");
    setNewTagInput("");
    setTagsError("");
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: t.surface }]}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: t.text }]}>Manage tags</Text>
            <Pressable
              onPress={handleClose}
              style={({ pressed }) => [
                styles.closeBtn,
                { backgroundColor: pressed ? t.surfaceFocus : t.surfaceLite },
              ]}
            >
              <Text style={{ color: t.text, fontSize: 14 }}>Close</Text>
            </Pressable>
          </View>

          {tagsError ? (
            <View
              style={[
                styles.errorBox,
                {
                  backgroundColor: "rgba(239, 68, 68, 0.1)",
                  borderColor: "rgba(239, 68, 68, 0.3)",
                },
              ]}
            >
              <Text style={styles.errorText}>{tagsError}</Text>
            </View>
          ) : null}

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ gap: 16 }}
          >
            <View style={styles.section}>
              <Text style={[styles.label, { color: t.textSecondary }]}>
                Selected tags
              </Text>
              <View
                style={[
                  styles.tagsContainer,
                  { backgroundColor: t.surfaceLite },
                ]}
              >
                {selectedTags.length > 0 ? (
                  selectedTags.map((tag) => (
                    <View
                      key={tag.id}
                      style={[
                        styles.tagChip,
                        {
                          backgroundColor: "rgba(59, 130, 246, 0.15)",
                          borderColor: "rgba(59, 130, 246, 0.3)",
                        },
                      ]}
                    >
                      <Text style={{ color: t.text, fontSize: 13 }}>
                        #{tag.name}
                      </Text>
                      <Pressable onPress={() => removeSelectedTag(tag.id)}>
                        <Text
                          style={{
                            color: t.textSecondary,
                            fontSize: 16,
                            marginLeft: 4,
                            fontWeight: "bold",
                          }}
                        >
                          ×
                        </Text>
                      </Pressable>
                    </View>
                  ))
                ) : (
                  <Text style={{ color: t.textSecondary, fontSize: 13 }}>
                    No tags selected
                  </Text>
                )}
              </View>
            </View>

            <View style={styles.section}>
              <Text style={[styles.label, { color: t.textSecondary }]}>
                Find existing tag
              </Text>
              <TextInput
                value={tagSearch}
                onChangeText={setTagSearch}
                placeholder="Search among existing tags..."
                placeholderTextColor={t.textSecondary}
                style={[
                  styles.input,
                  {
                    backgroundColor: t.surfaceLite,
                    color: t.text,
                    borderColor: t.surfaceLiteFocus,
                  },
                ]}
              />
              <View
                style={[
                  styles.tagsContainer,
                  { backgroundColor: t.surfaceLite, minHeight: 100 },
                ]}
              >
                {tagsLoading ? (
                  <ActivityIndicator color={t.primary} />
                ) : foundTags.length > 0 ? (
                  foundTags.map((tag) => (
                    <Pressable
                      key={tag.id}
                      onPress={() => addExistingTag(tag)}
                      style={({ pressed }) => [
                        styles.tagChip,
                        {
                          backgroundColor: pressed
                            ? "rgba(59, 130, 246, 0.25)"
                            : "rgba(59, 130, 246, 0.1)",
                          borderColor: "rgba(59, 130, 246, 0.3)",
                        },
                      ]}
                    >
                      <Text style={{ color: t.text, fontSize: 13 }}>
                        + #{tag.name}
                      </Text>
                    </Pressable>
                  ))
                ) : (
                  <Text style={{ color: t.textSecondary, fontSize: 13 }}>
                    Nothing found. You can create a new tag below.
                  </Text>
                )}
              </View>
            </View>

            <View style={styles.section}>
              <Text style={[styles.label, { color: t.textSecondary }]}>
                Create new tag
              </Text>
              <View style={styles.createRow}>
                <TextInput
                  value={newTagInput}
                  onChangeText={setNewTagInput}
                  placeholder="Enter a new tag..."
                  placeholderTextColor={t.textSecondary}
                  style={[
                    styles.input,
                    {
                      flex: 1,
                      marginBottom: 0,
                      backgroundColor: t.surfaceLite,
                      color: t.text,
                      borderColor: t.surfaceLiteFocus,
                    },
                  ]}
                />
                <Pressable
                  onPress={createNewTag}
                  disabled={createTagLoading}
                  style={({ pressed }) => [
                    styles.createBtn,
                    {
                      backgroundColor: t.primary,
                      opacity: createTagLoading ? 0.7 : pressed ? 0.9 : 1,
                    },
                  ]}
                >
                  {createTagLoading ? (
                    <ActivityIndicator color={t.textButtons} size="small" />
                  ) : (
                    <Text style={{ color: t.textButtons, fontWeight: "600" }}>
                      Create
                    </Text>
                  )}
                </Pressable>
              </View>
              <Text
                style={{ color: t.textSecondary, fontSize: 11, marginTop: 4 }}
              >
                Create a new tag only if there is no suitable existing tag.
              </Text>
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <Pressable
              onPress={handleClose}
              style={({ pressed }) => [
                styles.doneBtn,
                { backgroundColor: t.primary, opacity: pressed ? 0.9 : 1 },
              ]}
            >
              <Text style={{ color: t.textButtons, fontWeight: "600" }}>
                Done
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "flex-end",
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: "90%",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
  },
  closeBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  errorBox: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginBottom: 16,
  },
  errorText: {
    color: "#ef4444",
    fontSize: 13,
  },
  section: {
    marginBottom: 4,
  },
  label: {
    fontSize: 13,
    marginBottom: 6,
  },
  tagsContainer: {
    borderRadius: 12,
    padding: 12,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    minHeight: 60,
    alignItems: "center",
  },
  tagChip: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  input: {
    height: 46,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    fontSize: 14,
    marginBottom: 8,
  },
  createRow: {
    flexDirection: "row",
    gap: 8,
  },
  createBtn: {
    height: 46,
    paddingHorizontal: 16,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 16,
    paddingBottom: 10,
  },
  doneBtn: {
    height: 46,
    paddingHorizontal: 24,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
});
