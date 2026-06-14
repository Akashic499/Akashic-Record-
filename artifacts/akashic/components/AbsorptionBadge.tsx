import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";

import type { AbsorbedPage } from "@/context/KnowledgeContext";
import { getDomain } from "@/lib/extractor";

interface Props {
  page: AbsorbedPage | null;
  visible: boolean;
}

export function AbsorptionBadge({ page, visible }: Props) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(30)).current;
  const scale = useRef(new Animated.Value(0.92)).current;

  useEffect(() => {
    if (visible && page) {
      Animated.parallel([
        Animated.spring(opacity, { toValue: 1, useNativeDriver: true, tension: 80, friction: 10 }),
        Animated.spring(translateY, { toValue: 0, useNativeDriver: true, tension: 80, friction: 10 }),
        Animated.spring(scale, { toValue: 1, useNativeDriver: true, tension: 80, friction: 10 }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(opacity, { toValue: 0, duration: 500, useNativeDriver: true }),
        Animated.timing(translateY, { toValue: 30, duration: 500, useNativeDriver: true }),
        Animated.timing(scale, { toValue: 0.92, duration: 500, useNativeDriver: true }),
      ]).start();
    }
  }, [visible, page, opacity, translateY, scale]);

  if (!page) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        { opacity, transform: [{ translateY }, { scale }] },
      ]}
      pointerEvents="none"
    >
      <View style={styles.badge}>
        <Text style={styles.glyph}>✦</Text>
        <View>
          <Text style={styles.title}>Inscribed to the Record</Text>
          <Text style={styles.subtitle}>
            {getDomain(page.url)} · {page.entities.length} sigils discovered
          </Text>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 108,
    left: 20,
    right: 20,
    alignItems: "center",
    zIndex: 999,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: "#0d0927",
    borderWidth: 1,
    borderColor: "rgba(201,168,64,0.6)",
    borderRadius: 6,
    shadowColor: "#c9a840",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
  },
  glyph: {
    fontSize: 18,
    color: "#c9a840",
  },
  title: {
    fontFamily: "Cinzel_700Bold",
    fontSize: 12,
    color: "#c9a840",
    letterSpacing: 1.5,
  },
  subtitle: {
    fontFamily: "Inter_400Regular",
    fontSize: 11,
    color: "#7a6850",
    marginTop: 1,
  },
});
