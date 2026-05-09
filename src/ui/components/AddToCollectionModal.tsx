import { api } from "@/src/api/http";
import { useTheme } from "@/src/theme/useTheme";
import type { Collection } from "@/src/types/types";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Modal, Pressable, Text, View } from "react-native";

type AddToCollectionModalProps = {
  postId: number;
  onClose: () => void;
};

export default function AddToCollectionModal({
  postId,
  onClose,
}: AddToCollectionModalProps) {
  const t = useTheme();

  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<number | null>(null);
  const [error, setError] = useState("");

  const fetchCollections = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await api.get<Collection[]>("/collections");
      setCollections(res.data);
    } catch (err) {
      console.log(err);
      setError("Failed to load collections.");
    } finally {
      setLoading(false);
    }
  };

  const addToCollection = async (collectionId: number) => {
    try {
      setSavingId(collectionId);
      setError("");

      await api.post(`/collections/${collectionId}/posts`, {
        postId,
      });

      onClose();
    } catch (err) {
      console.log(err);
      setError("Failed to add post to collection.");
    } finally {
      setSavingId(null);
    }
  };

  useEffect(() => {
    fetchCollections();
  }, []);

  return (
    <Modal animationType="fade" transparent>
      <View
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.55)",
          justifyContent: "center",
          padding: 18,
        }}
      >
        <View
          style={{
            backgroundColor: t.surface,
            borderRadius: 22,
            borderWidth: 1,
            borderColor: t.surfaceLiteFocus,
            padding: 16,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 14,
            }}
          >
            <Text
              style={{
                color: t.text,
                fontSize: 18,
                fontWeight: "800",
              }}
            >
              Add to collection
            </Text>

            <Pressable
              onPress={onClose}
              style={({ pressed }) => ({
                width: 34,
                height: 34,
                borderRadius: 12,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: pressed ? t.surfaceFocus : t.surfaceLite,
                borderWidth: 1,
                borderColor: t.surfaceLiteFocus,
              })}
            >
              <Text style={{ color: t.textSecondary, fontSize: 16 }}>✕</Text>
            </Pressable>
          </View>

          {loading ? (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 10,
                paddingVertical: 10,
              }}
            >
              <ActivityIndicator />
              <Text style={{ color: t.textSecondary }}>Loading...</Text>
            </View>
          ) : null}

          {error ? (
            <View
              style={{
                backgroundColor: `${t.error}20`,
                borderWidth: 1,
                borderColor: `${t.error}60`,
                borderRadius: 12,
                padding: 10,
                marginBottom: 10,
              }}
            >
              <Text style={{ color: t.error, fontSize: 13 }}>{error}</Text>
            </View>
          ) : null}

          {!loading && collections.length === 0 ? (
            <Text style={{ color: t.textSecondary }}>
              You don't have collections yet.
            </Text>
          ) : null}

          <View style={{ gap: 8 }}>
            {collections.map((col) => (
              <Pressable
                key={col.id}
                disabled={savingId !== null}
                onPress={() => addToCollection(col.id)}
                style={({ pressed }) => ({
                  backgroundColor: pressed ? t.surfaceFocus : t.surfaceLite,
                  borderRadius: 14,
                  borderWidth: 1,
                  borderColor: t.surfaceLiteFocus,
                  padding: 12,
                  opacity: savingId !== null ? 0.7 : 1,
                })}
              >
                <Text
                  style={{
                    color: t.text,
                    fontWeight: "700",
                  }}
                >
                  {col.name}
                </Text>

                {col.description ? (
                  <Text
                    style={{
                      color: t.textSecondary,
                      marginTop: 4,
                      fontSize: 13,
                    }}
                  >
                    {col.description}
                  </Text>
                ) : null}

                {savingId === col.id ? (
                  <Text
                    style={{
                      color: t.textSecondary,
                      marginTop: 6,
                      fontSize: 12,
                    }}
                  >
                    Adding...
                  </Text>
                ) : null}
              </Pressable>
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );
}
