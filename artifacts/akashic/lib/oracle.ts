import type { AbsorbedPage, ChatMessage } from "@/context/KnowledgeContext";
import { searchKnowledge } from "@/lib/search";

const API_BASE = process.env["EXPO_PUBLIC_API_URL"] ?? "";

export interface OracleResponse {
  answer: string;
  sources: AbsorbedPage[];
}

export async function askOracle(
  question: string,
  pages: AbsorbedPage[],
  history: ChatMessage[]
): Promise<OracleResponse> {
  const results = searchKnowledge(question, pages);
  const topPages = results.slice(0, 4).map((r) => ({
    title: r.page.title,
    url: r.page.url,
    content: r.page.content,
  }));

  const chatHistory = history
    .slice(-12)
    .filter((m) => m.role === "user" || m.role === "assistant")
    .map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      content: m.content,
    }));

  const response = await fetch(`${API_BASE}/api/oracle`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      question,
      context: topPages,
      history: chatHistory,
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: "Network error" }));
    throw new Error(err.error ?? `Server error ${response.status}`);
  }

  const data = await response.json();
  return {
    answer: data.answer,
    sources: results.slice(0, 4).map((r) => r.page),
  };
}
