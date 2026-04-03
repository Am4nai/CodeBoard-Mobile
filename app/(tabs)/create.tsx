import { useTheme } from "@/src/theme/useTheme";
import CameraModal from "@/src/ui/components/cameraModal";
import React, { useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";

const LANGUAGES = ["TypeScript", "JavaScript", "Python", "Go", "Rust"];

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

function LanguageChip({ label }: { label: string }) {
  const t = useTheme();

  return (
    <Pressable
      style={({ pressed }) => ({
        backgroundColor: pressed ? t.surfaceFocus : t.surfaceLite,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 999,
        marginRight: 8,
        borderWidth: 1,
        borderColor: t.surfaceLiteFocus,
      })}
    >
      <Text style={{ color: t.textSecondary, fontSize: 12 }}>{label}</Text>
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
  const [openModal, setOpenModal] = useState(false);
  const [code, setCode] = useState("");
  const t = useTheme();

  return (
    <View style={{ flex: 1, backgroundColor: t.bg, paddingTop: 32 }}>
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
          placeholder="Enter post title..."
          style={{ marginBottom: 18 }}
        />

        <SectionTitle>Language</SectionTitle>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginBottom: 18 }}
        >
          {LANGUAGES.map((lang) => (
            <LanguageChip key={lang} label={lang} />
          ))}
        </ScrollView>

        <SectionTitle>Description</SectionTitle>
        <InputBase
          placeholder="Brief description..."
          multiline
          style={{
            height: undefined,
            minHeight: 80,
            paddingVertical: 12,
            textAlignVertical: "top",
            marginBottom: 18,
          }}
        />

        <SectionTitle>Code</SectionTitle>
        <TextInput
          value={code}
          onChangeText={setCode}
          placeholder="Write your code here..."
          placeholderTextColor={t.textSecondary}
          multiline
          autoCorrect={false}
          spellCheck={false}
          style={{
            backgroundColor: t.surfaceFocus,
            color: t.text,
            borderRadius: 16,
            padding: 16,
            minHeight: 180,
            fontFamily: "monospace",
            borderWidth: 1,
            borderColor: t.surfaceLiteFocus,
            marginBottom: 18,
            textAlignVertical: "top",
          }}
        />

        <SectionTitle>Import Code</SectionTitle>
        <View style={{ flexDirection: "row", gap: 12, marginBottom: 24 }}>
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
            onPress={() => {
              setOpenModal(true);
            }}
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

        <SectionTitle>Tags</SectionTitle>
        <InputBase
          placeholder="Add tags separated by commas..."
          style={{ marginBottom: 30 }}
        />

        <Pressable
          style={({ pressed }) => ({
            backgroundColor: pressed ? t.secondaryHover : t.secondary,
            paddingVertical: 16,
            borderRadius: 16,
            alignItems: "center",
          })}
        >
          <Text style={{ color: t.textButtons, fontWeight: "600" }}>
            Publish Post
          </Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}
