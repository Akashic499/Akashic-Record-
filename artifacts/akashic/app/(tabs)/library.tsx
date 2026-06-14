import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  FlatList,
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { StarField } from "@/components/StarField";
import { useKnowledge } from "@/context/KnowledgeContext";
import { useColors } from "@/hooks/useColors";
import { getDomain } from "@/lib/extractor";

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 60) return `${m}m past`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h past`;
  return `${Math.floor(h / 24)}d past`;
}

type Tab = "tomes" | "sigils";

export default function LibraryScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { pages, entities, bookmarks } = useKnowledge();
  const [activeTab, setActiveTab] = useState<Tab>("tomes");

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 + 84 : 84;
  const bookmarkedIds = new Set(bookmarks.map((b) => b.pageId));

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StarField />

      <View style={[styles.header, { paddingTop: topPad + 14 }]}>
        <Text style={styles.headerGlyph}>◎</Text>
        <Text style={styles.headerTitle}>HALL OF RECORDS</Text>
        <Text style={styles.headerSub}>THE ACCUMULATED KNOWLEDGE</Text>

        <View style={styles.tabRow}>
          {([
            { key: "tomes", label: `TOMES  (${pages.length})` },
            { key: "sigils", label: `SIGILS  (${entities.length})` },
          ] as { key: Tab; label: string }[]).map((t) => (
            <Pressable
              key={t.key}
              style={[styles.tabBtn, activeTab === t.key && styles.tabBtnActive]}
              onPress={() => setActiveTab(t.key)}
            >
              <Text
                style={[
                  styles.tabBtnText,
                  activeTab === t.key && styles.tabBtnTextActive,
                ]}
              >
                {t.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      {activeTab === "tomes" ? (
        <FlatList
          data={pages}
          keyExtractor={(item) => item.id}
          renderItem={({ item: page }) => (
            <Pressable
              style={({ pressed }) => [styles.tomeCard, { opacity: pressed ? 0.7 : 1 }]}
              onPress={() => router.push(`/wiki/${page.id}`)}
            >
              <View style={styles.tomeCardInner}>
                <View style={styles.tomeRow}>
                  {page.favicon ? (
                    <Image source={{ uri: page.favicon }} style={styles.favicon} />
                  ) : (
                    <Text style={styles.tomeGlyph}>◈</Text>
                  )}
                  <View style={styles.tomeMeta}>
                    <Text style={styles.tomeTitle} numberOfLines={1}>{page.title}</Text>
                    <Text style={styles.tomeSub}>
                      {getDomain(page.url)} · {timeAgo(page.absorbedAt)} · {page.wordCount.toLocaleString()} glyphs
                    </Text>
                  </View>
                  {bookmarkedIds.has(page.id) && (
                    <Text style={styles.bookmarkGlyph}>★</Text>
                  )}
                  <Ionicons name="chevron-forward" size={14} color="#4a3c60" />
                </View>
                {page.summary ? (
                  <Text style={styles.tomeSummary} numberOfLines={2}>{page.summary}</Text>
                ) : null}
                {page.entities.length > 0 && (
                  <View style={styles.chips}>
                    {page.entities.slice(0, 5).map((e) => (
                      <View key={e} style={styles.chip}>
                        <Text style={styles.chipText}>{e}</Text>
                      </View>
                    ))}
                    {page.entities.length > 5 && (
                      <Text style={styles.chipMore}>+{page.entities.length - 5}</Text>
                    )}
                  </View>
                )}
              </View>
            </Pressable>
          )}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyGlyph}>◎</Text>
              <Text style={styles.emptyTitle}>THE HALL AWAITS</Text>
              <Text style={styles.emptyText}>
                Browse the mortal web to inscribe tomes into the Hall of Records.
              </Text>
            </View>
          }
          contentContainerStyle={{ padding: 20, paddingBottom: bottomPad }}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <ScrollView
          contentContainerStyle={{ padding: 20, paddingBottom: bottomPad }}
          showsVerticalScrollIndicator={false}
        >
          {entities.length === 0 ? (
            <View style={styles.empty}>
              <Text style={styles.emptyGlyph}>✦</Text>
              <Text style={styles.emptyTitle}>NO SIGILS FOUND</Text>
              <Text style={styles.emptyText}>
                Sigils are extracted from absorbed tomes. Inscribe pages to discover them.
              </Text>
            </View>
          ) : (
            <View style={styles.sigilGrid}>
              {entities.map((entity) => (
                <View key={entity.id} style={styles.sigilCard}>
                  <Text style={styles.sigilName} numberOfLines={1}>{entity.name}</Text>
                  <View style={styles.sigilMeta}>
                    <Text style={styles.sigilCount}>{entity.count}×</Text>
                    <Text style={styles.sigilPages}>{entity.pageIds.length} tome{entity.pageIds.length !== 1 ? "s" : ""}</Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      )}
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
  tabRow: { flexDirection: "row", borderWidth: 1, borderColor: BORDER },
  tabBtn: { flex: 1, paddingVertical: 9, alignItems: "center" },
  tabBtnActive: { backgroundColor: "rgba(201,168,64,0.1)" },
  tabBtnText: {
    fontFamily: "Cinzel_400Regular",
    fontSize: 9,
    letterSpacing: 2,
    color: "#4a3c60",
  },
  tabBtnTextActive: { color: GOLD },
  tomeCard: { marginBottom: 12 },
  tomeCardInner: {
    borderWidth: 1,
    borderColor: BORDER,
    padding: 14,
    backgroundColor: "rgba(13,9,39,0.85)",
    gap: 8,
  },
  tomeRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  favicon: { width: 22, height: 22, borderRadius: 2 },
  tomeGlyph: { width: 22, textAlign: "center", color: GOLD, fontSize: 14 },
  tomeMeta: { flex: 1 },
  tomeTitle: {
    fontFamily: "Cinzel_400Regular",
    fontSize: 13,
    color: "#e8d5a3",
    letterSpacing: 0.3,
  },
  tomeSub: { fontFamily: "Inter_400Regular", fontSize: 10, color: "#7a6850", marginTop: 2 },
  bookmarkGlyph: { color: GOLD, fontSize: 13 },
  tomeSummary: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    color: "#7a6850",
    lineHeight: 18,
    fontStyle: "italic",
  },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 5 },
  chip: { paddingHorizontal: 7, paddingVertical: 2, borderWidth: 1, borderColor: BORDER },
  chipText: { fontFamily: "Inter_400Regular", fontSize: 9, color: GOLD, opacity: 0.8 },
  chipMore: { fontFamily: "Inter_400Regular", fontSize: 9, color: "#7a6850", alignSelf: "center" },
  sigilGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  sigilCard: {
    width: "47%",
    padding: 12,
    borderWidth: 1,
    borderColor: BORDER,
    backgroundColor: "rgba(13,9,39,0.85)",
    gap: 6,
  },
  sigilName: { fontFamily: "Cinzel_400Regular", fontSize: 12, color: "#e8d5a3", letterSpacing: 0.3 },
  sigilMeta: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  sigilCount: { fontFamily: "Cinzel_700Bold", fontSize: 14, color: GOLD },
  sigilPages: { fontFamily: "Inter_400Regular", fontSize: 9, color: "#7a6850" },
  empty: { alignItems: "center", paddingTop: 60, gap: 14, paddingHorizontal: 32 },
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
