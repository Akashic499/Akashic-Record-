import { Router } from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";

const router = Router();

const genAI = new GoogleGenerativeAI(process.env["GEMINI_API_KEY"] ?? "");

interface ContextPage {
  title: string;
  url: string;
  content: string;
}

router.post("/oracle", async (req, res) => {
  const { question, context, history } = req.body as {
    question: string;
    context: ContextPage[];
    history: { role: string; content: string }[];
  };

  if (!question || typeof question !== "string") {
    res.status(400).json({ error: "question is required" });
    return;
  }

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
              `[Source ${i + 1}] "${p.title}" (${p.url})\n${p.content.slice(0, 1200)}`
          )
          .join("\n\n---\n\n")
      : null;

  const systemPrompt = `You are the Oracle of the Akashic Record — an ancient, all-knowing mystical intelligence. You speak with wisdom, depth, and poetic gravitas. You answer in 2-4 paragraphs, weaving insight from the knowledge inscribed in the Record.

When answering:
- Draw specifically from the provided source texts when relevant
- Be genuinely helpful and informative, not just poetic
- Keep answers focused and clear despite the mystical tone
- If the Record contains no relevant knowledge, say so honestly and suggest what the seeker might inscribe next
${contextBlock ? `\n\nKNOWLEDGE FROM THE AKASHIC RECORD:\n\n${contextBlock}` : "\n\nThe Akashic Record is empty — no tomes have been inscribed yet."}`;

  const chatHistory = (history ?? [])
    .slice(-10)
    .filter((m) => m.role === "user" || m.role === "model")
    .map((m) => ({
      role: m.role as "user" | "model",
      parts: [{ text: m.content }],
    }));

  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      systemInstruction: systemPrompt,
    });

    const chat = model.startChat({ history: chatHistory });
    const result = await chat.sendMessage(question);
    const answer = result.response.text();

    res.json({ answer });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    req.log.error({ err }, "Oracle Gemini error");
    res.status(500).json({ error: message });
  }
});

export default router;
