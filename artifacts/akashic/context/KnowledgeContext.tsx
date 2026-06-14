import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from "expo-haptics";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

import { extractEntities, generateSummary } from "@/lib/entityExtractor";
import { getFaviconUrl } from "@/lib/extractor";

export interface AbsorbedPage {
  id: string;
  url: string;
  title: string;
  content: string;
  summary: string;
  entities: string[];
  absorbedAt: string;
  wordCount: number;
  favicon: string;
}

export interface EntityRecord {
  id: string;
  name: string;
  count: number;
  pageIds: string[];
  firstSeen: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: AbsorbedPage[];
  timestamp: string;
}

export interface Bookmark {
  id: string;
  pageId: string;
  url: string;
  title: string;
  createdAt: string;
}

interface KnowledgeContextType {
  pages: AbsorbedPage[];
  entities: EntityRecord[];
  messages: ChatMessage[];
  bookmarks: Bookmark[];
  isAbsorbing: boolean;
  lastAbsorbed: AbsorbedPage | null;
  isLoaded: boolean;
  absorbPage: (url: string, title: string, content: string, wordCount: number) => Promise<void>;
  addMessage: (role: "user" | "assistant", content: string, sources?: AbsorbedPage[]) => void;
  toggleBookmark: (page: AbsorbedPage) => void;
  deletePage: (id: string) => Promise<void>;
  clearAll: () => Promise<void>;
  isBookmarked: (pageId: string) => boolean;
  stats: { totalPages: number; totalEntities: number; totalWords: number };
}

const KnowledgeContext = createContext<KnowledgeContextType | null>(null);

const PAGES_KEY = "akashic_pages_v2";
const ENTITIES_KEY = "akashic_entities_v2";
const MESSAGES_KEY = "akashic_messages_v2";
const BOOKMARKS_KEY = "akashic_bookmarks_v2";

