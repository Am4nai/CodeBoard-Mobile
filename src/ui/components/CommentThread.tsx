import { api } from "@/src/api/http";
import { useTheme } from "@/src/theme/useTheme";
import type { CommentThreadProps } from "@/src/types/types";
import axios from "axios";
import React, { useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";

export default function CommentThread({
  comment,
  post_id,
  focusedCommentId,
  setFocusedCommentId,
  refreshComments,
}: CommentThreadProps) {
  const t = useTheme();

  const isFocused = focusedCommentId === comment.id;

  const [commentText, setCommentText] = useState("");
  const [error, setError] = useState("");

  const effectivePostId = post_id ?? comment.post_id;

  const toggleReply = () => {
    setError("");
    setFocusedCommentId(isFocused ? null : comment.id);
  };

  const createComment = async () => {
    if (!effectivePostId) {
      setError("Post id is missing.");
      return;
    }

    const content = commentText.trim();

    if (!content) {
      setError("Please write a reply.");
      return;
    }

    try {
      setError("");

      await api.post("/comments", {
        post_id: effectivePostId,
        content,
        parent_id: comment.id,
      });

      setCommentText("");
      setFocusedCommentId(null);
      await refreshComments();
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const apiError = (err.response?.data as { error?: string } | undefined)
          ?.error;

        setError(apiError || "Failed to create comment.");
        return;
      }

      setError("Failed to create comment.");
    }
  };

  return (
    <View style={{ marginTop: 10 }}>
      <View
        style={{
          marginLeft: 8,
          paddingLeft: 10,
          borderLeftWidth: comment.parent_id ? 1 : 0,
          borderLeftColor: t.surfaceLiteFocus,
        }}
      >
        <View
          style={{
            backgroundColor: t.surfaceLite,
            borderRadius: 16,
            borderWidth: 1,
            borderColor: t.surfaceLiteFocus,
            padding: 12,
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
              <Text
                style={{
                  color: t.text,
                  fontSize: 13,
                  fontWeight: "700",
                  marginBottom: 4,
                }}
              >
                {comment.username}
              </Text>

              <Text
                style={{
                  color: t.textSecondary,
                  fontSize: 13,
                  lineHeight: 19,
                }}
              >
                {comment.content}
              </Text>
            </View>

            <Pressable
              onPress={toggleReply}
              style={({ pressed }) => ({
                alignSelf: "flex-start",
                backgroundColor: pressed ? t.surfaceFocus : t.surfaceLite,
                borderWidth: 1,
                borderColor: t.surfaceLiteFocus,
                paddingHorizontal: 10,
                paddingVertical: 6,
                borderRadius: 10,
              })}
            >
              <Text
                style={{
                  color: t.text,
                  fontSize: 11,
                  fontWeight: "600",
                }}
              >
                {isFocused ? "Close" : "Reply"}
              </Text>
            </Pressable>
          </View>
        </View>

        {isFocused && (
          <View style={{ marginTop: 8, gap: 8 }}>
            <TextInput
              placeholder="Write a reply..."
              placeholderTextColor={t.textSecondary}
              value={commentText}
              onChangeText={(text) => {
                setCommentText(text);
                if (error) setError("");
              }}
              multiline
              autoCorrect={false}
              spellCheck={false}
              style={{
                backgroundColor: t.surfaceLite,
                color: t.text,
                borderRadius: 14,
                borderWidth: 1,
                borderColor: t.surfaceLiteFocus,
                minHeight: 70,
                paddingHorizontal: 12,
                paddingVertical: 10,
                textAlignVertical: "top",
              }}
            />

            <Pressable
              onPress={createComment}
              style={({ pressed }) => ({
                backgroundColor: pressed ? t.secondaryHover : t.secondary,
                borderRadius: 14,
                paddingVertical: 12,
                alignItems: "center",
              })}
            >
              <Text
                style={{
                  color: t.textButtons,
                  fontWeight: "700",
                }}
              >
                Send
              </Text>
            </Pressable>

            {error ? (
              <Text style={{ color: t.textSecondary, fontSize: 12 }}>
                {error}
              </Text>
            ) : null}
          </View>
        )}

        {comment.replies.length > 0 && (
          <View style={{ marginTop: 6 }}>
            {comment.replies.map((reply) => (
              <CommentThread
                key={reply.id}
                comment={reply}
                post_id={effectivePostId}
                focusedCommentId={focusedCommentId}
                setFocusedCommentId={setFocusedCommentId}
                refreshComments={refreshComments}
              />
            ))}
          </View>
        )}
      </View>
    </View>
  );
}
