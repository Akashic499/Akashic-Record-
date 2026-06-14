import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useRef, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import WebView from "react-native-webview";
import type { WebViewMessageEvent, WebViewNavigation } from "react-native-webview";

import { AbsorptionBadge } from "@/components/AbsorptionBadge";
import { useKnowledge } from "@/context/KnowledgeContext";
import { useColors } from "@/hooks/useColors";
import { EXTRACTION_SCRIPT, getDomain, normalizeUrl, shouldExtract } from "@/lib/extractor";

const HOME_HTML = `
<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
  * { box-sizing: border-box; }
  body {
    background: #05030e;
    color: #e8d5a3;
    font-family: Georgia, serif;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    margin: 0;
    padding: 40px 24px;
    text-align: center;
  }
  .symbol { font-size: 48px; color: #c9a840; margin-bottom: 16px; line-height: 1; }
  h1 {
    font-size: 22px;
    letter-spacing: 8px;
    color: #c9a840;
    margin: 0 0 2px;
    font-weight: 400;
  }
  h2 {
    font-size: 12px;
    letter-spacing: 5px;
    color: rgba(201,168,64,0.5);
    margin: 0 0 16px;
    font-weight: 400;
  }
  hr { border: none; border-top: 1px solid rgba(201,168,64,0.2); width: 120px; margin: 14px auto; }
  p { color: #7a6850; font-size: 14px; line-height: 1.7; max-width: 300px; font-style: italic; }
  .grid { margin-top: 28px; display: grid; grid-template-columns: 1fr 1fr; gap: 10px; width: 100%; max-width: 340px; }
  .chip {
    border: 1px solid rgba(201,168,64,0.25);
    color: #c9a840;
    padding: 10px 12px;
    font-size: 13px;
    cursor: pointer;
    font-family: Georgia, serif;
    background: rgba(201,168,64,0.04);
    letter-spacing: 0.5px;
  }
  .chip:hover { background: rgba(201,168,64,0.1); }
</style>
</head>
<body>
  <div class="symbol">✦</div>
  <h1>ASTRAL PORTAL</h1>
  <h2>NAVIGATE THE MORTAL WEB</h2>
  <hr>
  <p>Every page you visit will be inscribed into the Akashic Record, preserving its knowledge for eternity.</p>
  <div class="grid">
    <div class="chip">wikipedia.org</div>
    <div class="chip">bbc.com/news</div>
    <div class="chip">arxiv.org</div>
    <div class="chip">britannica.com</div>
  </div>
</body>
</html>
`;

