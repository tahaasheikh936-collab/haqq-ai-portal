import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { Users, MessageSquare, TrendingUp, Clock, Loader2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from "recharts";

export const Route = createFileRoute("/admin")({
  component: AdminPage,
  head: () => ({ meta: [{ title: "Admin — Haqq AI" }] }),
});

type QueryRow = {
  id: string;
  user_message: string;
  ai_response: string;
  topic_category: string;
  language: string;
  created_at: string;
};

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

const TOPIC_COLORS = ["#8b5cf6", "#14b8a6", "#f59e0b", "#ef4444", "#3b82f6", "#a78bfa"];

function AdminPage() {
  const [rows, setRows] = useState<QueryRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      const { data, error } = await supabase
        .from("queries")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(1000);
      if (!active) return;
      if (error) { setError(error.message); setRows([]); return; }
      setRows((data ?? []) as QueryRow[]);
    })();
    return () => { active = false; };
  }, []);

  const metrics = useMemo(() => {
    const total = rows?.length ?? 0;
    const topics = new Map<string, number>();
    rows?.forEach((r) => topics.set(r.topic_category, (topics.get(r.topic_category) ?? 0) + 1));
    const topTopic = [...topics.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—";
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const todayCount = rows?.filter((r) => new Date(r.created_at) >= today).length ?? 0;
    return [
      { label: "Total Queries", value: total.toLocaleString(), icon: MessageSquare, color: "from-primary to-chart-3" },
      { label: "Queries Today", value: todayCount.toLocaleString(), icon: Users, color: "from-teal to-primary" },
      { label: "Top Topic", value: topTopic, icon: TrendingUp, color: "from-primary to-teal" },
      { label: "Last Query", value: rows && rows.length > 0 ? timeAgo(rows[0].created_at) : "—", icon: Clock, color: "from-teal to-chart-3" },
    ];
  }, [rows]);

  const topicChart = useMemo(() => {
    const m = new Map<string, number>();
    rows?.forEach((r) => m.set(r.topic_category, (m.get(r.topic_category) ?? 0) + 1));
    return [...m.entries()]
      .map(([topic, count]) => ({ topic, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);
  }, [rows]);

  const recent = useMemo(() => rows?.slice(0, 10) ?? [], [rows]);

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="rounded-3xl border border-border bg-gradient-to-br from-primary/8 via-card to-teal/8 p-8 shadow-sm">
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-primary">
            <span className="h-1.5 w-1.5 rounded-full bg-teal animate-pulse" /> Live
          </div>
          <h1 className="mt-2 text-4xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="mt-2 text-sm text-muted-foreground">Real-time analytics from Haqq AI chat logs.</p>
        </div>


        {rows === null ? (
          <div className="mt-12 flex items-center justify-center gap-2 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" /> Loading live data…
          </div>
        ) : (
          <>
            {error && (
              <div className="mt-4 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                Failed to load data: {error}
              </div>
            )}

            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {metrics.map((m) => (
                <div key={m.label} className="group relative overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-sm">
                  <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${m.color}`} />
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{m.label}</span>
                    <div className={`rounded-xl bg-gradient-to-br ${m.color} p-2.5 text-primary-foreground shadow-sm transition-transform group-hover:scale-110`}>
                      <m.icon className="h-4 w-4" />
                    </div>
                  </div>
                  <div className="mt-4 text-3xl font-bold tracking-tight">{m.value}</div>
                </div>
              ))}
            </div>

            <div className="mt-8 rounded-2xl border border-border bg-card p-6 shadow-sm">
              <div className="flex items-end justify-between">
                <div>
                  <h2 className="text-xl font-semibold">Top Topics</h2>
                  <p className="mt-1 text-xs text-muted-foreground">Most asked categories — all time</p>
                </div>
                <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                  {topicChart.length} categories
                </span>
              </div>
              <div className="mt-6 h-72">
                {topicChart.length === 0 ? (
                  <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                    No queries yet. Ask Haqq AI on the Chat page to populate this.
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={topicChart} margin={{ left: -10 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                      <XAxis dataKey="topic" stroke="var(--muted-foreground)" fontSize={11} interval={0} angle={-10} textAnchor="end" height={60} />
                      <YAxis stroke="var(--muted-foreground)" fontSize={12} allowDecimals={false} />
                      <Tooltip
                        cursor={{ fill: "color-mix(in oklab, var(--primary) 6%, transparent)" }}
                        contentStyle={{
                          background: "var(--card)",
                          border: "1px solid var(--border)",
                          borderRadius: 12,
                          boxShadow: "0 8px 24px rgba(17,24,39,0.08)",
                        }}
                      />
                      <Bar dataKey="count" radius={[10, 10, 0, 0]}>
                        {topicChart.map((_, i) => (
                          <Cell key={i} fill={TOPIC_COLORS[i % TOPIC_COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            <div className="mt-8 overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
              <div className="flex items-center justify-between border-b border-border p-6">
                <div>
                  <h2 className="text-xl font-semibold">Recent Questions</h2>
                  <p className="mt-1 text-xs text-muted-foreground">Latest live queries from users</p>
                </div>
                <span className="rounded-full bg-teal/10 px-3 py-1 text-xs font-medium text-teal">
                  Showing {recent.length}
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-secondary/60 text-left text-[11px] uppercase tracking-wider text-muted-foreground backdrop-blur">
                    <tr>
                      <th className="px-6 py-3 font-semibold">Question</th>
                      <th className="px-6 py-3 font-semibold">Topic</th>
                      <th className="px-6 py-3 font-semibold">Language</th>
                      <th className="px-6 py-3 font-semibold">Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recent.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-6 py-10 text-center text-muted-foreground">
                          No queries logged yet.
                        </td>
                      </tr>
                    ) : (
                      recent.map((r) => {
                        const isUrdu = r.language?.toLowerCase() === "urdu";
                        return (
                          <tr key={r.id} className="border-t border-border transition-colors hover:bg-secondary/40">
                            <td className="max-w-md truncate px-6 py-4 font-medium" title={r.user_message}>
                              <span className={isUrdu ? "font-urdu" : ""} dir={isUrdu ? "rtl" : "ltr"}>
                                {r.user_message}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className="inline-flex rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
                                {r.topic_category}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium capitalize ${
                                isUrdu ? "bg-teal/10 text-teal" : "bg-secondary text-secondary-foreground"
                              }`}>
                                {r.language}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-muted-foreground">{timeAgo(r.created_at)}</td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
