import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
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

import { useKnowledge } from "@/context/KnowledgeContext";
import { useColors } from "@/hooks/useColors";
import { EXTRACTION_SCRIPT, getDomain, normalizeUrl, shouldExtract } from "@/lib/extractor";
import { AbsorptionBadge } from "@/components/AbsorptionBadge";

const HOME_HTML = `
<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
  body { background: #060714; color: #ede8ff; font-family: -apple-system, sans-serif;
         display: flex; flex-direction: column; align-items: center; justify-content: center;
         height: 100vh; margin: 0; padding: 20px; box-sizing: border-box; text-align: center; }
  h1 { font-size: 28px; letter-spacing: 4px; color: #a78bfa; margin: 0 0 4px; }
  h2 { font-size: 20px; letter-spacing: 3px; color: #f59e0b; margin: 0 0 20px; font-weight: 700; }
  p { color: #8884a8; font-size: 15px; line-height: 1.6; max-width: 320px; }
  .suggestions { margin-top: 24px; display: flex; flex-direction: column; gap: 10px; }
  .chip { background: rgba(124,58,237,0.15); border: 1px solid rgba(124,58,237,0.3);
          color: #a78bfa; padding: 10px 20px; border-radius: 20px; font-size: 14px; cursor: pointer; }
</style>
</head>
<body>
  <h1>AKASHIC</h1>
  <h2>RECORD</h2>
  <p>Browse any website and its knowledge will be automatically absorbed into your record.</p>
  <div class="suggestions">
    <div class="chip">wikipedia.org</div>
    <div class="chip">bbc.com/news</div>
    <div class="chip">arxiv.org</div>
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
  const [currentTitle, setCurrentTitle] = useState("");

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
    if (nav.title) {
      setCurrentTitle(nav.title);
    }
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
      }, 500);
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

  const handleSubmitUrl = useCallback(() => {
    navigate(inputValue);
  }, [inputValue, navigate]);

  const isEmpty = !url;

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior="padding"
      keyboardVerticalOffset={0}
    >
      <View
        style={[
          styles.toolbar,
          {
            paddingTop: topPad + 8,
            backgroundColor: colors.card,
            borderBottomColor: colors.border,
          },
        ]}
      >
        <View style={styles.navButtons}>
          <Pressable
            onPress={() => webViewRef.current?.goBack()}
            disabled={!canGoBack}
            style={styles.navBtn}
          >
            <Ionicons
              name="chevron-back"
              size={20}
              color={canGoBack ? colors.foreground : colors.mutedForeground}
            />
          </Pressable>
          <Pressable
            onPress={() => webViewRef.current?.goForward()}
            disabled={!canGoForward}
            style={styles.navBtn}
          >
            <Ionicons
              name="chevron-forward"
              size={20}
              color={canGoForward ? colors.foreground : colors.mutedForeground}
            />
          </Pressable>
        </View>

        <View style={[styles.urlBar, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
          {isLoading ? (
            <ActivityIndicator size="small" color={colors.primary} style={styles.loadingIcon} />
          ) : (
            <Ionicons
              name={url ? "globe-outline" : "search-outline"}
              size={15}
              color={colors.mutedForeground}
              style={styles.urlIcon}
            />
          )}
          <TextInput
            style={[styles.urlInput, { color: colors.foreground }]}
            value={inputValue}
            onChangeText={setInputValue}
            onSubmitEditing={handleSubmitUrl}
            placeholder="Search or enter URL"
            placeholderTextColor={colors.mutedForeground}
            keyboardType="url"
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="go"
            selectTextOnFocus
          />
          {inputValue.length > 0 && (
            <Pressable onPress={() => setInputValue("")}>
              <Ionicons name="close-circle" size={16} color={colors.mutedForeground} />
            </Pressable>
          )}
        </View>

        <Pressable
          onPress={() => webViewRef.current?.reload()}
          style={styles.navBtn}
          disabled={!url}
        >
          <Ionicons
            name="refresh-outline"
            size={20}
            color={url ? colors.foreground : colors.mutedForeground}
          />
        </Pressable>
      </View>

      {isEmpty ? (
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
          mediaPlaybackRequiresUserAction={false}
          onError={() => setIsLoading(false)}
        />
      )}

      <AbsorptionBadge page={lastAbsorbed} visible={isAbsorbing} />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  toolbar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingBottom: 12,
    gap: 8,
    borderBottomWidth: 1,
  },
  navButtons: { flexDirection: "row", gap: 4 },
  navBtn: { padding: 6 },
  urlBar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 10,
    height: 38,
    gap: 6,
  },
  urlIcon: {},
  loadingIcon: { marginRight: 2 },
  urlInput: {
    flex: 1,
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    height: "100%",
  },
  webview: { flex: 1 },
});
