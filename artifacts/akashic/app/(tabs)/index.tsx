import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
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

import { useKnowledge } from "@/context/KnowledgeContext";
import { useColors } from "@/hooks/useColors";
import { getDomain } from "@/lib/extractor";

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const s = Math.floor(diff / 1000);
  if (s < 60) return "just now";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
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

  const topEntities = useMemo(() => entities.slice(0, 6), [entities]);

  const headerPaddingTop = Platform.OS === "web" ? 67 : insets.top;

  const renderPage = ({ item: page }: { item: (typeof pages)[0] }) => (
    <Pressable
      style={({ pressed }) => [
        styles.pageCard,
        { backgroundColor: colors.card, borderColor: colors.border, opacity: pressed ? 0.7 : 1 },
      ]}
      onPress={() => router.push(`/wiki/${page.id}`)}
    >
      <View style={styles.pageCardHeader}>
        {page.favicon ? (
          <Image source={{ uri: page.favicon }} style={styles.favicon} />
        ) : (
          <View style={[styles.faviconPlaceholder, { backgroundColor: colors.secondary }]}>
            <Ionicons name="globe-outline" size={14} color={colors.mutedForeground} />
          </View>
        )}
        <View style={styles.pageCardMeta}>
          <Text style={[styles.pageCardTitle, { color: colors.foreground }]} numberOfLines={1}>
            {page.title}
          </Text>
          <Text style={[styles.pageCardDomain, { color: colors.mutedForeground }]}>
            {getDomain(page.url)} · {timeAgo(page.absorbedAt)}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={16} color={colors.mutedForeground} />
      </View>
      {page.summary ? (
        <Text style={[styles.pageCardSummary, { color: colors.mutedForeground }]} numberOfLines={2}>
          {page.summary}
        </Text>
      ) : null}
      {page.entities.length > 0 && (
        <View style={styles.entityRow}>
          {page.entities.slice(0, 4).map((e) => (
            <View key={e} style={[styles.entityChip, { backgroundColor: colors.secondary }]}>
              <Text style={[styles.entityChipText, { color: colors.primary }]} numberOfLines={1}>
                {e}
              </Text>
            </View>
          ))}
          {page.entities.length > 4 && (
            <Text style={[styles.entityMore, { color: colors.mutedForeground }]}>
              +{page.entities.length - 4}
            </Text>
          )}
        </View>
      )}
    </Pressable>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={pages}
        keyExtractor={(item) => item.id}
        renderItem={renderPage}
        ListHeaderComponent={
          <View>
            <LinearGradient
              colors={["#0d0b1e", "#060714"]}
              style={[styles.header, { paddingTop: headerPaddingTop + 16 }]}
            >
              <View style={styles.headerContent}>
                <View style={styles.headerTitle}>
                  <Text style={styles.akashicLabel}>AKASHIC</Text>
                  <Text style={styles.recordLabel}>RECORD</Text>
                  {isAbsorbing && (
                    <View style={styles.absorbingBadge}>
                      <View style={styles.absorbingDot} />
                      <Text style={styles.absorbingText}>Absorbing…</Text>
                    </View>
                  )}
                </View>
                <Text style={[styles.headerSubtitle, { color: colors.mutedForeground }]}>
                  Your self-growing knowledge universe
                </Text>
              </View>

              <View style={styles.statsRow}>
                {[
                  { label: "Pages", value: formatNumber(stats.totalPages), icon: "document-text" },
                  { label: "Entities", value: formatNumber(stats.totalEntities), icon: "git-network" },
                  { label: "Words", value: formatNumber(stats.totalWords), icon: "text" },
                ].map((stat) => (
                  <View
                    key={stat.label}
                    style={[styles.statCard, { backgroundColor: "rgba(124,58,237,0.12)", borderColor: "rgba(124,58,237,0.25)" }]}
                  >
                    <Ionicons name={stat.icon as any} size={18} color="#a78bfa" />
                    <Text style={styles.statValue}>{stat.value}</Text>
                    <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>{stat.label}</Text>
                  </View>
                ))}
              </View>
            </LinearGradient>

            {topEntities.length > 0 && (
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
                  Top Entities
                </Text>
                <View style={styles.entityGrid}>
                  {topEntities.map((entity) => (
                    <View
                      key={entity.id}
                      style={[styles.entityBadge, { backgroundColor: "rgba(124,58,237,0.15)", borderColor: "rgba(124,58,237,0.3)" }]}
                    >
                      <Text style={[styles.entityBadgeName, { color: "#a78bfa" }]}>
                        {entity.name}
                      </Text>
                      <Text style={[styles.entityBadgeCount, { color: colors.mutedForeground }]}>
                        {entity.count}×
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
                {pages.length > 0 ? "Recently Absorbed" : ""}
              </Text>
            </View>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="planet-outline" size={56} color={colors.mutedForeground} />
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
              The Record Awaits
            </Text>
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
              Browse any webpage in the Browse tab. Every page you visit will be automatically absorbed into your Akashic Record.
            </Text>
            <Pressable
              style={[styles.startBtn, { backgroundColor: colors.primary }]}
              onPress={() => router.push("/(tabs)/browser")}
            >
              <Ionicons name="globe-outline" size={18} color="#fff" />
              <Text style={styles.startBtnText}>Start Browsing</Text>
            </Pressable>
          </View>
        }
        contentContainerStyle={{ paddingBottom: Platform.OS === "web" ? 34 + 84 : 80 }}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingBottom: 24, paddingHorizontal: 20 },
  headerContent: { marginBottom: 20 },
  headerTitle: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 6 },
  akashicLabel: {
    fontSize: 28,
    fontFamily: "Inter_700Bold",
    color: "#a78bfa",
    letterSpacing: 6,
  },
  recordLabel: {
    fontSize: 28,
    fontFamily: "Inter_700Bold",
    color: "#f59e0b",
    letterSpacing: 4,
  },
  absorbingBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(16,185,129,0.2)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 6,
    marginLeft: 4,
  },
  absorbingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#10b981",
  },
  absorbingText: { color: "#10b981", fontSize: 11, fontFamily: "Inter_600SemiBold" },
  headerSubtitle: { fontSize: 13, fontFamily: "Inter_400Regular" },
  statsRow: { flexDirection: "row", gap: 10 },
  statCard: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    gap: 4,
  },
  statValue: {
    fontSize: 20,
    fontFamily: "Inter_700Bold",
    color: "#ede8ff",
  },
  statLabel: { fontSize: 11, fontFamily: "Inter_500Medium" },
  section: { paddingHorizontal: 20, paddingTop: 20 },
  sectionTitle: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    marginBottom: 12,
  },
  entityGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  entityBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  entityBadgeName: { fontSize: 12, fontFamily: "Inter_500Medium" },
  entityBadgeCount: { fontSize: 11, fontFamily: "Inter_400Regular" },
  pageCard: {
    marginHorizontal: 20,
    marginBottom: 10,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    gap: 8,
  },
  pageCardHeader: { flexDirection: "row", alignItems: "center", gap: 10 },
  favicon: { width: 28, height: 28, borderRadius: 6 },
  faviconPlaceholder: {
    width: 28,
    height: 28,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  pageCardMeta: { flex: 1 },
  pageCardTitle: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  pageCardDomain: { fontSize: 11, fontFamily: "Inter_400Regular", marginTop: 1 },
  pageCardSummary: { fontSize: 12, fontFamily: "Inter_400Regular", lineHeight: 18 },
  entityRow: { flexDirection: "row", gap: 6, flexWrap: "wrap" },
  entityChip: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  entityChipText: { fontSize: 10, fontFamily: "Inter_500Medium" },
  entityMore: { fontSize: 10, fontFamily: "Inter_400Regular", alignSelf: "center" },
  emptyState: {
    alignItems: "center",
    paddingHorizontal: 40,
    paddingTop: 60,
    gap: 14,
  },
  emptyTitle: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
    textAlign: "center",
  },
  emptyText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    lineHeight: 22,
  },
  startBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    marginTop: 8,
  },
  startBtnText: {
    color: "#fff",
    fontFamily: "Inter_600SemiBold",
    fontSize: 15,
  },
});
