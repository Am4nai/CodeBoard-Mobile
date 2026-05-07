import { api } from "@/src/api/http";
import { useTheme } from "@/src/theme/useTheme";
import type { Comment, PostByIdResponse } from "@/src/types/types";
import CommentThread from "@/src/ui/components/CommentThread";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Image,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";

export default function PostPage() {
  const VIEW_PREFIX = "viewed_post_";
  const VIEW_MAX_AGE = 1000 * 60 * 60 * 24;
  const t = useTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const scrollRef = useRef<ScrollView | null>(null);
  const commentsY = useRef(0);

  const postId = Number(id);

  const [post, setPost] = useState<PostByIdResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [likeCount, setLikeCount] = useState(0);
  const [viewsCount, setViewsCount] = useState(0);
  const [commentCount, setCommentCount] = useState(0);
  const [isLiked, setIsLiked] = useState(false);

  const [commentsHidden, setCommentsHidden] = useState(true);
  const [comments, setComments] = useState<Comment[]>([]);
  const [focusedCommentId, setFocusedCommentId] = useState<number | null>(null);
  const [commentText, setCommentText] = useState("");

  const lineNumbers = useMemo(() => {
    const code = post?.code ?? "";
    const count = Math.max(1, code.split("\n").length);
    return Array.from({ length: count }, (_, i) => i + 1);
  }, [post?.code]);

  const refreshComments = async () => {
    if (!Number.isFinite(postId)) return;

    const res = await api.get<Comment[]>(`/comments/post/${postId}`);
    setComments(res.data);
  };

  const refreshCounts = async () => {
    if (!Number.isFinite(postId)) return;

    const res = await api.get<{ count: number }>(
      `/comments/post/${postId}/count`,
    );

    setCommentCount(res.data.count);
  };

  const fetchPost = async () => {
    if (!Number.isFinite(postId)) {
      setError("Invalid post id.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const res = await api.get<PostByIdResponse>(`/posts/${postId}`);
      const p = res.data;

      setPost(p);
      setLikeCount(p.like_count);
      setViewsCount(p.views_count);
      setCommentCount(p.comment_count);

      try {
        const likedRes = await api.get<{ liked: boolean }>(
          `/likes/${postId}/is-liked`,
        );
        setIsLiked(likedRes.data.liked);
      } catch {
        setIsLiked(false);
      }
    } catch (err) {
      console.log(err);
      setError("Failed to load post.");
    } finally {
      setLoading(false);
    }
  };

  const incrementView = async () => {
    if (!Number.isFinite(postId)) return;

    const key = `${VIEW_PREFIX}${postId}`;

    try {
      const saved = await AsyncStorage.getItem(key);
      const now = Date.now();

      if (saved) {
        const savedAt = Number(saved);

        if (Number.isFinite(savedAt) && now - savedAt < VIEW_MAX_AGE) {
          return;
        }
      }

      await api.post(`/posts/${postId}/view`);
      await AsyncStorage.setItem(key, String(now));

      setViewsCount((prev) => prev + 1);
    } catch (err) {
      console.log(err);
    }
  };

  const handleLike = async () => {
    if (!Number.isFinite(postId)) return;

    const nextLiked = !isLiked;

    setIsLiked(nextLiked);
    setLikeCount((prev) => Math.max(0, prev + (nextLiked ? 1 : -1)));

    try {
      const res = await api.post<{ liked: boolean; likes_count: number }>(
        `/likes/${postId}/toggle`,
      );

      setIsLiked(res.data.liked);
      setLikeCount(res.data.likes_count);
    } catch (err) {
      console.log(err);
      setIsLiked(!nextLiked);
      setLikeCount((prev) => Math.max(0, prev + (nextLiked ? -1 : 1)));
    }
  };

  const handleToggleComments = async () => {
    const next = !commentsHidden;
    setCommentsHidden(next);

    if (!next) {
      await refreshComments();

      setTimeout(() => {
        scrollRef.current?.scrollTo({
          y: Math.max(commentsY.current - 16, 0),
          animated: true,
        });
      }, 100);
    }
  };

  const handleWriteComment = async () => {
    if (!Number.isFinite(postId)) return;

    const content = commentText.trim();
    if (!content) return;

    try {
      await api.post("/comments", {
        post_id: postId,
        content,
        parent_id: null,
      });

      setCommentText("");
      await refreshComments();
      await refreshCounts();
    } catch (err) {
      console.log(err);
      setError("Failed to create the comment.");
    }
  };

  useEffect(() => {
    fetchPost();
    incrementView();
  }, [id]);

  const avatar = post?.author_avatar_url || "https://placehold.co/80x80";

  return (
    <View style={{ flex: 1, backgroundColor: t.bg }}>
      <ScrollView
        ref={scrollRef}
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

        {loading && (
          <Text style={{ color: t.textSecondary }}>Loading post...</Text>
        )}

        {error ? <Text style={{ color: t.textSecondary }}>{error}</Text> : null}

        {!loading && post && (
          <>
            <Text
              style={{
                color: t.text,
                fontSize: 26,
                fontWeight: "700",
                lineHeight: 32,
                marginBottom: 14,
              }}
            >
              {post.title}
            </Text>

            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 10,
                marginBottom: 14,
              }}
            >
              <Image
                source={{ uri: avatar }}
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: t.surfaceLiteFocus,
                }}
              />

              <View style={{ flex: 1 }}>
                <Text style={{ color: t.text, fontSize: 13 }}>
                  {post.author_name}
                </Text>

                <Text style={{ color: t.textSecondary, fontSize: 11 }}>
                  Language: {post.language_name || "—"}
                </Text>
              </View>
            </View>

            <View
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                gap: 8,
                marginBottom: 18,
              }}
            >
              {post.tags.length > 0 ? (
                post.tags.map((tag) => (
                  <View
                    key={tag}
                    style={{
                      backgroundColor: t.surfaceLite,
                      borderRadius: 999,
                      paddingHorizontal: 10,
                      paddingVertical: 5,
                      borderWidth: 1,
                      borderColor: t.surfaceLiteFocus,
                    }}
                  >
                    <Text style={{ color: t.textSecondary, fontSize: 12 }}>
                      #{tag}
                    </Text>
                  </View>
                ))
              ) : (
                <Text style={{ color: t.textSecondary, fontSize: 12 }}>
                  No tags
                </Text>
              )}
            </View>

            <View style={{ flexDirection: "row", gap: 10, marginBottom: 20 }}>
              <View
                style={{
                  flex: 1,
                  backgroundColor: t.surfaceLite,
                  borderRadius: 14,
                  paddingVertical: 12,
                  alignItems: "center",
                  borderWidth: 1,
                  borderColor: t.surfaceLiteFocus,
                }}
              >
                <Text style={{ color: t.textSecondary }}>👁 {viewsCount}</Text>
              </View>

              <Pressable
                onPress={handleLike}
                style={({ pressed }) => ({
                  flex: 1,
                  backgroundColor: pressed ? t.surfaceFocus : t.surfaceLite,
                  borderRadius: 14,
                  paddingVertical: 12,
                  alignItems: "center",
                  borderWidth: 1,
                  borderColor: t.surfaceLiteFocus,
                })}
              >
                <Text style={{ color: t.textSecondary }}>
                  {isLiked ? "❤️" : "🤍"} {likeCount}
                </Text>
              </Pressable>

              <Pressable
                onPress={handleToggleComments}
                style={({ pressed }) => ({
                  flex: 1,
                  backgroundColor: pressed ? t.surfaceFocus : t.surfaceLite,
                  borderRadius: 14,
                  paddingVertical: 12,
                  alignItems: "center",
                  borderWidth: 1,
                  borderColor: t.surfaceLiteFocus,
                })}
              >
                <Text style={{ color: t.textSecondary }}>
                  💬 {commentCount}
                </Text>
              </Pressable>
            </View>

            <View
              style={{
                backgroundColor: t.surfaceLite,
                borderRadius: 18,
                overflow: "hidden",
                borderWidth: 1,
                borderColor: t.surfaceLiteFocus,
                marginBottom: 20,
              }}
            >
              <View
                style={{
                  paddingHorizontal: 14,
                  paddingVertical: 12,
                  borderBottomWidth: 1,
                  borderBottomColor: t.surfaceLiteFocus,
                  backgroundColor: t.surfaceFocus,
                }}
              >
                <Text
                  style={{ color: t.text, fontSize: 16, fontWeight: "700" }}
                >
                  Code
                </Text>
              </View>

              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={{ flexDirection: "row" }}>
                  <View
                    style={{
                      paddingVertical: 14,
                      paddingHorizontal: 10,
                      backgroundColor: t.surfaceFocus,
                      borderRightWidth: 1,
                      borderRightColor: t.surfaceLiteFocus,
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

                  <Text
                    selectable
                    style={{
                      color: t.text,
                      fontFamily: "monospace",
                      fontSize: 12,
                      lineHeight: 20,
                      padding: 14,
                      minWidth: 320,
                    }}
                  >
                    {post.code}
                  </Text>
                </View>
              </ScrollView>
            </View>

            <View
              style={{
                backgroundColor: t.surfaceLite,
                borderRadius: 18,
                padding: 16,
                borderWidth: 1,
                borderColor: t.surfaceLiteFocus,
                marginBottom: 16,
              }}
            >
              <Text
                style={{
                  color: t.text,
                  fontSize: 16,
                  fontWeight: "700",
                  marginBottom: 10,
                }}
              >
                Description
              </Text>

              <Text style={{ color: t.textSecondary, lineHeight: 20 }}>
                {post.description || "No description provided."}
              </Text>
            </View>

            <View
              style={{
                backgroundColor: t.surfaceLite,
                borderRadius: 18,
                padding: 16,
                borderWidth: 1,
                borderColor: t.surfaceLiteFocus,
              }}
            >
              <Text
                style={{
                  color: t.text,
                  fontSize: 16,
                  fontWeight: "700",
                  marginBottom: 10,
                }}
              >
                About
              </Text>

              <Text style={{ color: t.textSecondary, lineHeight: 20 }}>
                {post.about || "No extra details."}
              </Text>
            </View>

            {!commentsHidden && (
              <View
                onLayout={(event) => {
                  commentsY.current = event.nativeEvent.layout.y;
                }}
                style={{
                  backgroundColor: t.surfaceLite,
                  borderRadius: 18,
                  padding: 16,
                  borderWidth: 1,
                  borderColor: t.surfaceLiteFocus,
                  marginTop: 16,
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
                      fontSize: 16,
                      fontWeight: "700",
                    }}
                  >
                    Comments
                  </Text>

                  <Pressable onPress={() => setCommentsHidden(true)}>
                    <Text style={{ color: t.textSecondary }}>Hide</Text>
                  </Pressable>
                </View>

                <TextInput
                  placeholder="Write a comment..."
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
                    backgroundColor: t.surfaceFocus,
                    color: t.text,
                    borderRadius: 14,
                    borderWidth: 1,
                    borderColor: t.surfaceLiteFocus,
                    minHeight: 80,
                    paddingHorizontal: 12,
                    paddingVertical: 10,
                    textAlignVertical: "top",
                    marginBottom: 10,
                  }}
                />

                <Pressable
                  onPress={handleWriteComment}
                  style={({ pressed }) => ({
                    backgroundColor: pressed ? t.secondaryHover : t.secondary,
                    borderRadius: 14,
                    paddingVertical: 13,
                    alignItems: "center",
                    marginBottom: 16,
                    opacity: commentText.trim() ? 1 : 0.6,
                  })}
                >
                  <Text style={{ color: t.textButtons, fontWeight: "700" }}>
                    Post Comment
                  </Text>
                </Pressable>

                {comments.length === 0 ? (
                  <View
                    style={{
                      backgroundColor: t.surfaceFocus,
                      borderRadius: 14,
                      padding: 14,
                    }}
                  >
                    <Text style={{ color: t.textSecondary }}>
                      No comments yet. Be the first to comment.
                    </Text>
                  </View>
                ) : (
                  comments.map((comment) => (
                    <CommentThread
                      key={comment.id}
                      comment={comment}
                      post_id={postId}
                      focusedCommentId={focusedCommentId}
                      setFocusedCommentId={setFocusedCommentId}
                      refreshComments={refreshComments}
                    />
                  ))
                )}
              </View>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}
