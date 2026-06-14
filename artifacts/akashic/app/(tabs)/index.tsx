import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useMemo } from "react";
import {
  FlatList,
  Image,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AkashicSymbol } from "@/components/AkashicSymbol";
import { StarField } from "@/components/StarField";
import { useKnowledge } from "@/context/KnowledgeContext";
import { useColors } from "@/hooks/useColors";
import { getDomain } from "@/lib/extractor";

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const s = Math.floor(diff / 1000);
  if (s < 60) return "moments ago";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m past`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h past`;
  return `${Math.floor(h / 24)}d past`;
}

function formatNumber(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return String(n);
}

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { pages, entities, stats, isAbsorbing } = useKnowledge();

  const topEntities = useMemo(() => entities.slice(0, 8), [entities]);
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const renderPage = ({ item: page }: { item: (typeof pages)[0] }) => (
    <Pressable
      style={({ pressed }) => [
        styles.scrollCard,
        { opacity: pressed ? 0.7 : 1 },
      ]}
      onPress={() => router.push(`/wiki/${page.id}`)}
    >
      <View style={styles.scrollCardInner}>
        <View style={styles.scrollCardHeader}>
          {page.favicon ? (
            <Image source={{ uri: page.favicon }} style={styles.favicon} />
          ) : (
            <Text style={styles.scrollGlyph}>◈</Text>
          )}
          <View style={styles.scrollMeta}>
            <Text style={[styles.scrollTitle, { color: colors.parchment }]} numberOfLines={1}>
              {page.title}
            </Text>
            <Text style={[styles.scrollSub, { color: colors.mutedForeground }]}>
              {getDomain(page.url)} · {timeAgo(page.absorbedAt)}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={14} color={colors.mutedForeground} />
        </View>
        {page.summary ? (
          <Text style={[styles.scrollSummary, { color: colors.mutedForeground }]} numberOfLines={2}>
            {page.summary}
          </Text>
        ) : null}
        {page.entities.length > 0 && (
          <View style={styles.sigilRow}>
            {page.entities.slice(0, 4).map((e) => (
              <View key={e} style={styles.sigilChip}>
                <Text style={styles.sigilText}>{e}</Text>
              </View>
            ))}
            {page.entities.length > 4 && (
              <Text style={[styles.sigilMore, { color: colors.mutedForeground }]}>
                +{page.entities.length - 4}
              </Text>
            )}
          </View>
        )}
      </View>
    </Pressable>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StarField />
      <FlatList
        data={pages}
        keyExtractor={(item) => item.id}
        renderItem={renderPage}
        ListHeaderComponent={
          <View>
            {/* Hero header */}
            <View style={[styles.hero, { paddingTop: topPad + 24 }]}>
              <AkashicSymbol size={90} color={colors.primary} />

              <Text style={styles.heroTitle}>AKASHIC</Text>
              <View style={styles.heroDivider}>
                <View style={styles.heroDividerLine} />
                <Text style={styles.heroDividerGlyph}>✦</Text>
                <View style={styles.heroDividerLine} />
              </View>
              <Text style={styles.heroSubtitle}>RECORD</Text>

              <Text style={[styles.heroTagline, { color: colors.mutedForeground }]}>
                The cosmic field of all knowing
              </Text>

              {isAbsorbing && (
                <View style={styles.absorbingPill}>
                  <Text style={styles.absorbingDot}>◉</Text>
                  <Text style={styles.absorbingLabel}>INSCRIBING TO THE RECORD</Text>
                </View>
              )}
            </View>

            {/* Stats */}
            <View style={styles.statsRow}>
              {[
                { glyph: "◎", label: "TOMES", value: formatNumber(stats.totalPages) },
                { glyph: "✦", label: "SIGILS", value: formatNumber(stats.totalEntities) },
                { glyph: "∿", label: "GLYPHS", value: formatNumber(stats.totalWords) },
              ].map((s) => (
                <View key={s.label} style={styles.statCard}>
                  <Text style={styles.statGlyph}>{s.glyph}</Text>
                  <Text style={styles.statValue}>{s.value}</Text>
                  <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>{s.label}</Text>
                </View>
              ))}
            </View>

            {/* Divider */}
            <View style={styles.sectionDivider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerGlyph}>◈</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Discovered Sigils */}
            {topEntities.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>DISCOVERED SIGILS</Text>
                <View style={styles.entityCloud}>
                  {topEntities.map((entity) => (
                    <View key={entity.id} style={styles.entityCloudChip}>
                      <Text style={styles.entityCloudName}>{entity.name}</Text>
                      <Text style={[styles.entityCloudCount, { color: colors.mutedForeground }]}>
                        {entity.count}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Divider */}
            {pages.length > 0 && (
              <>
                <View style={styles.sectionDivider}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.dividerGlyph}>◈</Text>
                  <View style={styles.dividerLine} />
                </View>
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>RECENT INSCRIPTIONS</Text>
                </View>
              </>
            )}
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
              The Record is vast and empty.{"\n"}Browse the mortal web to inscribe its knowledge.
            </Text>
            <Pressable
              style={styles.startBtn}
              onPress={() => router.push("/(tabs)/browser")}
            >
              <Text style={styles.startBtnText}>BEGIN INSCRIBING</Text>
            </Pressable>
          </View>
        }
        contentContainerStyle={{ paddingBottom: Platform.OS === "web" ? 34 + 84 : 84 }}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const GOLD = "#c9a840";
const BORDER = "rgba(201,168,64,0.22)";

const styles = StyleSheet.create({
  container: { flex: 1 },
  hero: {
    alignItems: "center",
    paddingBottom: 28,
    paddingHorizontal: 24,
    gap: 6,
  },
  heroTitle: {
    fontFamily: "Cinzel_700Bold",
    fontSize: 30,
    letterSpacing: 10,
    color: GOLD,
    marginTop: 12,
  },
  heroDivider: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginVertical: 2,
  },
  heroDividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: BORDER,
  },
  heroDividerGlyph: { color: GOLD, fontSize: 10 },
  heroSubtitle: {
    fontFamily: "Cinzel_400Regular",
    fontSize: 16,
    letterSpacing: 8,
    color: "rgba(201,168,64,0.6)",
  },
  heroTagline: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    letterSpacing: 1.5,
    marginTop: 6,
  },
  absorbingPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: "rgba(46,168,125,0.4)",
    borderRadius: 4,
    marginTop: 8,
  },
  absorbingDot: { color: "#2ea87d", fontSize: 11 },
  absorbingLabel: {
    fontFamily: "Cinzel_400Regular",
    fontSize: 9,
    letterSpacing: 2,
    color: "#2ea87d",
  },
  statsRow: {
    flexDirection: "row",
    marginHorizontal: 20,
    borderWidth: 1,
    borderColor: BORDER,
  },
  statCard: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 16,
    gap: 4,
    borderRightWidth: 1,
    borderRightColor: BORDER,
  },
  statGlyph: { color: GOLD, fontSize: 14, opacity: 0.7 },
  statValue: {
    fontFamily: "Cinzel_700Bold",
    fontSize: 22,
    color: GOLD,
  },
  statLabel: {
    fontFamily: "Cinzel_400Regular",
    fontSize: 8,
    letterSpacing: 2,
  },
  sectionDivider: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 20,
    marginVertical: 20,
    gap: 10,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: BORDER },
  dividerGlyph: { color: GOLD, fontSize: 12, opacity: 0.6 },
  section: { paddingHorizontal: 20, marginBottom: 12 },
  sectionTitle: {
    fontFamily: "Cinzel_700Bold",
    fontSize: 10,
    letterSpacing: 3,
    color: GOLD,
    opacity: 0.7,
    marginBottom: 12,
  },
  entityCloud: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  entityCloudChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: BORDER,
  },
  entityCloudName: {
    fontFamily: "Cinzel_400Regular",
    fontSize: 10,
    color: GOLD,
    letterSpacing: 0.5,
  },
  entityCloudCount: { fontFamily: "Inter_400Regular", fontSize: 10 },
  scrollCard: {
    marginHorizontal: 20,
    marginBottom: 12,
  },
  scrollCardInner: {
    borderWidth: 1,
    borderColor: BORDER,
    padding: 14,
    gap: 8,
    backgroundColor: "rgba(13,9,39,0.8)",
  },
  scrollCardHeader: { flexDirection: "row", alignItems: "center", gap: 10 },
  favicon: { width: 22, height: 22, borderRadius: 3 },
  scrollGlyph: { width: 22, textAlign: "center", color: GOLD, fontSize: 14 },
  scrollMeta: { flex: 1 },
  scrollTitle: { fontFamily: "Cinzel_400Regular", fontSize: 13, letterSpacing: 0.3 },
  scrollSub: { fontFamily: "Inter_400Regular", fontSize: 10, marginTop: 2 },
  scrollSummary: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    lineHeight: 18,
    fontStyle: "italic",
  },
  sigilRow: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  sigilChip: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: BORDER,
  },
  sigilText: {
    fontFamily: "Inter_400Regular",
    fontSize: 9,
    color: GOLD,
    opacity: 0.8,
    letterSpacing: 0.5,
  },
  sigilMore: { fontSize: 10, fontFamily: "Inter_400Regular", alignSelf: "center" },
  emptyState: { alignItems: "center", paddingHorizontal: 40, paddingTop: 24, gap: 20 },
  emptyText: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    textAlign: "center",
    lineHeight: 22,
    fontStyle: "italic",
  },
  startBtn: {
    borderWidth: 1,
    borderColor: GOLD,
    paddingHorizontal: 28,
    paddingVertical: 12,
  },
  startBtnText: {
    fontFamily: "Cinzel_700Bold",
    fontSize: 11,
    letterSpacing: 3,
    color: GOLD,
  },
});