export function KnowledgeProvider({ children }: { children: React.ReactNode }) {
  const [pages, setPages] = useState<AbsorbedPage[]>([]);
  const [entities, setEntities] = useState<EntityRecord[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [isAbsorbing, setIsAbsorbing] = useState(false);
  const [lastAbsorbed, setLastAbsorbed] = useState<AbsorbedPage | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  const absorptionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [p, e, m, b] = await Promise.all([
          AsyncStorage.getItem(PAGES_KEY),
          AsyncStorage.getItem(ENTITIES_KEY),
          AsyncStorage.getItem(MESSAGES_KEY),
          AsyncStorage.getItem(BOOKMARKS_KEY),
        ]);
        if (p) setPages(JSON.parse(p));
        if (e) setEntities(JSON.parse(e));
        if (m) setMessages(JSON.parse(m));
        if (b) setBookmarks(JSON.parse(b));
      } catch (_) {
      } finally {
        setIsLoaded(true);
      }
    };
    load();
  }, []);

  const mergeEntities = useCallback(
    (newEntityNames: string[], pageId: string, existing: EntityRecord[]): EntityRecord[] => {
      const updated = [...existing];
      for (const name of newEntityNames) {
        const idx = updated.findIndex(
          (e) => e.name.toLowerCase() === name.toLowerCase()
        );
        if (idx >= 0) {
          updated[idx] = {
            ...updated[idx],
            count: updated[idx].count + 1,
            pageIds: [...new Set([...updated[idx].pageIds, pageId])],
          };
        } else {
          updated.push({
            id: `entity_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
            name,
            count: 1,
            pageIds: [pageId],
            firstSeen: new Date().toISOString(),
          });
        }
      }
      return updated.sort((a, b) => b.count - a.count);
    },
    []
  );

  const absorbPage = useCallback(
    async (url: string, title: string, content: string, wordCount: number) => {
      if (!content || content.length < 80) return;
      if (!url.startsWith("http")) return;

      setPages((prev) => {
        if (prev.some((p) => p.url === url)) return prev;
        return prev;
      });

      setPages((prev) => {
        if (prev.some((p) => p.url === url)) return prev;

        const entityNames = extractEntities(content);
        const summary = generateSummary(content);
        const id = `page_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

        const page: AbsorbedPage = {
          id,
          url,
          title: title || new URL(url).hostname,
          content,
          summary,
          entities: entityNames,
          absorbedAt: new Date().toISOString(),
          wordCount,
          favicon: getFaviconUrl(url),
        };

        const updatedPages = [page, ...prev];
        AsyncStorage.setItem(PAGES_KEY, JSON.stringify(updatedPages)).catch(() => {});

        setEntities((prevEntities) => {
          const updatedEntities = mergeEntities(entityNames, id, prevEntities);
          AsyncStorage.setItem(ENTITIES_KEY, JSON.stringify(updatedEntities)).catch(() => {});
          return updatedEntities;
        });

        setIsAbsorbing(true);
        setLastAbsorbed(page);

        if (absorptionTimerRef.current) clearTimeout(absorptionTimerRef.current);
        absorptionTimerRef.current = setTimeout(() => {
          setIsAbsorbing(false);
        }, 3000);

        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});

        return updatedPages;
      });
    },
    [mergeEntities]
  );

  const addMessage = useCallback(
    (role: "user" | "assistant", content: string, sources?: AbsorbedPage[]) => {
      const msg: ChatMessage = {
        id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        role,
        content,
        sources,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => {
        const updated = [...prev, msg];
        AsyncStorage.setItem(MESSAGES_KEY, JSON.stringify(updated)).catch(() => {});
        return updated;
      });
    },
    []
  );

  const toggleBookmark = useCallback((page: AbsorbedPage) => {
    setBookmarks((prev) => {
      const exists = prev.find((b) => b.pageId === page.id);
      let updated: Bookmark[];
      if (exists) {
        updated = prev.filter((b) => b.pageId !== page.id);
      } else {
        updated = [
          ...prev,
          {
            id: `bm_${Date.now()}`,
            pageId: page.id,
            url: page.url,
            title: page.title,
            createdAt: new Date().toISOString(),
          },
        ];
      }
      AsyncStorage.setItem(BOOKMARKS_KEY, JSON.stringify(updated)).catch(() => {});
      return updated;
    });
  }, []);

  const deletePage = useCallback(
    async (id: string) => {
      const updatedPages = pages.filter((p) => p.id !== id);
      setPages(updatedPages);
      await AsyncStorage.setItem(PAGES_KEY, JSON.stringify(updatedPages));

      const updatedEntities = entities
        .map((e) => ({
          ...e,
          pageIds: e.pageIds.filter((pid) => pid !== id),
          count: e.pageIds.filter((pid) => pid !== id).length,
        }))
        .filter((e) => e.count > 0);
      setEntities(updatedEntities);
      await AsyncStorage.setItem(ENTITIES_KEY, JSON.stringify(updatedEntities));
    },
    [pages, entities]
  );

  const clearAll = useCallback(async () => {
    setPages([]);
    setEntities([]);
    setMessages([]);
    setBookmarks([]);
    setLastAbsorbed(null);
    await Promise.all([
      AsyncStorage.removeItem(PAGES_KEY),
      AsyncStorage.removeItem(ENTITIES_KEY),
      AsyncStorage.removeItem(MESSAGES_KEY),
      AsyncStorage.removeItem(BOOKMARKS_KEY),
    ]);
  }, []);

  const isBookmarked = useCallback(
    (pageId: string) => bookmarks.some((b) => b.pageId === pageId),
    [bookmarks]
  );

  const stats = {
    totalPages: pages.length,
    totalEntities: entities.length,
    totalWords: pages.reduce((sum, p) => sum + p.wordCount, 0),
  };

  return (
    <KnowledgeContext.Provider
      value={{
        pages,
        entities,
        messages,
        bookmarks,
        isAbsorbing,
        lastAbsorbed,
        isLoaded,
        absorbPage,
        addMessage,
        toggleBookmark,
        deletePage,
        clearAll,
        isBookmarked,
        stats,
      }}
    >
      {children}
    </KnowledgeContext.Provider>
  );
}

export function useKnowledge() {
  const ctx = useContext(KnowledgeContext);
  if (!ctx) throw new Error("useKnowledge must be used within KnowledgeProvider");
  return ctx;
}
