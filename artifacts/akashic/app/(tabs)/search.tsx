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

import { StarField } from "@/components/StarField";
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
  const bottomPad = Platform.OS === "web" ? 34 + 84 : 84;

  const results = useMemo(() => {
    if (query.trim().length < 2) return [];
    return searchKnowledge(query, pages);
  }, [query, pages]);

  const highlightParts = (text: string, q: string) => {
    if (!q.trim()) return [{ text, highlight: false }];
    const terms = q.toLowerCase().split(/\s+/).filter((t) => t.length > 1);
    const pattern = new RegExp(
      `(${terms.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})`,
      "gi"
    );
    return text.split(pattern).map((part) => ({
      text: part,
      highlight: terms.some((t) => part.toLowerCase() === t),
    }));
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StarField />

      <View style={[styles.header, { paddingTop: topPad + 14 }]}>
        <Text style={styles.headerGlyph}>✦</Text>
        <Text style={styles.headerTitle}>SEEK THE RECORD</Text>
        <Text style={styles.headerSub}>QUERY THE AKASHIC FIELD</Text>

        <View style={styles.searchBar}>
          <Text style={styles.searchGlyph}>{query ? "◈" : "✦"}</Text>
          <TextInput
            style={styles.searchInput}
            value={query}
            onChangeText={setQuery}
            placeholder="Speak your query into the void…"
            placeholderTextColor="#4a3c60"
            returnKeyType="search"
            autoCapitalize="none"
            autoCorrect={false}
          />
          {query.length > 0 && (
            <Pressable onPress={() => setQuery("")}>
              <Ionicons name="close" size={16} color="#4a3c60" />
            </Pressable>
          )}
        </View>
      </View>

      <FlatList
        data={results}
        keyExtractor={(item) => item.page.id}
        renderItem={({ item }) => {
          const highlights = highlightParts(item.excerpt, query);
          return (
            <Pressable
              style={({ pressed }) => [styles.resultCard, { opacity: pressed ? 0.7 : 1 }]}
              onPress={() => router.push(`/wiki/${item.page.id}`)}
            >
              <View style={styles.resultCardInner}>
                <View style={styles.resultHeader}>
                  {item.page.favicon ? (
                    <Image source={{ uri: item.page.favicon }} style={styles.favicon} />
                  ) : (
                    <Text style={styles.resultGlyph}>◈</Text>
                  )}
                  <View style={styles.resultMeta}>
                    <Text style={styles.resultTitle} numberOfLines={1}>{item.page.title}</Text>
                    <Text style={styles.resultDomain}>{getDomain(item.page.url)}</Text>
                  </View>
                  <View style={styles.resonanceBadge}>
                    <Text style={styles.resonanceLabel}>RESONANCE</Text>
                    <Text style={styles.resonanceValue}>{item.score}</Text>
                  </View>
                </View>

                <View style={styles.divider} />

                <Text style={styles.excerpt}>
                  {highlights.map((part, i) =>
                    part.highlight ? (
                      <Text key={i} style={styles.excerptHighlight}>{part.text}</Text>
                    ) : (
                      <Text key={i}>{part.text}</Text>
                    )
                  )}
                </Text>
              </View>
            </Pressable>
          );
        }}
        ListEmptyComponent={
          <View style={styles.empty}>
            {pages.length === 0 ? (
              <>
                <Text style={styles.emptyGlyph}>✦</Text>
                <Text style={styles.emptyTitle}>THE FIELD IS EMPTY</Text>
                <Text style={styles.emptyText}>Inscribe tomes to the record first, then seek within them.</Text>
              </>
            ) : query.trim().length < 2 ? (
              <>
                <Text style={styles.emptyGlyph}>◈</Text>
                <Text style={styles.emptyTitle}>{pages.length} TOMES AWAIT</Text>
                <Text style={styles.emptyText}>Speak your query into the void and the Record shall answer.</Text>
              </>
            ) : (
              <>
                <Text style={styles.emptyGlyph}>○</Text>
                <Text style={styles.emptyTitle}>NO RESONANCE FOUND</Text>
                <Text style={styles.emptyText}>The Record holds no knowledge of "{query}". Inscribe more tomes.</Text>
              </>
            )}
          </View>
        }
        contentContainerStyle={{ padding: 20, paddingBottom: bottomPad, flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      />
    </View>
  );
}

const GOLD = "#c9a840";
const BORDER = "rgba(201,168,64,0.22)";

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    alignItems: "center",
    paddingHorizontal: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
    backgroundColor: "rgba(8,6,32,0.95)",
    gap: 4,
  },
  headerGlyph: { color: GOLD, fontSize: 18, opacity: 0.6 },
  headerTitle: {
    fontFamily: "Cinzel_700Bold",
    fontSize: 16,
    letterSpacing: 5,
    color: GOLD,
  },
  headerSub: {
    fontFamily: "Cinzel_400Regular",
    fontSize: 8,
    letterSpacing: 3,
    color: "rgba(201,168,64,0.4)",
    marginBottom: 12,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    borderWidth: 1,
    borderColor: BORDER,
    paddingHorizontal: 14,
    height: 42,
    gap: 10,
    backgroundColor: "rgba(13,9,39,0.6)",
  },
  searchGlyph: { color: GOLD, fontSize: 12, opacity: 0.7 },
  searchInput: {
    flex: 1,
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    color: "#e8d5a3",
    height: "100%",
    fontStyle: "italic",
  },
  resultCard: { marginBottom: 14 },
  resultCardInner: {
    borderWidth: 1,
    borderColor: BORDER,
    padding: 14,
    backgroundColor: "rgba(13,9,39,0.85)",
    gap: 10,
  },
  resultHeader: { flexDirection: "row", alignItems: "center", gap: 10 },
  favicon: { width: 22, height: 22, borderRadius: 2 },
  resultGlyph: { width: 22, textAlign: "center", color: GOLD, fontSize: 14 },
  resultMeta: { flex: 1 },
  resultTitle: {
    fontFamily: "Cinzel_400Regular",
    fontSize: 13,
    color: "#e8d5a3",
    letterSpacing: 0.3,
  },
  resultDomain: { fontFamily: "Inter_400Regular", fontSize: 10, color: "#7a6850", marginTop: 2 },
  resonanceBadge: { alignItems: "center" },
  resonanceLabel: {
    fontFamily: "Cinzel_400Regular",
    fontSize: 6,
    letterSpacing: 1.5,
    color: "rgba(201,168,64,0.5)",
  },
  resonanceValue: {
    fontFamily: "Cinzel_700Bold",
    fontSize: 16,
    color: GOLD,
  },
  divider: { height: 1, backgroundColor: BORDER },
  excerpt: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    color: "#7a6850",
    lineHeight: 19,
    fontStyle: "italic",
  },
  excerptHighlight: {
    color: GOLD,
    fontStyle: "normal",
    fontFamily: "Inter_500Medium",
  },
  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    gap: 12,
    paddingTop: 60,
  },
  emptyGlyph: { color: GOLD, fontSize: 32, opacity: 0.4 },
  emptyTitle: {
    fontFamily: "Cinzel_700Bold",
    fontSize: 12,
    letterSpacing: 4,
    color: GOLD,
    opacity: 0.6,
  },
  emptyText: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    color: "#7a6850",
    textAlign: "center",
    lineHeight: 20,
    fontStyle: "italic",
  },
});
