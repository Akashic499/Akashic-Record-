import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import {
  Image,
  Linking,
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

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return iso;
  }
}

export default function WikiArticle() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { pages, entities, isBookmarked, toggleBookmark, deletePage } = useKnowledge();

  const page = pages.find((p) => p.id === id);
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  if (!page) {
    return (
      <View style={[styles.notFound, { backgroundColor: colors.background }]}>
        <Ionicons name="file-tray-outline" size={48} color={colors.mutedForeground} />
        <Text style={[styles.notFoundText, { color: colors.foreground }]}>
          Article not found
        </Text>
      </View>
    );
  }

  const relatedEntities = entities.filter((e) => page.entities.includes(e.name));
  const bookmarked = isBookmarked(page.id);

  const handleBookmark = () => {
    toggleBookmark(page);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
  };

  const handleDelete = () => {
    deletePage(page.id).then(() => {
      router.back();
    });
  };

  const handleOpenOriginal = () => {
    Linking.openURL(page.url).catch(() => {});
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingBottom: bottomPad + 32 }}
      showsVerticalScrollIndicator={false}
    >
      <View style={[styles.articleHeader, { borderBottomColor: colors.border }]}>
        <View style={styles.sourceRow}>
          {page.favicon ? (
            <Image source={{ uri: page.favicon }} style={styles.favicon} />
          ) : null}
          <Text style={[styles.domain, { color: colors.mutedForeground }]}>
            {getDomain(page.url)}
          </Text>
          <Text style={[styles.dot, { color: colors.mutedForeground }]}>·</Text>
          <Text style={[styles.date, { color: colors.mutedForeground }]}>
            {formatDate(page.absorbedAt)}
          </Text>
        </View>

        <Text style={[styles.articleTitle, { color: colors.foreground }]}>
          {page.title}
        </Text>

        {page.summary ? (
          <Text style={[styles.summary, { color: colors.mutedForeground }]}>
            {page.summary}
          </Text>
        ) : null}

        <View style={styles.actions}>
          <Pressable
            style={[styles.actionBtn, { borderColor: colors.border, backgroundColor: colors.card }]}
            onPress={handleBookmark}
          >
            <Ionicons
              name={bookmarked ? "bookmark" : "bookmark-outline"}
              size={18}
              color={bookmarked ? "#f59e0b" : colors.foreground}
            />
            <Text style={[styles.actionBtnText, { color: colors.foreground }]}>
              {bookmarked ? "Saved" : "Save"}
            </Text>
          </Pressable>

          <Pressable
            style={[styles.actionBtn, { borderColor: colors.border, backgroundColor: colors.card }]}
            onPress={handleOpenOriginal}
          >
            <Ionicons name="open-outline" size={18} color={colors.foreground} />
            <Text style={[styles.actionBtnText, { color: colors.foreground }]}>
              Original
            </Text>
          </Pressable>

          <Pressable
            style={[styles.actionBtn, { borderColor: "rgba(239,68,68,0.4)", backgroundColor: "rgba(239,68,68,0.1)" }]}
            onPress={handleDelete}
          >
            <Ionicons name="trash-outline" size={18} color="#ef4444" />
          </Pressable>
        </View>
      </View>

      <View style={styles.statsStrip}>
        {[
          { icon: "text-outline", label: `${page.wordCount.toLocaleString()} words` },
          { icon: "git-network-outline", label: `${page.entities.length} entities` },
        ].map((s) => (
          <View key={s.label} style={[styles.statItem, { backgroundColor: colors.secondary }]}>
            <Ionicons name={s.icon as any} size={14} color={colors.primary} />
            <Text style={[styles.statItemText, { color: colors.foreground }]}>{s.label}</Text>
          </View>
        ))}
      </View>

      {page.entities.length > 0 && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
            Discovered Entities
          </Text>
          <View style={styles.entityGrid}>
            {page.entities.map((name) => {
              const entityRecord = relatedEntities.find((e) => e.name === name);
              return (
                <View
                  key={name}
                  style={[
                    styles.entityChip,
                    {
                      backgroundColor: "rgba(124,58,237,0.12)",
                      borderColor: "rgba(124,58,237,0.3)",
                    },
                  ]}
                >
                  <Text style={[styles.entityChipName, { color: "#a78bfa" }]}>{name}</Text>
                  {entityRecord && entityRecord.count > 1 && (
                    <Text style={[styles.entityChipCount, { color: colors.mutedForeground }]}>
                      {entityRecord.count}×
                    </Text>
                  )}
                </View>
              );
            })}
          </View>
        </View>
      )}

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
          Absorbed Content
        </Text>
        <View style={[styles.contentBlock, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.contentText, { color: colors.foreground }]}>
            {page.content}
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Source</Text>
        <Pressable onPress={handleOpenOriginal}>
          <Text style={[styles.urlText, { color: colors.primary }]} numberOfLines={2}>
            {page.url}
          </Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  notFound: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
  },
  notFoundText: { fontSize: 16, fontFamily: "Inter_500Medium" },
  articleHeader: {
    padding: 20,
    borderBottomWidth: 1,
    gap: 10,
  },
  sourceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  favicon: { width: 18, height: 18, borderRadius: 4 },
  domain: { fontSize: 12, fontFamily: "Inter_400Regular" },
  dot: { fontSize: 12 },
  date: { fontSize: 12, fontFamily: "Inter_400Regular" },
  articleTitle: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
    lineHeight: 30,
  },
  summary: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    lineHeight: 22,
    fontStyle: "italic",
  },
  actions: { flexDirection: "row", gap: 8, marginTop: 4 },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
  },
  actionBtnText: { fontSize: 13, fontFamily: "Inter_500Medium" },
  statsStrip: {
    flexDirection: "row",
    gap: 10,
    padding: 20,
    paddingTop: 14,
    paddingBottom: 0,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  statItemText: { fontSize: 12, fontFamily: "Inter_500Medium" },
  section: {
    padding: 20,
    paddingBottom: 0,
    gap: 12,
  },
  sectionTitle: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  entityGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  entityChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  entityChipName: { fontSize: 12, fontFamily: "Inter_500Medium" },
  entityChipCount: { fontSize: 10, fontFamily: "Inter_400Regular" },
  contentBlock: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 16,
  },
  contentText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    lineHeight: 23,
  },
  urlText: { fontSize: 13, fontFamily: "Inter_400Regular" },
});