export default function BrowserScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { absorbPage, isAbsorbing, lastAbsorbed } = useKnowledge();

  const [url, setUrl] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(false);

  const webViewRef = useRef<WebView>(null);
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const navigate = useCallback((target: string) => {
    const normalized = normalizeUrl(target);
    if (!normalized) return;
    setUrl(normalized);
    setInputValue(target);
  }, []);

  const handleNavigationChange = useCallback((nav: WebViewNavigation) => {
    setCanGoBack(nav.canGoBack);
    setCanGoForward(nav.canGoForward);
    const displayUrl = nav.url || "";
    if (displayUrl && !displayUrl.startsWith("about:") && !displayUrl.startsWith("data:")) {
      setInputValue(displayUrl);
    }
  }, []);

  const handleLoadEnd = useCallback(() => {
    setIsLoading(false);
    if (webViewRef.current && url && shouldExtract(url)) {
      setTimeout(() => {
        webViewRef.current?.injectJavaScript(EXTRACTION_SCRIPT);
      }, 600);
    }
  }, [url]);

  const handleMessage = useCallback(
    (event: WebViewMessageEvent) => {
      try {
        const data = JSON.parse(event.nativeEvent.data);
        if (data.type === "PAGE_CONTENT" && data.content && data.content.length > 80) {
          absorbPage(data.url, data.title, data.content, data.wordCount);
        }
      } catch (_) {}
    },
    [absorbPage]
  );

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior="padding"
      keyboardVerticalOffset={0}
    >
      {/* Toolbar */}
      <View style={[styles.toolbar, { paddingTop: topPad + 10 }]}>
        <View style={styles.toolbarTop}>
          <Text style={styles.toolbarTitle}>ASTRAL PORTAL</Text>
          {isAbsorbing && (
            <View style={styles.absorbPill}>
              <Text style={styles.absorbPillDot}>◉</Text>
              <Text style={styles.absorbPillText}>INSCRIBING</Text>
            </View>
          )}
        </View>

        <View style={styles.navRow}>
          <Pressable
            onPress={() => webViewRef.current?.goBack()}
            disabled={!canGoBack}
            style={styles.navBtn}
          >
            <Ionicons
              name="chevron-back"
              size={18}
              color={canGoBack ? colors.primary : "#2a1e6a"}
            />
          </Pressable>
          <Pressable
            onPress={() => webViewRef.current?.goForward()}
            disabled={!canGoForward}
            style={styles.navBtn}
          >
            <Ionicons
              name="chevron-forward"
              size={18}
              color={canGoForward ? colors.primary : "#2a1e6a"}
            />
          </Pressable>

          <View style={styles.urlBar}>
            {isLoading ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : (
              <Text style={styles.urlBarGlyph}>{url ? "◈" : "✦"}</Text>
            )}
            <TextInput
              style={styles.urlInput}
              value={inputValue}
              onChangeText={setInputValue}
              onSubmitEditing={() => navigate(inputValue)}
              placeholder="Navigate the Akashic Field…"
              placeholderTextColor="#4a3c60"
              keyboardType="url"
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="go"
              selectTextOnFocus
            />
            {inputValue.length > 0 && (
              <Pressable onPress={() => setInputValue("")}>
                <Ionicons name="close" size={14} color="#4a3c60" />
              </Pressable>
            )}
          </View>

          <Pressable
            onPress={() => webViewRef.current?.reload()}
            style={styles.navBtn}
            disabled={!url}
          >
            <Ionicons
              name="refresh"
              size={16}
              color={url ? colors.primary : "#2a1e6a"}
            />
          </Pressable>
        </View>
      </View>

      {/* WebView */}
      {!url ? (
        <WebView
          source={{ html: HOME_HTML }}
          style={styles.webview}
          scrollEnabled={false}
        />
      ) : (
        <WebView
          ref={webViewRef}
          source={{ uri: url }}
          style={styles.webview}
          onNavigationStateChange={handleNavigationChange}
          onLoadStart={() => setIsLoading(true)}
          onLoadEnd={handleLoadEnd}
          onMessage={handleMessage}
          javaScriptEnabled
          domStorageEnabled
          allowsBackForwardNavigationGestures
          allowsInlineMediaPlayback
          onError={() => setIsLoading(false)}
        />
      )}

      <AbsorptionBadge page={lastAbsorbed} visible={isAbsorbing} />
    </KeyboardAvoidingView>
  );
}

const GOLD = "#c9a840";
const BORDER = "rgba(201,168,64,0.2)";

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#05030e" },
  toolbar: {
    backgroundColor: "#080620",
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 10,
  },
  toolbarTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  toolbarTitle: {
    fontFamily: "Cinzel_700Bold",
    fontSize: 9,
    letterSpacing: 3,
    color: GOLD,
    opacity: 0.6,
  },
  absorbPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: "rgba(46,168,125,0.4)",
  },
  absorbPillDot: { color: "#2ea87d", fontSize: 8 },
  absorbPillText: {
    fontFamily: "Cinzel_400Regular",
    fontSize: 8,
    letterSpacing: 2,
    color: "#2ea87d",
  },
  navRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  navBtn: { padding: 6 },
  urlBar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: BORDER,
    paddingHorizontal: 10,
    height: 36,
    gap: 8,
    backgroundColor: "rgba(13,9,39,0.6)",
  },
  urlBarGlyph: { color: GOLD, fontSize: 12, opacity: 0.7 },
  urlInput: {
    flex: 1,
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: "#e8d5a3",
    height: "100%",
  },
  webview: { flex: 1 },
});
