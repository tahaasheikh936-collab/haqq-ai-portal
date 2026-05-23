import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { Send, Phone, Loader2 } from "lucide-react";

export const Route = createFileRoute("/user")({
  component: UserPage,
  head: () => ({ meta: [{ title: "Chat — Haqq AI" }] }),
});

const topics = [
  "Domestic Violence",
  "Divorce Rights",
  "Workplace Harassment",
  "Inheritance Rights",
  "Child Custody",
];

const helplines = [
  { name: "Rozan", number: "051-2890505" },
  { name: "Edhi", number: "115" },
  { name: "Police", number: "15" },
];

type Msg = { role: "user" | "assistant"; content: string };

function renderInline(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((p, i) =>
    p.startsWith("**") && p.endsWith("**") ? (
      <strong key={i} className="font-semibold">{p.slice(2, -2)}</strong>
    ) : (
      <span key={i}>{p}</span>
    )
  );
}

function FormattedMessage({ content }: { content: string }) {
  // Normalize: ensure bullets and headings sit on their own lines.
  const normalized = content
    .replace(/\s*•\s*/g, "\n• ")
    .replace(/(Your Legal Rights:|Immediate Steps You Can Take:|Emergency Helplines:)/g, "\n\n$1\n");

  const blocks = normalized.split(/\n{2,}/).map((b) => b.trim()).filter(Boolean);

  return (
    <div className="space-y-3">
      {blocks.map((block, bi) => {
        const lines = block.split("\n").map((l) => l.trim()).filter(Boolean);
        const headingMatch = lines[0]?.match(/^(Your Legal Rights|Immediate Steps You Can Take|Emergency Helplines):?$/);
        if (headingMatch) {
          const bullets = lines.slice(1).filter((l) => l.startsWith("•"));
          const rest = lines.slice(1).filter((l) => !l.startsWith("•"));
          return (
            <div key={bi}>
              <h4 className="mb-1.5 text-sm font-bold uppercase tracking-wide text-primary">
                {headingMatch[1]}
              </h4>
              {bullets.length > 0 ? (
                <ul className="space-y-1.5">
                  {bullets.map((b, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="text-primary">•</span>
                      <span className="flex-1">{renderInline(b.replace(/^•\s*/, ""))}</span>
                    </li>
                  ))}
                </ul>
              ) : null}
              {rest.length > 0 ? (
                <p className="mt-1">{renderInline(rest.join(" "))}</p>
              ) : null}
            </div>
          );
        }
        // Plain block (may include bullets)
        const bullets = lines.filter((l) => l.startsWith("•"));
        if (bullets.length > 0 && bullets.length === lines.length) {
          return (
            <ul key={bi} className="space-y-1.5">
              {bullets.map((b, i) => (
                <li key={i} className="flex gap-2">
                  <span className="text-primary">•</span>
                  <span className="flex-1">{renderInline(b.replace(/^•\s*/, ""))}</span>
                </li>
              ))}
            </ul>
          );
        }
        return (
          <p key={bi} className="whitespace-pre-wrap">{renderInline(lines.join("\n"))}</p>
        );
      })}
    </div>
  );
}

function UserPage() {
  const [messages, setMessages] = useState<Msg[]>([
    { role: "assistant", content: "السلام علیکم 🌸 I'm Haqq AI. Ask me anything about women's rights in Pakistan — in Urdu or English. آپ اردو یا انگریزی میں سوال پوچھ سکتی ہیں۔" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function send(text: string) {
    const t = text.trim();
    if (!t || loading) return;
    setInput("");
    const nextHistory: Msg[] = [...messages, { role: "user", content: t }];
    setMessages(nextHistory);
    setLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextHistory }),
      });
      const data = await res.json();
      setMessages((m) => [...m, { role: "assistant", content: data.reply ?? "..." }]);
    } catch {
      setMessages((m) => [...m, { role: "assistant", content: "Sorry, I couldn't reach the server. Please try again." }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col px-4 py-6">
        <div className="mb-4">
          <h1 className="text-2xl font-bold">Ask Haqq AI</h1>
          <p className="text-sm text-muted-foreground">Quick topics:</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {topics.map((t) => (
              <button
                key={t}
                onClick={() => send(`Tell me about ${t} laws in Pakistan.`)}
                className="rounded-full border border-border bg-card px-4 py-2 text-sm font-medium transition hover:border-primary hover:bg-secondary hover:text-primary"
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-1 flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
          <div className="flex-1 space-y-4 overflow-y-auto p-4 sm:p-6" style={{ minHeight: "50vh", maxHeight: "60vh" }}>
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    m.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-foreground"
                  }`}
                >
                  {m.role === "assistant" ? <FormattedMessage content={m.content} /> : m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="flex items-center gap-2 rounded-2xl bg-secondary px-4 py-3 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" /> Thinking…
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>
          <form
            onSubmit={(e) => { e.preventDefault(); send(input); }}
            className="flex gap-2 border-t border-border p-3"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your question / اپنا سوال لکھیں…"
              className="flex-1 rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary to-teal px-5 py-3 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:opacity-50"
            >
              <Send className="h-4 w-4" /> Send
            </button>
          </form>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          {helplines.map((h) => (
            <a
              key={h.name}
              href={`tel:${h.number.replace(/[^0-9]/g, "")}`}
              className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 transition hover:border-teal"
            >
              <div className="rounded-lg bg-teal/10 p-2 text-teal">
                <Phone className="h-5 w-5" />
              </div>
              <div>
                <div className="text-xs text-muted-foreground">{h.name} Helpline</div>
                <div className="font-semibold">{h.number}</div>
              </div>
            </a>
          ))}
        </div>
      </main>
    </div>
  );
}
