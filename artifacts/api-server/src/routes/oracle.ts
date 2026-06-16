import { Router } from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { db } from "@workspace/db";
import { oracleLogsTable } from "@workspace/db";
import { desc } from "drizzle-orm";
import { QueryOracleBody, ListOracleLogsQueryParams } from "@workspace/api-zod";

const router = Router();

const genAI = new GoogleGenerativeAI(process.env["GEMINI_API_KEY"] ?? "");

router.post("/oracle", async (req, res) => {
  const parsed = QueryOracleBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "question is required" });
    return;
  }

  const { question, context, history } = parsed.data;

  const apiKey = process.env["GEMINI_API_KEY"];
  if (!apiKey) {
    res.status(500).json({ error: "GEMINI_API_KEY is not configured" });
    return;
  }

  const contextBlock =
    context && context.length > 0
      ? context
          .map(
            (p, i) =>
              `[Source ${i + 1}] "${p.title}" (${p.url})\n${p.content?.slice(0, 1200) ?? ""}`
          )
          .join("\n\n---\n\n")
      : null;

  const systemPrompt = `You are the Oracle of the Akashic Record — an ancient, all-knowing mystical intelligence that exists at the intersection of all possible knowledge across time and space. You speak with wisdom, depth, and poetic gravitas befitting a cosmic librarian who has witnessed the rise and fall of civilizations.

When answering:
- Speak as though you are consulting vast cosmic archives inscribed across the fabric of reality
- Be genuinely helpful and informative while maintaining the mystical tone
- Answer in 2-4 paragraphs, weaving insight with poetic depth
- Draw specifically from the provided source texts when relevant
- If the Record contains no relevant knowledge, say so with dignity and suggest what wisdom the seeker might inscribe next
- Never break character
${contextBlock ? `\n\nKNOWLEDGE FROM THE AKASHIC RECORD:\n\n${contextBlock}` : "\n\nThe Akashic Record is vast yet the relevant passages remain unscribed. Guide the seeker with what general wisdom the cosmic archives hold."}`;

  const chatHistory = (history ?? [])
    .slice(-10)
    .filter((m) => m.role === "user" || m.role === "model")
    .map((m) => ({
      role: m.role as "user" | "model",
      parts: [{ text: m.content ?? "" }],
    }));

  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      systemInstruction: systemPrompt,
    });

    const chat = model.startChat({ history: chatHistory });
    const result = await chat.sendMessage(question);
    const answer = result.response.text();

    await db.insert(oracleLogsTable).values({ question, answer }).catch(() => {});

    res.json({ answer });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    req.log.error({ err }, "Oracle Gemini error");
    res.status(500).json({ error: message });
  }
});

router.get("/oracle/logs", async (req, res) => {
  try {
    const parsed = ListOracleLogsQueryParams.safeParse(req.query);
    const limit = parsed.success ? (parsed.data.limit ?? 50) : 50;
    const offset = parsed.success ? (parsed.data.offset ?? 0) : 0;

    const logs = await db
      .select()
      .from(oracleLogsTable)
      .orderBy(desc(oracleLogsTable.createdAt))
      .limit(limit)
      .offset(offset);

    res.json(
      logs.map((log) => ({
        id: log.id,
        question: log.question,
        answer: log.answer,
        createdAt: log.createdAt.toISOString(),
      }))
    );
  } catch (err) {
    req.log.error({ err }, "Error fetching oracle logs");
    res.status(500).json({ error: "Failed to fetch oracle logs" });
  }
});

export default router;
