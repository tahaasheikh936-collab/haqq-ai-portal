import { createFileRoute } from "@tanstack/react-router";

const SYSTEM_PROMPT = `You are Haqq AI, a women's legal rights assistant for Pakistan. When a woman describes a problem, respond in this exact format:

Your Legal Rights: • [Right 1 — cite the specific law e.g. Protection of Women Act 2006] • [Right 2 — cite the specific law] • [Right 3 if applicable]

Immediate Steps You Can Take: • [Step 1] • [Step 2] • [Step 3]

Emergency Helplines: Rozan Counseling: 051-2890505 | Edhi Foundation: 115 | Police: 15

Keep answers short, clear, and direct. No long paragraphs. If user writes in Urdu respond in Urdu. If English respond in English. Never give opinions — only legal facts and rights.`;

type ChatMsg = { role: "user" | "assistant" | "system"; content: string };

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = (await request.json()) as {
            message?: string;
            messages?: ChatMsg[];
          };

          const history: ChatMsg[] = Array.isArray(body.messages)
            ? body.messages
                .filter((m) => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
                .map((m) => ({ role: m.role, content: m.content.slice(0, 4000) }))
            : [];

          if (body.message && typeof body.message === "string") {
            history.push({ role: "user", content: body.message.slice(0, 4000) });
          }

          if (history.length === 0) {
            return Response.json({ reply: "Please type a question." }, { status: 400 });
          }

          const apiKey = process.env.GROQ_API_KEY;
          if (!apiKey) {
            return Response.json(
              { reply: "Server is not configured with an API key. Please contact the administrator." },
              { status: 500 },
            );
          }

          const upstream = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${apiKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: "meta-llama/llama-4-scout-17b-16e-instruct",
              messages: [{ role: "system", content: SYSTEM_PROMPT }, ...history],
              temperature: 0.5,
            }),
          });

          if (!upstream.ok) {
            const errText = await upstream.text().catch(() => "");
            console.error("Groq error:", upstream.status, errText);
            if (upstream.status === 429) {
              return Response.json({ reply: "Too many requests right now. Please try again in a moment." }, { status: 429 });
            }
            return Response.json(
              { reply: "Sorry, the AI service is unavailable right now. Please try again shortly." },
              { status: 502 },
            );
          }

          const data = (await upstream.json()) as {
            choices?: Array<{ message?: { content?: string } }>;
          };
          const reply = data.choices?.[0]?.message?.content?.trim() || "Sorry, I couldn't generate a response.";
          return Response.json({ reply });
        } catch (err) {
          console.error("chat handler error:", err);
          return Response.json({ reply: "Invalid request." }, { status: 400 });
        }
      },
    },
  },
});
