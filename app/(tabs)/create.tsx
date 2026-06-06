import { api } from "@/src/api/http";
import { useTheme } from "@/src/theme/useTheme";
import CameraModal from "@/src/ui/components/cameraModal";
import TagsModal, { Tag } from "@/src/ui/components/TagsModal";
import axios from "axios";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";

type Language = {
  id: number;
  name: string;
};

function SectionTitle({ children }: { children: React.ReactNode }) {
  const t = useTheme();

  return (
    <Text
      style={{
        color: t.textSecondary,
        fontSize: 13,
        marginBottom: 6,
      }}
    >
      {children}
    </Text>
  );
}

function LanguageChip({
  label,
  isSelected,
  onPress,
}: {
  label: string;
  isSelected: boolean;
  onPress: () => void;
}) {
  const t = useTheme();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        backgroundColor: isSelected
          ? t.primary
          : pressed
            ? t.surfaceFocus
            : t.surfaceLite,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 999,
        marginRight: 8,
        borderWidth: 1,
        borderColor: isSelected ? t.primary : t.surfaceLiteFocus,
      })}
    >
      <Text
        style={{
          color: isSelected ? t.textButtons : t.textSecondary,
          fontSize: 12,
          fontWeight: isSelected ? "600" : "400",
        }}
      >
        {label}
      </Text>
    </Pressable>
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

