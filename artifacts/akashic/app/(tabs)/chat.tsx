import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useCallback, useRef, useState } from "react";
import {
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useKnowledge, type ChatMessage } from "@/context/KnowledgeContext";
import { useColors } from "@/hooks/useColors";
import { getDomain } from "@/lib/extractor";
import { generateAnswer } from "@/lib/search";

export default function ChatScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { pages, messages, addMessage } = useKnowledge();

  const [input, setInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomInset = Platform.OS === "web" ? 34 : insets.bottom;

  const handleSend = useCallback(async () => {
    const question = input.trim();
    if (!question) return;

    setInput("");
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    addMessage("user", question);

    setIsThinking(true);
    await new Promise((r) => setTimeout(r, 400));

    const { answer, sources } = generateAnswer(question, pages);
    addMessage("assistant", answer, sources);
    setIsThinking(false);
  }, [input, pages, addMessage]);

  const renderMessage = ({ item }: { item: ChatMessage }) => {
    const isUser = item.role === "user";

    return (
      <View
        style={[
          styles.messageWrapper,
          isUser ? styles.messageWrapperUser : styles.messageWrapperAssistant,
        ]}
      >
        {!isUser && (
          <View
            style={[
              styles.avatar,
              { backgroundColor: "rgba(124,58,237,0.2)", borderColor: "rgba(124,58,237,0.4)" },
            ]}
          >
            <Text style={styles.avatarIcon}>✦</Text>
          </View>
        )}
        <View style={styles.messageContent}>
          <View
            style={[
              styles.bubble,
              isUser
                ? { backgroundColor: colors.primary }
                : { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border },
            ]}
          >
            <Text
              style={[
                styles.bubbleText,
                { color: isUser ? "#ffffff" : colors.foreground },
              ]}
            >
              {item.content}
            </Text>
          </View>
          {!isUser && item.sources && item.sources.length > 0 && (
            <View style={styles.sources}>
              <Text style={[styles.sourcesLabel, { color: colors.mutedForeground }]}>
                Sources:
              </Text>
              <View style={styles.sourceChips}>
                {item.sources.map((source) => (
                  <View
                    key={source.id}
                    style={[
                      styles.sourceChip,
                      {
                        backgroundColor: "rgba(124,58,237,0.1)",
                        borderColor: "rgba(124,58,237,0.3)",
                      },
                    ]}
                  >
                    <Ionicons name="link-outline" size={10} color="#a78bfa" />
                    <Text style={[styles.sourceChipText, { color: "#a78bfa" }]} numberOfLines={1}>
                      {getDomain(source.url)}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior="padding"
      keyboardVerticalOffset={0}
    >
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
        <View
          style={[
            styles.headerIcon,
            { backgroundColor: "rgba(124,58,237,0.2)", borderColor: "rgba(124,58,237,0.4)" },
          ]}
        >
          <Text style={styles.headerIconText}>✦</Text>
        </View>
        <View>
          <Text style={[styles.headerTitle, { color: colors.foreground }]}>Ask Akashic</Text>
          <Text style={[styles.headerSub, { color: colors.mutedForeground }]}>
            {pages.length > 0
              ? `${pages.length} pages in memory`
              : "Absorb pages to unlock knowledge"}
          </Text>
        </View>
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
        contentContainerStyle={[
          styles.messagesList,
          { paddingBottom: 16 },
        ]}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyGlyph}>✦</Text>
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
              Ask Me Anything
            </Text>
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
              {pages.length > 0
                ? `I have ${pages.length} page${pages.length !== 1 ? "s" : ""} of knowledge ready. Ask me about anything you've browsed.`
                : "Browse websites first, then ask questions about what you've read. Your knowledge grows with every page you visit."}
            </Text>

            {pages.length > 0 && (
              <View style={styles.suggestions}>
                {[
                  "Summarize what I've been reading",
                  "What topics have I explored?",
                  "Tell me about the main entities",
                ].map((s) => (
                  <Pressable
                    key={s}
                    style={[
                      styles.suggestion,
                      {
                        backgroundColor: colors.card,
                        borderColor: colors.border,
                      },
                    ]}
                    onPress={() => {
                      setInput(s);
                    }}
                  >
                    <Text style={[styles.suggestionText, { color: colors.foreground }]}>
                      {s}
                    </Text>
                    <Ionicons name="arrow-up-outline" size={14} color={colors.mutedForeground} />
                  </Pressable>
                ))}
              </View>
            )}
          </View>
        }
        onContentSizeChange={() => {
          if (messages.length > 0) {
            flatListRef.current?.scrollToEnd({ animated: true });
          }
        }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      />

      {isThinking && (
        <View style={[styles.thinkingBar, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
          <View style={styles.thinkingDots}>
            {[0, 1, 2].map((i) => (
              <View
                key={i}
                style={[styles.dot, { backgroundColor: colors.primary, opacity: 0.4 + i * 0.2 }]}
              />
            ))}
          </View>
          <Text style={[styles.thinkingText, { color: colors.mutedForeground }]}>
            Searching knowledge…
          </Text>
        </View>
      )}

      <View
        style={[
          styles.inputBar,
          {
            backgroundColor: colors.card,
            borderTopColor: colors.border,
            paddingBottom: bottomInset + 8,
          },
        ]}
      >
        <View
          style={[
            styles.inputWrapper,
            { backgroundColor: colors.secondary, borderColor: colors.border },
          ]}
        >
          <TextInput
            style={[styles.input, { color: colors.foreground }]}
            value={input}
            onChangeText={setInput}
            placeholder="Ask a question…"
            placeholderTextColor={colors.mutedForeground}
            multiline
            maxLength={500}
            returnKeyType="send"
            onSubmitEditing={handleSend}
          />
        </View>
        <Pressable
          style={({ pressed }) => [
            styles.sendBtn,
            {
              backgroundColor: input.trim() ? colors.primary : colors.secondary,
              opacity: pressed ? 0.8 : 1,
            },
          ]}
          onPress={handleSend}
          disabled={!input.trim() || isThinking}
        >
          <Ionicons
            name="arrow-up"
            size={20}
            color={input.trim() ? "#fff" : colors.mutedForeground}
          />
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  headerIconText: { fontSize: 18, color: "#a78bfa" },
  headerTitle: { fontSize: 17, fontFamily: "Inter_700Bold" },
  headerSub: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 1 },
  messagesList: { padding: 16, gap: 12, flexGrow: 1 },
  messageWrapper: { flexDirection: "row", gap: 8, maxWidth: "90%" },
  messageWrapperUser: { alignSelf: "flex-end", flexDirection: "row-reverse" },
  messageWrapperAssistant: { alignSelf: "flex-start" },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    marginTop: 4,
  },
  avatarIcon: { fontSize: 14, color: "#a78bfa" },
  messageContent: { flex: 1, gap: 6 },
  bubble: { padding: 12, borderRadius: 16 },
  bubbleText: { fontSize: 14, fontFamily: "Inter_400Regular", lineHeight: 21 },
  sources: { gap: 4 },
  sourcesLabel: { fontSize: 10, fontFamily: "Inter_500Medium" },
  sourceChips: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  sourceChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
  },
  sourceChipText: { fontSize: 10, fontFamily: "Inter_500Medium" },
  empty: {
    flex: 1,
    alignItems: "center",
    paddingTop: 60,
    paddingHorizontal: 32,
    gap: 12,
  },
  emptyGlyph: { fontSize: 40, color: "#7c3aed" },
  emptyTitle: { fontSize: 20, fontFamily: "Inter_700Bold", textAlign: "center" },
  emptyText: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    lineHeight: 21,
  },
  suggestions: { width: "100%", gap: 8, marginTop: 8 },
  suggestion: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  suggestionText: { fontSize: 13, fontFamily: "Inter_400Regular", flex: 1 },
  thinkingBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderTopWidth: 1,
  },
  thinkingDots: { flexDirection: "row", gap: 4 },
  dot: { width: 6, height: 6, borderRadius: 3 },
  thinkingText: { fontSize: 12, fontFamily: "Inter_400Regular" },
  inputBar: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 10,
    borderTopWidth: 1,
  },
  inputWrapper: {
    flex: 1,
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 10,
    maxHeight: 120,
  },
  input: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    lineHeight: 21,
  },
  sendBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
  },
});
