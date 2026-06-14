import type { AbsorbedPage } from "@/context/KnowledgeContext";

export interface SearchResult {
  page: AbsorbedPage;
  score: number;
  excerpt: string;
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function getExcerpt(content: string, terms: string[]): string {
  for (const term of terms) {
    const idx = content.toLowerCase().indexOf(term.toLowerCase());
    if (idx >= 0) {
      const start = Math.max(0, idx - 80);
      const end = Math.min(content.length, idx + 200);
      return (start > 0 ? "…" : "") + content.substring(start, end).trim() + "…";
    }
  }
  return content.substring(0, 200) + "…";
}

export function searchKnowledge(
  query: string,
  pages: AbsorbedPage[]
): SearchResult[] {
  if (!query.trim() || pages.length === 0) return [];

  const terms = query
    .toLowerCase()
    .split(/\s+/)
    .filter((t) => t.length > 1);

  if (terms.length === 0) return [];

  return pages
    .map((page) => {
      const titleLower = page.title.toLowerCase();
      const contentLower = page.content.toLowerCase();
      const combined = titleLower + " " + contentLower;

      let score = 0;

      for (const term of terms) {
        const escaped = escapeRegex(term);
        const occurrences = (combined.match(new RegExp(escaped, "g")) || []).length;
        score += occurrences;
        if (titleLower.includes(term)) score += 15;
        if (page.entities.some((e) => e.toLowerCase().includes(term))) score += 8;
        if (page.url.toLowerCase().includes(term)) score += 3;
      }

      const excerpt = getExcerpt(page.content, terms);
      return { page, score, excerpt };
    })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 12);
}

export interface ChatAnswer {
  answer: string;
  sources: AbsorbedPage[];
}

export function generateAnswer(
  question: string,
  pages: AbsorbedPage[]
): ChatAnswer {
  if (pages.length === 0) {
    return {
      answer:
        "The Akashic Record is empty. Browse any webpage in the Browser tab and I will absorb its knowledge. Then you can ask me anything.",
      sources: [],
    };
  }

  const results = searchKnowledge(question, pages);

  if (results.length === 0) {
    return {
      answer:
        "I have no relevant knowledge on this yet. Browse pages related to your question and I'll absorb that wisdom into the record.",
      sources: [],
    };
  }

  const top = results.slice(0, 3);

  const parts = top.map((r) => {
    const excerpt = r.excerpt.replace(/…/g, "").trim();
    return `From "${r.page.title}":\n${excerpt}`;
  });

  const answer = `Based on what I've absorbed:\n\n${parts.join("\n\n")}`;

  return {
    answer,
    sources: top.map((r) => r.page),
  };
}
