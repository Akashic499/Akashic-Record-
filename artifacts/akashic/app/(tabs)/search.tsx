import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  FlatList,
  Image,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useKnowledge } from "@/context/KnowledgeContext";
import { useColors } from "@/hooks/useColors";
import { getDomain } from "@/lib/extractor";
import { searchKnowledge } from "@/lib/search";

export default function SearchScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { pages } = useKnowledge();

  const [query, setQuery] = useState("");

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 + 84 : 80;

  const results = useMemo(() => {
    if (query.trim().length < 2) return [];
    return searchKnowledge(query, pages);
  }, [query, pages]);

  const highlightText = (text: string, q: string): { text: string; highlight: boolean }[] => {
    if (!q.trim()) return [{ text, highlight: false }];
    const terms = q.toLowerCase().split(/\s+/).filter((t) => t.length > 1);
    const pattern = new RegExp(`(${terms.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})`, "gi");
    const parts = text.split(pattern);
    return parts.map((part) => ({
      text: part,
      highlight: terms.some((t) => part.toLowerCase() === t),
    }));
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View
        style={[
          styles.header,
          {
            paddingTop: topPad + 12,
            backgroundColor: colors.card,
            borderBottomColor: colors.border,
          },
        ]}
      >
        <Text style={[styles.title, { color: colors.foreground }]}>Search</Text>
        <View
          style={[
            styles.searchBar,
            { backgroundColor: colors.secondary, borderColor: colors.border },
          ]}
        >
          <Ionicons name="search-outline" size={18} color={colors.mutedForeground} />
          <TextInput
            style={[styles.searchInput, { color: colors.foreground }]}
            value={query}
            onChangeText={setQuery}
            placeholder="Search your absorbed knowledge…"
            placeholderTextColor={colors.mutedForeground}
            returnKeyType="search"
            autoCapitalize="none"
            autoCorrect={false}
          />
          {query.length > 0 && (
            <Pressable onPress={() => setQuery("")}>
              <Ionicons name="close-circle" size={18} color={colors.mutedForeground} />
            </Pressable>
          )}
        </View>
      </View>

      <FlatList
        data={results}
        keyExtractor={(item) => item.page.id}
        renderItem={({ item }) => {
          const highlights = highlightText(item.excerpt, query);
          return (
            <Pressable
              style={({ pressed }) => [
                styles.resultCard,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                  opacity: pressed ? 0.75 : 1,
                },
              ]}
              onPress={() => router.push(`/wiki/${item.page.id}`)}
            >
              <View style={styles.resultHeader}>
                {item.page.favicon ? (
                  <Image source={{ uri: item.page.favicon }} style={styles.favicon} />
                ) : (
                  <View
                    style={[
                      styles.faviconPlaceholder,
                      { backgroundColor: colors.secondary },
                    ]}
                  >
                    <Ionicons name="globe-outline" size={14} color={colors.mutedForeground} />
                  </View>
                )}
                <View style={styles.resultMeta}>
                  <Text
                    style={[styles.resultTitle, { color: colors.foreground }]}
                    numberOfLines={1}
                  >
                    {item.page.title}
                  </Text>
                  <Text style={[styles.resultDomain, { color: colors.mutedForeground }]}>
                    {getDomain(item.page.url)}
                  </Text>
                </View>
                <View
                  style={[
                    styles.scoreBadge,
                    { backgroundColor: "rgba(124,58,237,0.2)" },
                  ]}
                >
                  <Text style={[styles.scoreText, { color: "#a78bfa" }]}>
                    {item.score}
                  </Text>
                </View>
              </View>
              <Text style={[styles.excerpt, { color: colors.mutedForeground }]}>
                {highlights.map((part, i) =>
                  part.highlight ? (
                    <Text
                      key={i}
                      style={[
                        styles.excerptHighlight,
                        { backgroundColor: "rgba(245,158,11,0.25)", color: "#f59e0b" },
                      ]}
                    >
                      {part.text}
                    </Text>
                  ) : (
                    <Text key={i}>{part.text}</Text>
                  )
                )}
              </Text>
            </Pressable>
          );
        }}
        ListEmptyComponent={
          <View style={styles.empty}>
            {pages.length === 0 ? (
              <>
                <Ionicons name="search-outline" size={48} color={colors.mutedForeground} />
                <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
                  Nothing to Search
                </Text>
                <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
                  Browse pages in the Browse tab first to build your knowledge base.
                </Text>
              </>
            ) : query.trim().length < 2 ? (
              <>
                <Ionicons name="sparkles-outline" size={48} color={colors.mutedForeground} />
                <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
                  Search Your Knowledge
                </Text>
                <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
                  {pages.length} page{pages.length !== 1 ? "s" : ""} absorbed. Start typing to search.
                </Text>
              </>
            ) : (
              <>
                <Ionicons name="file-tray-outline" size={48} color={colors.mutedForeground} />
                <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
                  No Results
                </Text>
                <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
                  No relevant knowledge found for "{query}". Try different keywords.
                </Text>
              </>
            )}
          </View>
        }
        contentContainerStyle={{
          padding: 16,
          paddingBottom: bottomPad,
          flexGrow: 1,
        }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
    gap: 12,
  },
  title: { fontSize: 22, fontFamily: "Inter_700Bold" },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
    height: 46,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    height: "100%",
  },
  resultCard: {
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 10,
    gap: 10,
  },
  resultHeader: { flexDirection: "row", alignItems: "center", gap: 10 },
  favicon: { width: 28, height: 28, borderRadius: 6 },
  faviconPlaceholder: {
    width: 28,
    height: 28,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  resultMeta: { flex: 1 },
  resultTitle: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  resultDomain: { fontSize: 11, fontFamily: "Inter_400Regular", marginTop: 1 },
  scoreBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  scoreText: { fontSize: 11, fontFamily: "Inter_700Bold" },
  excerpt: { fontSize: 12, fontFamily: "Inter_400Regular", lineHeight: 19 },
  excerptHighlight: { fontFamily: "Inter_600SemiBold", borderRadius: 3 },
  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    gap: 12,
    paddingTop: 40,
  },
  emptyTitle: { fontSize: 18, fontFamily: "Inter_700Bold", textAlign: "center" },
  emptyText: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    lineHeight: 20,
  },
});
