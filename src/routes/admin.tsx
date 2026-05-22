import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { Users, MessageSquare, TrendingUp, Clock } from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";

export const Route = createFileRoute("/admin")({
  component: AdminPage,
  head: () => ({ meta: [{ title: "Admin — Haqq AI" }] }),
});

const usage = [
  { day: "Mon", queries: 124 },
  { day: "Tue", queries: 168 },
  { day: "Wed", queries: 142 },
  { day: "Thu", queries: 201 },
  { day: "Fri", queries: 256 },
  { day: "Sat", queries: 189 },
  { day: "Sun", queries: 223 },
];

const recent = [
  { q: "What are my rights after divorce?", topic: "Divorce Rights", time: "2m ago", status: "Answered" },
  { q: "ورثہ میں عورت کا حصہ کتنا ہے؟", topic: "Inheritance", time: "8m ago", status: "Answered" },
  { q: "How to report workplace harassment?", topic: "Harassment", time: "14m ago", status: "Answered" },
  { q: "Custody of children after separation", topic: "Child Custody", time: "26m ago", status: "Answered" },
  { q: "Domestic violence complaint process", topic: "Domestic Violence", time: "41m ago", status: "Escalated" },
  { q: "Mehr کے قانونی حقوق", topic: "Divorce Rights", time: "1h ago", status: "Answered" },
];

const metrics = [
  { label: "Total Queries", value: "12,847", icon: MessageSquare, color: "from-primary to-chart-3" },
  { label: "Active Users", value: "1,432", icon: Users, color: "from-teal to-primary" },
  { label: "Top Topic", value: "Divorce Rights", icon: TrendingUp, color: "from-primary to-teal" },
  { label: "Avg Response Time", value: "1.8s", icon: Clock, color: "from-teal to-chart-3" },
];

function AdminPage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="mt-1 text-muted-foreground">Overview of Haqq AI usage and impact.</p>

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
          <h2 className="text-lg font-semibold">Daily Usage — last 7 days</h2>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={usage} margin={{ left: -10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="day" stroke="var(--muted-foreground)" fontSize={12} />
                <YAxis stroke="var(--muted-foreground)" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    background: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: 12,
                  }}
                />
                <Line type="monotone" dataKey="queries" stroke="var(--primary)" strokeWidth={3} dot={{ fill: "var(--teal)", r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="mt-8 overflow-hidden rounded-2xl border border-border bg-card">
          <div className="border-b border-border p-6">
            <h2 className="text-lg font-semibold">Recent Questions</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-secondary text-left text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-6 py-3">Question</th>
                  <th className="px-6 py-3">Topic</th>
                  <th className="px-6 py-3">Time</th>
                  <th className="px-6 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((r, i) => (
                  <tr key={i} className="border-t border-border">
                    <td className="px-6 py-4 font-medium">{r.q}</td>
                    <td className="px-6 py-4 text-muted-foreground">{r.topic}</td>
                    <td className="px-6 py-4 text-muted-foreground">{r.time}</td>
                    <td className="px-6 py-4">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                        r.status === "Answered"
                          ? "bg-teal/15 text-teal"
                          : "bg-destructive/15 text-destructive"
                      }`}>
                        {r.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
