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

import { useKnowledge } from "@/context/KnowledgeContext";
import { useColors } from "@/hooks/useColors";
import { getDomain } from "@/lib/extractor";

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

type Tab = "pages" | "entities";

export default function LibraryScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { pages, entities, bookmarks } = useKnowledge();
  const [activeTab, setActiveTab] = useState<Tab>("pages");

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 + 84 : 80;

  const bookmarkedIds = new Set(bookmarks.map((b) => b.pageId));

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
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>
          Library
        </Text>
        <View style={[styles.tabBar, { backgroundColor: colors.secondary }]}>
          {(["pages", "entities"] as Tab[]).map((t) => (
            <Pressable
              key={t}
              style={[
                styles.tabBtn,
                activeTab === t && { backgroundColor: colors.primary },
              ]}
              onPress={() => setActiveTab(t)}
            >
              <Text
                style={[
                  styles.tabBtnText,
                  { color: activeTab === t ? "#fff" : colors.mutedForeground },
                ]}
              >
                {t === "pages"
                  ? `Pages (${pages.length})`
                  : `Entities (${entities.length})`}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      {activeTab === "pages" ? (
        <FlatList
          data={pages}
          keyExtractor={(item) => item.id}
          renderItem={({ item: page }) => (
            <Pressable
              style={({ pressed }) => [
                styles.pageCard,
                {
                  backgroundColor: colors.card,
                  borderColor: bookmarkedIds.has(page.id)
                    ? "rgba(245,158,11,0.4)"
                    : colors.border,
                  opacity: pressed ? 0.75 : 1,
                },
              ]}
              onPress={() => router.push(`/wiki/${page.id}`)}
            >
              <View style={styles.pageRow}>
                {page.favicon ? (
                  <Image source={{ uri: page.favicon }} style={styles.favicon} />
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
                <View style={styles.pageMeta}>
                  <Text
                    style={[styles.pageTitle, { color: colors.foreground }]}
                    numberOfLines={1}
                  >
                    {page.title}
                  </Text>
                  <Text
                    style={[styles.pageDomain, { color: colors.mutedForeground }]}
                  >
                    {getDomain(page.url)} · {timeAgo(page.absorbedAt)} · {page.wordCount.toLocaleString()} words
                  </Text>
                </View>
                {bookmarkedIds.has(page.id) && (
                  <Ionicons name="bookmark" size={16} color="#f59e0b" />
                )}
                <Ionicons name="chevron-forward" size={16} color={colors.mutedForeground} />
              </View>
              {page.summary ? (
                <Text
                  style={[styles.pageSummary, { color: colors.mutedForeground }]}
                  numberOfLines={2}
                >
                  {page.summary}
                </Text>
              ) : null}
              {page.entities.length > 0 && (
                <View style={styles.chips}>
                  {page.entities.slice(0, 5).map((e) => (
                    <View
                      key={e}
                      style={[styles.chip, { backgroundColor: colors.secondary }]}
                    >
                      <Text
                        style={[styles.chipText, { color: colors.primary }]}
                        numberOfLines={1}
                      >
                        {e}
                      </Text>
                    </View>
                  ))}
                  {page.entities.length > 5 && (
                    <Text style={[styles.chipMore, { color: colors.mutedForeground }]}>
                      +{page.entities.length - 5}
                    </Text>
                  )}
                </View>
              )}
            </Pressable>
          )}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="library-outline" size={48} color={colors.mutedForeground} />
              <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
                No Pages Yet
              </Text>
              <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
                Browse websites in the Browse tab to fill your library.
              </Text>
            </View>
          }
          contentContainerStyle={{ padding: 16, paddingBottom: bottomPad }}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <ScrollView
          contentContainerStyle={{ padding: 16, paddingBottom: bottomPad }}
          showsVerticalScrollIndicator={false}
        >
          {entities.length === 0 ? (
            <View style={styles.empty}>
              <Ionicons name="git-network-outline" size={48} color={colors.mutedForeground} />
              <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
                No Entities Yet
              </Text>
              <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
                Entities are discovered automatically from absorbed pages.
              </Text>
            </View>
          ) : (
            <View style={styles.entityGrid}>
              {entities.map((entity) => (
                <View
                  key={entity.id}
                  style={[
                    styles.entityCard,
                    {
                      backgroundColor: colors.card,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <View style={styles.entityCardHeader}>
                    <Text
                      style={[styles.entityName, { color: colors.foreground }]}
                      numberOfLines={1}
                    >
                      {entity.name}
                    </Text>
                    <View
                      style={[
                        styles.entityCountBadge,
                        { backgroundColor: "rgba(124,58,237,0.2)" },
                      ]}
                    >
                      <Text style={[styles.entityCount, { color: "#a78bfa" }]}>
                        {entity.count}×
                      </Text>
                    </View>
                  </View>
                  <Text style={[styles.entityPages, { color: colors.mutedForeground }]}>
                    Found in {entity.pageIds.length} page{entity.pageIds.length !== 1 ? "s" : ""}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      )}
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
  headerTitle: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
  },
  tabBar: {
    flexDirection: "row",
    borderRadius: 12,
    padding: 3,
    gap: 3,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: "center",
  },
  tabBtnText: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
  },
  pageCard: {
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 10,
    gap: 8,
  },
  pageRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  favicon: { width: 28, height: 28, borderRadius: 6 },
  faviconPlaceholder: {
    width: 28,
    height: 28,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  pageMeta: { flex: 1 },
  pageTitle: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  pageDomain: { fontSize: 11, fontFamily: "Inter_400Regular", marginTop: 1 },
  pageSummary: { fontSize: 12, fontFamily: "Inter_400Regular", lineHeight: 18 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 5 },
  chip: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  chipText: { fontSize: 10, fontFamily: "Inter_500Medium" },
  chipMore: { fontSize: 10, fontFamily: "Inter_400Regular", alignSelf: "center" },
  entityGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  entityCard: {
    width: "48%",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 4,
  },
  entityCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 6,
  },
  entityName: { fontSize: 13, fontFamily: "Inter_600SemiBold", flex: 1 },
  entityCountBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 8,
  },
  entityCount: { fontSize: 11, fontFamily: "Inter_700Bold" },
  entityPages: { fontSize: 11, fontFamily: "Inter_400Regular" },
  empty: {
    alignItems: "center",
    paddingTop: 60,
    gap: 12,
    paddingHorizontal: 32,
  },
  emptyTitle: { fontSize: 18, fontFamily: "Inter_700Bold" },
  emptyText: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    lineHeight: 20,
  },
});
