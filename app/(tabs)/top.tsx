import { api } from "@/src/api/http";
import { useTheme } from "@/src/theme/useTheme";
import type { PostCardProps, PostsResponse } from "@/src/types/types";
import PostCard from "@/src/ui/components/PostCard";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";

type SortType = "newest" | "likes" | "views";

function Header({
  sort,
  setSort,
}: {
  sort: SortType;
  setSort: (sort: SortType) => void;
}) {
  const t = useTheme();

  const options: { label: string; value: SortType }[] = [
    { label: "Newest", value: "newest" },
    { label: "Likes", value: "likes" },
    { label: "Views", value: "views" },
  ];

  return (
    <View
      style={{
        paddingTop: 18,
        paddingHorizontal: 16,
        paddingBottom: 12,
        backgroundColor: t.bg,
      }}
    >
      <Text
        style={{
          color: t.text,
          fontSize: 24,
          fontWeight: "700",
        }}
      >
        Top Posts
      </Text>

      <Text
        style={{
          color: t.textSecondary,
          marginTop: 4,
          fontSize: 13,
        }}
      >
        Sort posts by activity or newest publications.
      </Text>

      <View
        style={{
          flexDirection: "row",
          gap: 8,
          marginTop: 12,
        }}
      >
        {options.map((option) => {
          const active = sort === option.value;

          return (
            <Pressable
              key={option.value}
              onPress={() => setSort(option.value)}
              style={({ pressed }) => ({
                flex: 1,
                backgroundColor: active
                  ? t.secondary
                  : pressed
                    ? t.surfaceFocus
                    : t.surfaceLite,
                borderRadius: 14,
                paddingVertical: 10,
                alignItems: "center",
                borderWidth: 1,
                borderColor: active ? t.secondary : t.surfaceLiteFocus,
              })}
            >
              <Text
                style={{
                  color: active ? t.textButtons : t.textSecondary,
                  fontSize: 13,
                  fontWeight: "700",
                }}
              >
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export default function Top() {
  const t = useTheme();

  const [sort, setSort] = useState<SortType>("newest");

  const [posts, setPosts] = useState<PostCardProps[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");

  const [page, setPage] = useState(1);
  const [remainingPosts, setRemainingPosts] = useState<number | null>(null);

  const isFetching = useRef(false);
  const isThrottled = useRef(false);

  const fetchPosts = async (pageToLoad: number, sortToLoad: SortType) => {
    if (isFetching.current) return;
    if (remainingPosts !== null && remainingPosts <= 0 && pageToLoad !== 1) {
      return;
    }

    isFetching.current = true;
    setError("");

    if (pageToLoad === 1) setLoading(true);
    else setLoadingMore(true);

    try {
      const response = await api.get<PostsResponse>(
        `/posts/filter?page=${pageToLoad}&limit=15&sort=${sortToLoad}`,
      );

      const rawPosts = Array.isArray(response.data)
        ? response.data
        : response.data.posts;

      const mapped: PostCardProps[] = rawPosts.map((p) => ({
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
        if (pageToLoad === 1) return mapped;

        const seen = new Set(prev.map((x) => x.id));
        const filtered = mapped.filter((x) => !seen.has(x.id));

        return [...prev, ...filtered];
      });

      if (Array.isArray(response.data)) {
        setRemainingPosts(mapped.length < 15 ? 0 : null);
      } else {
        setRemainingPosts(response.data.remainingPosts);
      }
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

  useEffect(() => {
    setPosts([]);
    setPage(1);
    setRemainingPosts(null);
    fetchPosts(1, sort);
  }, [sort]);

  useEffect(() => {
    if (page === 1) return;
    fetchPosts(page, sort);
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

  const isEmpty = !loading && !error && posts.length === 0;

  return (
    <View style={{ flex: 1, backgroundColor: t.bg }}>
      <Header sort={sort} setSort={setSort} />

      <View style={{ flex: 1 }}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          contentContainerStyle={{
            paddingHorizontal: 8,
            paddingTop: 16,
            paddingBottom: 120,
          }}
        >
          {loading ? (
            <Text style={{ color: t.textSecondary, paddingHorizontal: 8 }}>
              Loading posts...
            </Text>
          ) : null}

          {error ? (
            <Text style={{ color: t.textSecondary, paddingHorizontal: 8 }}>
              {error}
            </Text>
          ) : null}

          {isEmpty ? (
            <Text style={{ color: t.textSecondary, paddingHorizontal: 8 }}>
              No posts found.
            </Text>
          ) : null}

          {!loading && !error && posts.length > 0 ? (
            <View style={{ flexDirection: "row", gap: 8 }}>
              <View style={{ flex: 1, gap: 8 }}>
                {left.map((post) => (
                  <PostCard key={post.id} {...post} />
                ))}
              </View>

              <View style={{ flex: 1, gap: 8 }}>
                {right.map((post) => (
                  <PostCard key={post.id} {...post} />
                ))}
              </View>
            </View>
          ) : null}

          {loadingMore ? (
            <Text
              style={{
                color: t.textSecondary,
                textAlign: "center",
                marginTop: 18,
              }}
            >
              Loading more...
            </Text>
          ) : null}

          {!loadingMore && remainingPosts === 0 && posts.length > 0 ? (
            <Text
              style={{
                color: t.textSecondary,
                textAlign: "center",
                marginTop: 24,
              }}
            >
              You’ve reached the end.
            </Text>
          ) : null}
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
