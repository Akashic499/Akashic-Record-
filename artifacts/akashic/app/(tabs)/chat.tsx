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

import { AkashicSymbol } from "@/components/AkashicSymbol";
import { StarField } from "@/components/StarField";
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
    await new Promise((r) => setTimeout(r, 600));
    const { answer, sources } = generateAnswer(question, pages);
    addMessage("assistant", answer, sources);
    setIsThinking(false);
  }, [input, pages, addMessage]);

  const renderMessage = ({ item }: { item: ChatMessage }) => {
    const isUser = item.role === "user";
    return (
      <View style={[styles.msgWrapper, isUser ? styles.msgWrapperUser : styles.msgWrapperOracle]}>
        {!isUser && (
          <View style={styles.oracleAvatar}>
            <Text style={styles.oracleAvatarGlyph}>✦</Text>
          </View>
        )}
        <View style={styles.msgContent}>
          {!isUser && (
            <Text style={styles.oracleLabel}>THE ORACLE SPEAKS</Text>
          )}
          <View style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleOracle]}>
            <Text style={[styles.bubbleText, isUser ? styles.bubbleTextUser : styles.bubbleTextOracle]}>
              {item.content}
            </Text>
          </View>
          {!isUser && item.sources && item.sources.length > 0 && (
            <View style={styles.sources}>
              <Text style={styles.sourcesLabel}>CONSULTED TOMES</Text>
              <View style={styles.sourceChips}>
                {item.sources.map((s) => (
                  <View key={s.id} style={styles.sourceChip}>
                    <Text style={styles.sourceChipGlyph}>◈</Text>
                    <Text style={styles.sourceChipText} numberOfLines={1}>{getDomain(s.url)}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>
        {isUser && (
          <View style={styles.userAvatar}>
            <Text style={styles.userAvatarGlyph}>○</Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior="padding"
      keyboardVerticalOffset={0}
    >
      <StarField />

      {/* Header */}
      <View style={[styles.header, { paddingTop: topPad + 14 }]}>
        <AkashicSymbol size={40} color="#c9a840" />
        <View style={styles.headerText}>
          <Text style={styles.headerTitle}>THE ORACLE</Text>
          <Text style={styles.headerSub}>
            {pages.length > 0
              ? `${pages.length} TOME${pages.length !== 1 ? "S" : ""} IN THE RECORD`
              : "INSCRIBE TOMES TO AWAKEN THE ORACLE"}
          </Text>
        </View>
      </View>

      {/* Messages */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
        contentContainerStyle={[styles.messagesList, { paddingBottom: 16 }]}
        ListEmptyComponent={
          <View style={styles.empty}>
            <AkashicSymbol size={70} color="#c9a840" />
            <Text style={styles.emptyTitle}>CONSULT THE ORACLE</Text>
            <View style={styles.emptyDivider}>
              <View style={styles.emptyDividerLine} />
              <Text style={styles.emptyDividerGlyph}>✦</Text>
              <View style={styles.emptyDividerLine} />
            </View>
            <Text style={styles.emptyText}>
              {pages.length > 0
                ? `The Oracle has absorbed ${pages.length} tome${pages.length !== 1 ? "s" : ""} of knowledge. Speak your query and receive wisdom from the Record.`
                : "The Oracle is silent. Inscribe tomes by browsing the mortal web, then the Oracle shall speak."}
            </Text>
            {pages.length > 0 && (
              <View style={styles.suggestions}>
                {[
                  "What wisdom have you gathered?",
                  "Reveal the dominant sigils",
                  "Summarize the inscribed knowledge",
                ].map((s) => (
                  <Pressable
                    key={s}
                    style={styles.suggestion}
                    onPress={() => setInput(s)}
                  >
                    <Text style={styles.suggestionGlyph}>◈</Text>
                    <Text style={styles.suggestionText}>{s}</Text>
                  </Pressable>
                ))}
              </View>
            )}
          </View>
        }
        onContentSizeChange={() => {
          if (messages.length > 0) flatListRef.current?.scrollToEnd({ animated: true });
        }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      />

      {/* Thinking indicator */}
      {isThinking && (
        <View style={styles.thinkingBar}>
          <Text style={styles.thinkingText}>THE ORACLE CONSULTS THE RECORD</Text>
          <View style={styles.thinkingDots}>
            {["·", "·", "·"].map((d, i) => (
              <Text key={i} style={[styles.thinkingDot, { opacity: 0.4 + i * 0.25 }]}>{d}</Text>
            ))}
          </View>
        </View>
      )}

      {/* Input */}
      <View style={[styles.inputBar, { paddingBottom: bottomInset + 10 }]}>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder="Speak your query to the Oracle…"
            placeholderTextColor="#4a3c60"
            multiline
            maxLength={500}
            returnKeyType="send"
            onSubmitEditing={handleSend}
          />
        </View>
        <Pressable
          style={[styles.sendBtn, !input.trim() && styles.sendBtnDisabled]}
          onPress={handleSend}
          disabled={!input.trim() || isThinking}
        >
          <Text style={[styles.sendBtnText, !input.trim() && styles.sendBtnTextDisabled]}>✦</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const GOLD = "#c9a840";
const BORDER = "rgba(201,168,64,0.22)";

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingHorizontal: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
    backgroundColor: "rgba(8,6,32,0.95)",
  },
  headerText: { gap: 2 },
  headerTitle: {
    fontFamily: "Cinzel_700Bold",
    fontSize: 16,
    letterSpacing: 5,
    color: GOLD,
  },
  headerSub: {
    fontFamily: "Cinzel_400Regular",
    fontSize: 8,
    letterSpacing: 2,
    color: "rgba(201,168,64,0.4)",
  },
  messagesList: { padding: 16, gap: 16, flexGrow: 1 },
  msgWrapper: { flexDirection: "row", gap: 10, maxWidth: "92%" },
  msgWrapperUser: { alignSelf: "flex-end", flexDirection: "row-reverse" },
  msgWrapperOracle: { alignSelf: "flex-start" },
  oracleAvatar: {
    width: 30,
    height: 30,
    borderWidth: 1,
    borderColor: BORDER,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
    flexShrink: 0,
  },
  oracleAvatarGlyph: { color: GOLD, fontSize: 12 },
  userAvatar: {
    width: 30,
    height: 30,
    borderWidth: 1,
    borderColor: "rgba(201,168,64,0.15)",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  userAvatarGlyph: { color: "rgba(201,168,64,0.5)", fontSize: 12 },
  msgContent: { flex: 1, gap: 6 },
  oracleLabel: {
    fontFamily: "Cinzel_400Regular",
    fontSize: 7,
    letterSpacing: 2.5,
    color: "rgba(201,168,64,0.4)",
  },
  bubble: {
    padding: 12,
    borderWidth: 1,
  },
  bubbleOracle: {
    backgroundColor: "rgba(13,9,39,0.9)",
    borderColor: BORDER,
  },
  bubbleUser: {
    backgroundColor: "rgba(201,168,64,0.1)",
    borderColor: "rgba(201,168,64,0.3)",
  },
  bubbleText: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    lineHeight: 21,
  },
  bubbleTextOracle: { color: "#e8d5a3", fontStyle: "italic" },
  bubbleTextUser: { color: "#e8d5a3" },
  sources: { gap: 5, paddingLeft: 2 },
  sourcesLabel: {
    fontFamily: "Cinzel_400Regular",
    fontSize: 7,
    letterSpacing: 2,
    color: "rgba(201,168,64,0.4)",
  },
  sourceChips: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  sourceChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: BORDER,
  },
  sourceChipGlyph: { color: GOLD, fontSize: 8, opacity: 0.7 },
  sourceChipText: { fontFamily: "Inter_400Regular", fontSize: 9, color: GOLD, opacity: 0.8 },
  empty: {
    flex: 1,
    alignItems: "center",
    paddingTop: 40,
    paddingHorizontal: 32,
    gap: 14,
  },
  emptyTitle: {
    fontFamily: "Cinzel_700Bold",
    fontSize: 14,
    letterSpacing: 5,
    color: GOLD,
    opacity: 0.7,
  },
  emptyDivider: { flexDirection: "row", alignItems: "center", gap: 10, width: "60%" },
  emptyDividerLine: { flex: 1, height: 1, backgroundColor: BORDER },
  emptyDividerGlyph: { color: GOLD, fontSize: 10, opacity: 0.5 },
  emptyText: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    color: "#7a6850",
    textAlign: "center",
    lineHeight: 21,
    fontStyle: "italic",
  },
  suggestions: { width: "100%", gap: 8, marginTop: 6 },
  suggestion: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: BORDER,
    backgroundColor: "rgba(13,9,39,0.6)",
  },
  suggestionGlyph: { color: GOLD, fontSize: 10, opacity: 0.6 },
  suggestionText: { fontFamily: "Inter_400Regular", fontSize: 12, color: "#e8d5a3", fontStyle: "italic", flex: 1 },
  thinkingBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: BORDER,
    backgroundColor: "rgba(8,6,32,0.9)",
  },
  thinkingText: {
    fontFamily: "Cinzel_400Regular",
    fontSize: 7,
    letterSpacing: 2.5,
    color: "rgba(201,168,64,0.5)",
  },
  thinkingDots: { flexDirection: "row" },
  thinkingDot: { color: GOLD, fontSize: 18 },
  inputBar: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: BORDER,
    backgroundColor: "rgba(8,6,32,0.95)",
  },
  inputWrapper: {
    flex: 1,
    borderWidth: 1,
    borderColor: BORDER,
    paddingHorizontal: 14,
    paddingVertical: 10,
    maxHeight: 100,
    backgroundColor: "rgba(13,9,39,0.6)",
  },
  input: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    color: "#e8d5a3",
    lineHeight: 21,
    fontStyle: "italic",
  },
  sendBtn: {
    width: 42,
    height: 42,
    borderWidth: 1,
    borderColor: GOLD,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(201,168,64,0.1)",
  },
  sendBtnDisabled: { borderColor: "rgba(201,168,64,0.2)", backgroundColor: "transparent" },
  sendBtnText: { color: GOLD, fontSize: 16 },
  sendBtnTextDisabled: { color: "rgba(201,168,64,0.25)" },
});
