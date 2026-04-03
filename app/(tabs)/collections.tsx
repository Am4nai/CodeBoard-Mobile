import { useTheme } from "@/src/theme/useTheme";
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";

type Collection = {
  id: number;
  name: string;
  description: string | null;
};

type Item = {
  id: string;
  h: number;
};

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

function SelectorRow({
  label,
  value,
  onPress,
}: {
  label: string;
  value: string;
  onPress: () => void;
}) {
  const t = useTheme();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        backgroundColor: pressed ? t.surfaceFocus : t.surfaceLite,
        borderRadius: 14,
        paddingHorizontal: 14,
        height: 46,
        justifyContent: "center",
        borderWidth: 1,
        borderColor: t.surfaceLiteFocus,
      })}
    >
      <Text style={{ color: t.textSecondary, fontSize: 12 }}>{label}</Text>
      <Text style={{ color: t.text, fontSize: 14, fontWeight: "600" }}>
        {value}
      </Text>
    </Pressable>
  );
}

export default function Collections() {
  const t = useTheme();

  const [isCreating, setIsCreating] = useState(true);
  const [collections] = useState<Collection[]>([
    { id: 1, name: "Favorites", description: "Posts I want to keep" },
    { id: 2, name: "React Native", description: "UI + navigation patterns" },
    { id: 3, name: "Backend", description: "API & DB notes" },
  ]);

  const [selectedCollection, setSelectedCollection] =
    useState<Collection | null>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const [loadingCollections] = useState(false);
  const [loadingPosts] = useState(false);
  const [saving] = useState(false);

  const [error, setError] = useState("");

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

  const openCreate = () => {
    setError("");
    setIsCreating(true);
    setSelectedCollection(null);
    setTitle("");
    setDescription("");
  };

  const openEdit = (col: Collection) => {
    setError("");
    setIsCreating(false);
    setSelectedCollection(col);
    setTitle(col.name);
    setDescription(col.description ?? "");
  };

  const createCollection = () => {
    const name = title.trim();
    if (!name) {
      setError("Name is required.");
      return;
    }
    setError("");
  };

  const updateSelectedCollection = () => {
    const name = title.trim();
    if (!name) {
      setError("Name is required.");
      return;
    }
    setError("");
  };

  const deleteSelectedCollection = () => {
    openCreate();
  };

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

          <SelectorRow
            label={loadingCollections ? "Loading..." : "Selected"}
            value={selectorValue}
            onPress={() => {
              if (isCreating) {
                openEdit(collections[0]);
              } else {
                openCreate();
              }
            }}
          />

          <View style={{ marginTop: 10, gap: 8 }}>
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

              {!loadingPosts && !error && !isCreating && (
                <>
                  <View
                    style={{
                      backgroundColor: t.surface,
                      borderRadius: 20,
                      borderWidth: 1,
                      borderColor: t.surfaceLiteFocus,
                      padding: 16,
                      marginBottom: 12,
                      marginHorizontal: 8,
                    }}
                  >
                    <Text
                      style={{
                        color: t.text,
                        fontSize: 16,
                        fontWeight: "700",
                      }}
                    >
                      Posts in “{selectedCollection?.name}”
                    </Text>
                    <Text style={{ color: t.textSecondary, marginTop: 6 }}>
                      Add posts from Home by clicking the “➕” button on a post.
                    </Text>
                  </View>

                  <View
                    style={{
                      flexDirection: "row",
                      gap: 8,
                      paddingHorizontal: 0,
                    }}
                  >
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
                </>
              )}
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
