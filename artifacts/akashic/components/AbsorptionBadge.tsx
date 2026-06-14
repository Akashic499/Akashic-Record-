import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";

import { useColors } from "@/hooks/useColors";
import type { AbsorbedPage } from "@/context/KnowledgeContext";
import { getDomain } from "@/lib/extractor";

interface Props {
  page: AbsorbedPage | null;
  visible: boolean;
}

export function AbsorptionBadge({ page, visible }: Props) {
  const colors = useColors();
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    if (visible && page) {
      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.timing(translateY, { toValue: 0, duration: 300, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(opacity, { toValue: 0, duration: 400, useNativeDriver: true }),
        Animated.timing(translateY, { toValue: 20, duration: 400, useNativeDriver: true }),
      ]).start();
    }
  }, [visible, page, opacity, translateY]);

  if (!page) return null;

  return (
    <Animated.View
      style={[styles.container, { opacity, transform: [{ translateY }] }]}
    >
      <View style={[styles.badge, { backgroundColor: "#10b981" }]}>
        <View style={styles.pulseOuter} />
        <Text style={styles.dot}>●</Text>
        <Text style={styles.text}>Absorbed: {getDomain(page.url)}</Text>
        <Text style={styles.count}>{page.entities.length} entities</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 100,
    left: 16,
    right: 16,
    alignItems: "center",
    zIndex: 999,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
    gap: 8,
    shadowColor: "#10b981",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  pulseOuter: {
    position: "absolute",
    width: "100%",
    height: "100%",
    borderRadius: 24,
    backgroundColor: "#10b981",
    opacity: 0.3,
  },
  dot: {
    color: "#ffffff",
    fontSize: 8,
  },
  text: {
    color: "#ffffff",
    fontWeight: "700",
    fontSize: 13,
    flex: 1,
  },
  count: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 11,
  },
});
