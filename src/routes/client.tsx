import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { Heart, BookOpen, Handshake, Download } from "lucide-react";
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
} from "recharts";

export const Route = createFileRoute("/client")({
  component: ClientPage,
  head: () => ({ meta: [{ title: "Client — Haqq AI" }] }),
});

const categories = [
  { name: "Divorce Rights", value: 32 },
  { name: "Domestic Violence", value: 24 },
  { name: "Inheritance", value: 18 },
  { name: "Workplace Harassment", value: 14 },
  { name: "Child Custody", value: 12 },
];
const COLORS = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"];

const impact = [
  { label: "Women Helped", value: "8,420", icon: Heart, color: "from-primary to-teal" },
  { label: "Legal Topics Covered", value: "42", icon: BookOpen, color: "from-teal to-primary" },
  { label: "Partner Organizations", value: "17", icon: Handshake, color: "from-primary to-chart-3" },
];

function downloadReport() {
  const lines = [
    "Haqq AI — Impact Report",
    "========================",
    "Women Helped: 8,420",
    "Legal Topics Covered: 42",
    "Partner Organizations: 17",
    "",
    "Category Breakdown:",
    ...categories.map((c) => `- ${c.name}: ${c.value}%`),
  ].join("\n");
  const blob = new Blob([lines], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "haqq-ai-impact-report.txt";
  a.click();
  URL.revokeObjectURL(url);
}

function ClientPage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Partner Dashboard</h1>
            <p className="mt-1 text-muted-foreground">Impact view for NGOs and law firms.</p>
          </div>
          <button
            onClick={downloadReport}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary to-teal px-5 py-3 text-sm font-medium text-primary-foreground transition hover:opacity-90"
          >
            <Download className="h-4 w-4" /> Download Report
          </button>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {impact.map((m) => (
            <div key={m.label} className="rounded-2xl border border-border bg-card p-6">
              <div className={`inline-flex rounded-xl bg-gradient-to-br ${m.color} p-3 text-primary-foreground`}>
                <m.icon className="h-6 w-6" />
              </div>
              <div className="mt-4 text-3xl font-bold">{m.value}</div>
              <div className="text-sm text-muted-foreground">{m.label}</div>
            </div>
          ))}
        </div>

        <div className="mt-8 rounded-2xl border border-border bg-card p-6">
          <h2 className="text-lg font-semibold">Legal Categories Breakdown</h2>
          <p className="text-sm text-muted-foreground">Distribution of questions across legal areas.</p>
          <div className="mt-4 h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categories}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={110}
                  innerRadius={55}
                  paddingAngle={2}
                  label={(e) => `${e.value}%`}
                >
                  {categories.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: 12,
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </main>
    </div>
  );
}