export default function Create() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [about, setAbout] = useState("");
  const [code, setCode] = useState("");

  const [languages, setLanguages] = useState<Language[]>([]);
  const [languageId, setLanguageId] = useState<number | "">("");

  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);
  const [isTagsModalOpen, setIsTagsModalOpen] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const t = useTheme();

  useEffect(() => {
    const loadLanguages = async () => {
      try {
        const res = await api.get<Language[]>("/languages");
        setLanguages(res.data);
      } catch {}
    };

    loadLanguages();
  }, []);

  const handleSubmit = async () => {
    if (
      !title.trim() ||
      !description.trim() ||
      !code.trim() ||
      languageId === ""
    ) {
      Alert.alert(
        "Error",
        "Please fill in title, description, code, and select a language.",
      );
      return;
    }

    try {
      setLoading(true);

      await api.post("/posts", {
        title: title.trim(),
        code,
        language_id: Number(languageId),
        description: description.trim(),
        about: about.trim() || null,
        tags: selectedTags.map((tag) => tag.name),
      });

      Alert.alert("Success", "Post created.");

      setTitle("");
      setDescription("");
      setAbout("");
      setCode("");
      setLanguageId("");
      setSelectedTags([]);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const status = err.response?.status;
        const apiError = (err.response?.data as { error?: string } | undefined)
          ?.error;

        if (status === 401) {
          Alert.alert("Error", "You need to be logged in to create a post.");
          return;
        }
        if (status === 400) {
          Alert.alert("Error", apiError || "Please check your input.");
          return;
        }
        Alert.alert(
          "Error",
          apiError || "Server error. Please try again later.",
        );
        return;
      }
      Alert.alert("Error", "Unknown error. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const isDisabled =
    loading ||
    !title.trim() ||
    !description.trim() ||
    !code.trim() ||
    languageId === "";

  return (
    <View style={{ flex: 1, backgroundColor: t.bg, paddingTop: 40 }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingBottom: 140,
        }}
      >
        <Text
          style={{
            color: t.text,
            fontSize: 24,
            fontWeight: "700",
            marginBottom: 16,
          }}
        >
          Create Post
        </Text>

        <SectionTitle>Title</SectionTitle>
        <InputBase
          placeholder="e.g. Binary search in TypeScript"
          value={title}
          onChangeText={setTitle}
          style={{ marginBottom: 18, color: t.text }}
        />

        <SectionTitle>Language</SectionTitle>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginBottom: 18 }}
        >
          {languages.map((lang) => (
            <LanguageChip
              key={lang.id}
              label={lang.name}
              isSelected={languageId === lang.id}
              onPress={() => setLanguageId(lang.id)}
            />
          ))}
        </ScrollView>

        <SectionTitle>Code</SectionTitle>
        <View
          style={{
            backgroundColor: t.surfaceFocus,
            borderRadius: 16,
            borderWidth: 1,
            borderColor: t.surfaceLiteFocus,
            marginBottom: 18,
            minHeight: 180,
          }}
        >
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={true}
            contentContainerStyle={{ flexGrow: 1 }}
          >
            <TextInput
              value={code}
              onChangeText={setCode}
              placeholder="Write your code here..."
              placeholderTextColor={t.textSecondary}
              multiline={true}
              scrollEnabled={true}
              autoCorrect={false}
              spellCheck={false}
              style={{
                color: t.text,
                padding: 16,
                fontFamily: "monospace",
                fontSize: 14,
                minWidth: "100%",
                minHeight: 180,
                textAlignVertical: "top",
              }}
            />
          </ScrollView>
        </View>

        <SectionTitle>Import Code</SectionTitle>
        <View style={{ flexDirection: "row", gap: 12, marginBottom: 18 }}>
          <Pressable
            style={({ pressed }) => ({
              flex: 1,
              backgroundColor: pressed ? t.surfaceFocus : t.surfaceLite,
              paddingVertical: 12,
              borderRadius: 14,
              alignItems: "center",
              borderWidth: 1,
              borderColor: t.surfaceLiteFocus,
            })}
            onPress={() => setOpenModal(true)}
          >
            <Text style={{ color: t.text, fontWeight: "600" }}>📷 OCR</Text>
          </Pressable>
        </View>

        {openModal && (
          <CameraModal
            onClose={() => setOpenModal(false)}
            onApply={(text) => {
              setCode(text);
              setOpenModal(false);
            }}
          />
        )}

        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 6,
          }}
        >
          <SectionTitle>Tags</SectionTitle>
          <Pressable
            onPress={() => setIsTagsModalOpen(true)}
            style={({ pressed }) => ({
              backgroundColor: pressed ? t.surfaceFocus : t.surfaceLite,
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 8,
              borderWidth: 1,
              borderColor: t.surfaceLiteFocus,
            })}
          >
            <Text style={{ color: t.text, fontSize: 12, fontWeight: "500" }}>
              Manage tags
            </Text>
          </Pressable>
        </View>

        <View
          style={{
            backgroundColor: t.surfaceLite,
            borderRadius: 14,
            padding: 14,
            minHeight: 50,
            flexDirection: "row",
            flexWrap: "wrap",
            gap: 6,
            alignItems: "center",
            marginBottom: 18,
            borderWidth: 1,
            borderColor: t.surfaceLiteFocus,
          }}
        >
          {selectedTags.length > 0 ? (
            selectedTags.map((tag) => (
              <View
                key={tag.id}
                style={{
                  backgroundColor: "rgba(59, 130, 246, 0.15)",
                  borderColor: "rgba(59, 130, 246, 0.3)",
                  borderWidth: 1,
                  borderRadius: 999,
                  paddingHorizontal: 10,
                  paddingVertical: 4,
                }}
              >
                <Text style={{ color: t.text, fontSize: 12 }}>#{tag.name}</Text>
              </View>
            ))
          ) : (
            <Text style={{ color: t.textSecondary, fontSize: 13 }}>
              No tags selected
            </Text>
          )}
        </View>

        <SectionTitle>Description</SectionTitle>
        <InputBase
          placeholder="Short description (what does this code do?)"
          multiline
          value={description}
          onChangeText={setDescription}
          style={{
            color: t.text,
            height: undefined,
            minHeight: 100,
            paddingVertical: 12,
            textAlignVertical: "top",
            marginBottom: 18,
          }}
        />

        <SectionTitle>About</SectionTitle>
        <InputBase
          placeholder="Extra context, usage notes, caveats, etc."
          multiline
          value={about}
          onChangeText={setAbout}
          style={{
            color: t.text,
            height: undefined,
            minHeight: 160,
            paddingVertical: 12,
            textAlignVertical: "top",
            marginBottom: 30,
          }}
        />

        <Pressable
          onPress={handleSubmit}
          disabled={isDisabled}
          style={({ pressed }) => ({
            backgroundColor: isDisabled
              ? t.surfaceLite
              : pressed
                ? t.secondaryHover
                : t.secondary,
            paddingVertical: 16,
            borderRadius: 16,
            alignItems: "center",
            opacity: isDisabled ? 0.6 : 1,
          })}
        >
          {loading ? (
            <ActivityIndicator color={t.textButtons} />
          ) : (
            <Text style={{ color: t.textButtons, fontWeight: "600" }}>
              Publish Post
            </Text>
          )}
        </Pressable>
      </ScrollView>

      <TagsModal
        visible={isTagsModalOpen}
        onClose={() => setIsTagsModalOpen(false)}
        selectedTags={selectedTags}
        setSelectedTags={setSelectedTags}
        theme={t}
      />
    </View>
  );
}
