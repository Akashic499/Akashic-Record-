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
        <Text style={styles.notFoundGlyph}>◎</Text>
        <Text style={styles.notFoundText}>TOME NOT FOUND</Text>
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
    deletePage(page.id).then(() => router.back());
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingBottom: bottomPad + 40 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Scroll header */}
      <View style={styles.scrollHeader}>
        <View style={styles.scrollHeaderTop}>
          {page.favicon ? (
            <Image source={{ uri: page.favicon }} style={styles.favicon} />
          ) : null}
          <Text style={styles.domain}>{getDomain(page.url)}</Text>
          <Text style={styles.headerSep}>·</Text>
          <Text style={styles.inscribedDate}>Inscribed {formatDate(page.absorbedAt)}</Text>
        </View>

        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerGlyph}>✦</Text>
          <View style={styles.dividerLine} />
        </View>

        <Text style={styles.articleTitle}>{page.title}</Text>

        {page.summary ? (
          <Text style={styles.summary}>{page.summary}</Text>
        ) : null}

        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerGlyph}>◈</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <Pressable style={[styles.actionBtn, bookmarked && styles.actionBtnActive]} onPress={handleBookmark}>
            <Text style={[styles.actionBtnGlyph, bookmarked && styles.actionBtnGlyphActive]}>
              {bookmarked ? "★" : "☆"}
            </Text>
            <Text style={[styles.actionBtnText, bookmarked && styles.actionBtnTextActive]}>
              {bookmarked ? "MARKED" : "MARK"}
            </Text>
          </Pressable>
          <Pressable style={styles.actionBtn} onPress={() => Linking.openURL(page.url)}>
            <Text style={styles.actionBtnGlyph}>⤴</Text>
            <Text style={styles.actionBtnText}>SOURCE</Text>
          </Pressable>
          <Pressable style={[styles.actionBtn, styles.actionBtnDanger]} onPress={handleDelete}>
            <Text style={styles.actionBtnGlyphDanger}>✕</Text>
            <Text style={styles.actionBtnTextDanger}>REMOVE</Text>
          </Pressable>
        </View>
      </View>

      {/* Stats row */}
      <View style={styles.statsRow}>
        {[
          { glyph: "∿", label: "GLYPHS", value: page.wordCount.toLocaleString() },
          { glyph: "✦", label: "SIGILS", value: String(page.entities.length) },
        ].map((s) => (
          <View key={s.label} style={styles.statItem}>
            <Text style={styles.statGlyph}>{s.glyph}</Text>
            <Text style={styles.statValue}>{s.value}</Text>
            <Text style={styles.statLabel}>{s.label}</Text>
          </View>
        ))}
      </View>

      {/* Discovered Sigils */}
      {page.entities.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>DISCOVERED SIGILS</Text>
          <View style={styles.sigilGrid}>
            {page.entities.map((name) => {
              const rec = relatedEntities.find((e) => e.name === name);
              return (
                <View key={name} style={styles.sigilChip}>
                  <Text style={styles.sigilName}>{name}</Text>
                  {rec && rec.count > 1 && (
                    <Text style={styles.sigilCount}>{rec.count}×</Text>
                  )}
                </View>
              );
            })}
          </View>
        </View>
      )}

      {/* Divider */}
      <View style={[styles.divider, { marginHorizontal: 20 }]}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerGlyph}>◈</Text>
        <View style={styles.dividerLine} />
      </View>

      {/* Full content */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>INSCRIBED KNOWLEDGE</Text>
        <Text style={styles.contentText}>{page.content}</Text>
      </View>

      {/* Source */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>ORIGIN</Text>
        <Pressable onPress={() => Linking.openURL(page.url)}>
          <Text style={styles.urlText} numberOfLines={3}>{page.url}</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const GOLD = "#c9a840";
const BORDER = "rgba(201,168,64,0.22)";

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#05030e" },
  notFound: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
  notFoundGlyph: { color: GOLD, fontSize: 32, opacity: 0.4 },
  notFoundText: { fontFamily: "Cinzel_700Bold", fontSize: 12, letterSpacing: 4, color: GOLD, opacity: 0.5 },
  scrollHeader: {
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
    gap: 14,
    backgroundColor: "rgba(13,9,39,0.5)",
  },
  scrollHeaderTop: { flexDirection: "row", alignItems: "center", gap: 8 },
  favicon: { width: 18, height: 18, borderRadius: 2 },
  domain: { fontFamily: "Inter_400Regular", fontSize: 11, color: "#7a6850" },
  headerSep: { color: "#7a6850", fontSize: 11 },
  inscribedDate: { fontFamily: "Inter_400Regular", fontSize: 11, color: "#7a6850", fontStyle: "italic" },
  divider: { flexDirection: "row", alignItems: "center", gap: 10 },
  dividerLine: { flex: 1, height: 1, backgroundColor: BORDER },
  dividerGlyph: { color: GOLD, fontSize: 10, opacity: 0.5 },
  articleTitle: {
    fontFamily: "Cinzel_400Regular",
    fontSize: 20,
    color: "#e8d5a3",
    lineHeight: 30,
    letterSpacing: 0.5,
  },
  summary: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    color: "#7a6850",
    lineHeight: 21,
    fontStyle: "italic",
  },
  actions: { flexDirection: "row", gap: 8 },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: BORDER,
  },
  actionBtnActive: { borderColor: GOLD, backgroundColor: "rgba(201,168,64,0.08)" },
  actionBtnDanger: { borderColor: "rgba(239,68,68,0.3)" },
  actionBtnGlyph: { color: "#e8d5a3", fontSize: 13 },
  actionBtnGlyphActive: { color: GOLD },
  actionBtnGlyphDanger: { color: "#ef4444", fontSize: 13 },
  actionBtnText: {
    fontFamily: "Cinzel_400Regular",
    fontSize: 8,
    letterSpacing: 2,
    color: "#7a6850",
  },
  actionBtnTextActive: { color: GOLD },
  actionBtnTextDanger: {
    fontFamily: "Cinzel_400Regular",
    fontSize: 8,
    letterSpacing: 2,
    color: "#ef4444",
  },
  statsRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 14,
    gap: 3,
    borderRightWidth: 1,
    borderRightColor: BORDER,
  },
  statGlyph: { color: GOLD, fontSize: 13, opacity: 0.6 },
  statValue: { fontFamily: "Cinzel_700Bold", fontSize: 18, color: GOLD },
  statLabel: {
    fontFamily: "Cinzel_400Regular",
    fontSize: 7,
    letterSpacing: 2,
    color: "#7a6850",
  },
  section: { padding: 20, paddingBottom: 0, gap: 14 },
  sectionTitle: {
    fontFamily: "Cinzel_700Bold",
    fontSize: 8,
    letterSpacing: 3,
    color: GOLD,
    opacity: 0.6,
  },
  sigilGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  sigilChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: BORDER,
  },
  sigilName: { fontFamily: "Cinzel_400Regular", fontSize: 10, color: GOLD, opacity: 0.9, letterSpacing: 0.3 },
  sigilCount: { fontFamily: "Cinzel_700Bold", fontSize: 10, color: "rgba(201,168,64,0.5)" },
  contentText: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    color: "#e8d5a3",
    lineHeight: 23,
    fontStyle: "italic",
  },
  urlText: {
    fontFamily: "Inter_400Regular",
    fontSize: 11,
    color: GOLD,
    opacity: 0.6,
    textDecorationLine: "underline",
  },
});
