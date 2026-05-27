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
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="mt-1 text-muted-foreground">Live data from Haqq AI chat logs.</p>

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
                <div key={m.label} className="rounded-2xl border border-border bg-card p-5">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">{m.label}</span>
                    <div className={`rounded-lg bg-gradient-to-br ${m.color} p-2 text-primary-foreground`}>
                      <m.icon className="h-4 w-4" />
                    </div>
                  </div>
                  <div className="mt-3 text-2xl font-bold">{m.value}</div>
                </div>
              ))}
            </div>

            <div className="mt-8 rounded-2xl border border-border bg-card p-6">
              <h2 className="text-lg font-semibold">Top Topics</h2>
              <p className="text-xs text-muted-foreground">Most asked categories — all time</p>
              <div className="mt-4 h-72">
                {topicChart.length === 0 ? (
                  <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                    No queries yet. Ask Haqq AI on the Chat page to populate this.
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={topicChart} margin={{ left: -10 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                      <XAxis dataKey="topic" stroke="var(--muted-foreground)" fontSize={11} interval={0} angle={-10} textAnchor="end" height={60} />
                      <YAxis stroke="var(--muted-foreground)" fontSize={12} allowDecimals={false} />
                      <Tooltip
                        contentStyle={{
                          background: "var(--card)",
                          border: "1px solid var(--border)",
                          borderRadius: 12,
                        }}
                      />
                      <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                        {topicChart.map((_, i) => (
                          <Cell key={i} fill={TOPIC_COLORS[i % TOPIC_COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            <div className="mt-8 overflow-hidden rounded-2xl border border-border bg-card">
              <div className="border-b border-border p-6">
                <h2 className="text-lg font-semibold">Recent Questions</h2>
                <p className="text-xs text-muted-foreground">Latest live queries from users</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-secondary text-left text-xs uppercase tracking-wide text-muted-foreground">
                    <tr>
                      <th className="px-6 py-3">Question</th>
                      <th className="px-6 py-3">Topic</th>
                      <th className="px-6 py-3">Language</th>
                      <th className="px-6 py-3">Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recent.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-6 py-8 text-center text-muted-foreground">
                          No queries logged yet.
                        </td>
                      </tr>
                    ) : (
                      recent.map((r) => (
                        <tr key={r.id} className="border-t border-border">
                          <td className="max-w-md truncate px-6 py-4 font-medium">{r.user_message}</td>
                          <td className="px-6 py-4 text-muted-foreground">{r.topic_category}</td>
                          <td className="px-6 py-4">
                            <span className="rounded-full bg-secondary px-2.5 py-1 text-xs font-medium capitalize">
                              {r.language}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-muted-foreground">{timeAgo(r.created_at)}</td>
                        </tr>
                      ))
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
