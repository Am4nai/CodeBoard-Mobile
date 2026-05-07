import { api } from "@/src/api/http";
import { useTheme } from "@/src/theme/useTheme";
import type { PostCardProps, PostsResponse } from "@/src/types/types";
import PostCard from "@/src/ui/components/PostCard";
import Header from "@/src/ui/layout/header";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect } from "expo-router";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  Text,
  View,
} from "react-native";

export default function Home() {
  const t = useTheme();

  const [posts, setPosts] = useState<PostCardProps[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [remainingPosts, setRemainingPosts] = useState<number | null>(null);

  const isFetching = useRef(false);
  const isThrottled = useRef(false);

  const fetchPosts = async (pageToLoad: number) => {
    if (isFetching.current) return;
    if (remainingPosts !== null && remainingPosts <= 0) return;

    isFetching.current = true;
    setError("");

    if (pageToLoad === 1) setLoading(true);
    else setLoadingMore(true);

    try {
      const response = await api.get<PostsResponse>(
        `/posts?page=${pageToLoad}&limit=15`,
      );

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

      setPosts((prev) => {
        const seen = new Set(prev.map((x) => x.id));
        const filtered = mapped.filter((x) => !seen.has(x.id));
        return [...prev, ...filtered];
      });

      setRemainingPosts(response.data.remainingPosts);
    } catch (err) {
      console.log(err);
      setError("Failed to load posts.");
    } finally {
      setLoading(false);
      setLoadingMore(false);
      isFetching.current = false;
    }
  };

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (isThrottled.current) return;
    if (isFetching.current) return;
    if (remainingPosts !== null && remainingPosts <= 0) return;

    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;

    const isNearBottom =
      layoutMeasurement.height + contentOffset.y >= contentSize.height - 350;

    if (isNearBottom) {
      isThrottled.current = true;
      setPage((prev) => prev + 1);

      setTimeout(() => {
        isThrottled.current = false;
      }, 500);
    }
  };

  // const refreshPosts = async () => {
  //   setPosts([]);
  //   setPage(1);
  //   setRemainingPosts(null);
  //   await fetchPosts(1);
  // };

  useFocusEffect(
    useCallback(() => {
      setPosts([]);
      setRemainingPosts(null);
      setPage(1);
      fetchPosts(1);
    }, []),
  );

  useEffect(() => {
    if (page === 1) return;
    fetchPosts(page);
  }, [page]);

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

  const isEmpty = !loading && posts.length === 0 && !error;

  return (
    <View style={{ flex: 1, backgroundColor: t.bg }}>
      <Header />

      <View style={{ flex: 1 }}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          contentContainerStyle={{
            paddingHorizontal: 8,
            paddingBottom: 120,
            paddingTop: 16,
          }}
        >
          {loading && (
            <Text style={{ color: t.textSecondary, paddingHorizontal: 8 }}>
              Loading posts...
            </Text>
          )}

          {error ? (
            <Text style={{ color: t.textSecondary, paddingHorizontal: 8 }}>
              {error}
            </Text>
          ) : null}

          {isEmpty && (
            <Text style={{ color: t.textSecondary, paddingHorizontal: 8 }}>
              No posts yet.
            </Text>
          )}

          {!loading && !error && posts.length > 0 && (
            <View style={{ flexDirection: "row", gap: 8 }}>
              <View style={{ flex: 1, gap: 8 }}>
                {left.map((post) => (
                  <PostCard key={post.id} {...post} mode="add" />
                ))}
              </View>

              <View style={{ flex: 1, gap: 8 }}>
                {right.map((post) => (
                  <PostCard key={post.id} {...post} mode="add" />
                ))}
              </View>
            </View>
          )}

          {loadingMore && (
            <Text
              style={{
                color: t.textSecondary,
                textAlign: "center",
                marginTop: 18,
              }}
            >
              Loading more...
            </Text>
          )}

          {!loadingMore && remainingPosts === 0 && posts.length > 0 && (
            <Text
              style={{
                color: t.textSecondary,
                textAlign: "center",
                marginTop: 24,
              }}
            >
              You’ve reached the end.
            </Text>
          )}
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
