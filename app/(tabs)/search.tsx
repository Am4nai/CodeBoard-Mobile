import { api } from "@/src/api/http";
import { useTheme } from "@/src/theme/useTheme";
import type { PostCardProps, SearchPostsResponse } from "@/src/types/types";
import PostCard from "@/src/ui/components/PostCard";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Image,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";

type UserSearchResult = {
  id: number;
  username: string;
  avatar_url: string | null;
};

type UserSearchResponse = {
  results: UserSearchResult[];
};

function SectionHeader({
  title,
  rightHint,
}: {
  title: string;
  rightHint?: string;
}) {
  const t = useTheme();

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "baseline",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        marginTop: 12,
        marginBottom: 8,
      }}
    >
      <Text style={{ color: t.textSecondary, fontSize: 13 }}>{title}</Text>

      {rightHint ? (
        <Text style={{ color: t.textSecondary, fontSize: 12 }}>
          {rightHint}
        </Text>
      ) : null}
    </View>
  );
}

export default function Search() {
  const t = useTheme();
  const router = useRouter();

  const [query, setQuery] = useState("");
  const [activeQuery, setActiveQuery] = useState("");

  const [posts, setPosts] = useState<PostCardProps[]>([]);
  const [users, setUsers] = useState<UserSearchResult[]>([]);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [loadingPosts, setLoadingPosts] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [error, setError] = useState("");

  const typingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isLoadingMore = useRef(false);

  const isUserSearch = query.trim().startsWith("@");

  const mapPosts = (data: SearchPostsResponse["posts"]): PostCardProps[] => {
    return data.map((p) => ({
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
  };

  const fetchPosts = async ({
    q,
    pageToLoad,
    reset,
  }: {
    q: string;
    pageToLoad: number;
    reset: boolean;
  }) => {
    const cleanQuery = q.trim();

    if (!cleanQuery || cleanQuery.startsWith("@")) {
      setPosts([]);
      setPage(1);
      setTotalPages(1);
      setError("");
      return;
    }

    setLoadingPosts(true);
    setError("");

    try {
      const response = await api.get<SearchPostsResponse>(
        `/posts/search?query=${encodeURIComponent(
          cleanQuery,
        )}&sort=newest&page=${pageToLoad}&limit=15`,
      );

      const mappedPosts = mapPosts(response.data.posts);

      setPosts((prev) => (reset ? mappedPosts : [...prev, ...mappedPosts]));
      setPage(response.data.page ?? pageToLoad);
      setTotalPages(response.data.totalPages ?? pageToLoad);
    } catch (err) {
      console.error(err);
      setError("Error fetching posts");
    } finally {
      setLoadingPosts(false);
      isLoadingMore.current = false;
    }
  };

  const fetchUsers = async (rawValue: string) => {
    const usernameQuery = rawValue.replace("@", "").trim();

    if (!usernameQuery) {
      setUsers([]);
      setError("");
      return;
    }

    setLoadingUsers(true);
    setError("");

    try {
      const response = await api.get<UserSearchResponse>(
        `/users/search?query=${encodeURIComponent(usernameQuery)}`,
      );

      setUsers(response.data.results ?? []);
    } catch (err) {
      console.error(err);
      setUsers([]);
      setError("Error fetching users");
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleQueryChange = (value: string) => {
    setQuery(value);
    setError("");

    if (typingTimer.current) {
      clearTimeout(typingTimer.current);
    }

    if (value.trim().startsWith("@")) {
      setPosts([]);
      setActiveQuery(value.trim());

      typingTimer.current = setTimeout(() => {
        fetchUsers(value);
      }, 250);

      return;
    }

    setUsers([]);
  };

  const handleSearch = () => {
    const cleanQuery = query.trim();

    setActiveQuery(cleanQuery);
    setPage(1);

    if (!cleanQuery) {
      setPosts([]);
      setUsers([]);
      return;
    }

    if (cleanQuery.startsWith("@")) {
      fetchUsers(cleanQuery);
      return;
    }

    setUsers([]);

    fetchPosts({
      q: cleanQuery,
      pageToLoad: 1,
      reset: true,
    });
  };

  const handleOpenUser = (userId: number) => {
    router.push({
      pathname: "/(tabs)/profile",
      params: { id: String(userId) },
    });
  };

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (loadingPosts || isLoadingMore.current) return;
    if (!activeQuery.trim()) return;
    if (activeQuery.startsWith("@")) return;
    if (page >= totalPages) return;

    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;

    const isNearBottom =
      layoutMeasurement.height + contentOffset.y >= contentSize.height - 120;

    if (!isNearBottom) return;

    isLoadingMore.current = true;

    fetchPosts({
      q: activeQuery,
      pageToLoad: page + 1,
      reset: false,
    });
  };

  const { left, right } = useMemo(() => {
    const leftColumn: PostCardProps[] = [];
    const rightColumn: PostCardProps[] = [];

    posts.forEach((post, index) => {
      if (index % 2 === 0) {
        leftColumn.push(post);
      } else {
        rightColumn.push(post);
      }
    });

    return {
      left: leftColumn,
      right: rightColumn,
    };
  }, [posts]);

  return (
    <View style={{ flex: 1, backgroundColor: t.bg }}>
      <View
        style={{
          paddingTop: 40,
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
          Search
        </Text>

        <View
          style={{
            marginTop: 12,
            backgroundColor: t.surfaceLite,
            borderRadius: 14,
            paddingHorizontal: 14,
            height: 46,
            justifyContent: "center",
            borderWidth: 1,
            borderColor: t.surfaceLiteFocus,
          }}
        >
          <TextInput
            value={query}
            onChangeText={handleQueryChange}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
            placeholder='Search posts, "#tag" or "@user"...'
            placeholderTextColor={t.textSecondary}
            autoCapitalize="none"
            autoCorrect={false}
            spellCheck={false}
            style={{
              color: t.text,
              fontSize: 14,
            }}
          />
        </View>
      </View>

      <View style={{ flex: 1 }}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          scrollEventThrottle={16}
          onScroll={handleScroll}
          contentContainerStyle={{
            paddingBottom: 120,
          }}
        >
          <SectionHeader
            title={
              activeQuery
                ? isUserSearch
                  ? `Users for: ${activeQuery}`
                  : `Posts for: ${activeQuery}`
                : "Type something to search"
            }
            rightHint={
              isUserSearch
                ? users.length
                  ? `${users.length} found`
                  : undefined
                : posts.length
                  ? `${posts.length} found`
                  : undefined
            }
          />

          {error ? (
            <Text
              style={{
                color: t.error,
                paddingHorizontal: 16,
                marginTop: 12,
              }}
            >
              {error}
            </Text>
          ) : null}

          {loadingUsers ? (
            <View style={{ paddingVertical: 18 }}>
              <ActivityIndicator color={t.primary} />
            </View>
          ) : null}

          {isUserSearch &&
          !loadingUsers &&
          activeQuery &&
          users.length === 0 &&
          !error ? (
            <Text
              style={{
                color: t.textSecondary,
                paddingHorizontal: 16,
                marginTop: 16,
              }}
            >
              No users found
            </Text>
          ) : null}

          {isUserSearch ? (
            <View style={{ paddingHorizontal: 16, gap: 8 }}>
              {users.map((user) => (
                <Pressable
                  key={user.id}
                  onPress={() => handleOpenUser(user.id)}
                  style={({ pressed }) => ({
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 12,
                    padding: 12,
                    borderRadius: 16,
                    backgroundColor: pressed ? t.surfaceFocus : t.surfaceLite,
                    borderWidth: 1,
                    borderColor: t.surfaceLiteFocus,
                  })}
                >
                  <Image
                    source={{
                      uri: user.avatar_url || "https://placehold.co/64x64",
                    }}
                    style={{
                      width: 42,
                      height: 42,
                      borderRadius: 21,
                      backgroundColor: t.surfaceFocus,
                    }}
                  />

                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        color: t.text,
                        fontSize: 15,
                        fontWeight: "700",
                      }}
                    >
                      {user.username}
                    </Text>

                    <Text
                      style={{
                        color: t.textSecondary,
                        fontSize: 12,
                        marginTop: 2,
                      }}
                    >
                      Open profile
                    </Text>
                  </View>
                </Pressable>
              ))}
            </View>
          ) : null}

          {!isUserSearch &&
          !loadingPosts &&
          activeQuery &&
          posts.length === 0 &&
          !error ? (
            <Text
              style={{
                color: t.textSecondary,
                paddingHorizontal: 16,
                marginTop: 16,
              }}
            >
              Nothing found
            </Text>
          ) : null}

          {!isUserSearch ? (
            <View
              style={{
                flexDirection: "row",
                gap: 8,
                paddingHorizontal: 8,
                marginTop: 2,
              }}
            >
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

          {loadingPosts ? (
            <View style={{ paddingVertical: 18 }}>
              <ActivityIndicator color={t.primary} />
            </View>
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
