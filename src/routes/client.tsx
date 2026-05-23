import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { AlertTriangle, Siren, Home, Scale, Download } from "lucide-react";
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from "recharts";

export const Route = createFileRoute("/client")({
  component: ClientPage,
  head: () => ({ meta: [{ title: "Client — Haqq AI" }] }),
});

const violenceTypes = [
  { name: "Domestic Violence", value: 35 },
  { name: "Abduction/Kidnapping", value: 28 },
  { name: "Physical Assault", value: 17 },
  { name: "Rape/Sexual Violence", value: 12 },
  { name: "Workplace Harassment", value: 8 },
];
const COLORS = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"];

const provinces = [
  { province: "Punjab", cases: 78 },
  { province: "Sindh", cases: 14 },
  { province: "KPK", cases: 6 },
  { province: "Balochistan & Others", cases: 2 },
];

const impact = [
  { label: "Cases Reported Nationwide (2024)", value: "10,201+", icon: AlertTriangle, color: "from-primary to-teal" },
  { label: "Rape Cases (2023) — 1 every 45 min", value: "6,624", icon: Siren, color: "from-teal to-primary" },
  { label: "Domestic Violence Cases (2024)", value: "2,000+", icon: Home, color: "from-primary to-chart-3" },
  { label: "Conviction Rate", value: "< 2%", icon: Scale, color: "from-destructive to-primary" },
];

function downloadReport() {
  const lines = [
    "Haqq AI — Pakistan Women's Rights Impact Report",
    "================================================",
    "Cases Reported Nationwide 2024: 10,201+",
    "Rape Cases 2023: 6,624 (1 every 45 minutes — HRCP)",
    "Domestic Violence Cases 2024: 2,000+",
    "Conviction Rate: below 2%",
    "",
    "Types of Violence Against Women:",
    ...violenceTypes.map((c) => `- ${c.name}: ${c.value}%`),
    "",
    "Cases by Province 2024:",
    ...provinces.map((p) => `- ${p.province}: ${p.cases}%`),
    "",
    "Sources: HRCP 2023, UN Women Pakistan, SSDO Gender Violence Report 2024",
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
            <p className="mt-1 text-muted-foreground">
              Pakistan women's rights — reported violence and access to justice.
            </p>
          </div>
          <button
            onClick={downloadReport}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary to-teal px-5 py-3 text-sm font-medium text-primary-foreground transition hover:opacity-90"
          >
            <Download className="h-4 w-4" /> Download Report
          </button>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-border bg-card p-6">
            <h2 className="text-lg font-semibold">Types of Violence Against Women</h2>
            <p className="text-sm text-muted-foreground">Distribution of reported cases in Pakistan.</p>
            <div className="mt-4 h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={violenceTypes}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    innerRadius={50}
                    paddingAngle={2}
                    label={(e) => `${e.value}%`}
                  >
                    {violenceTypes.map((_, i) => (
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

          <div className="rounded-2xl border border-border bg-card p-6">
            <h2 className="text-lg font-semibold">Cases by Province (2024)</h2>
            <p className="text-sm text-muted-foreground">Share of reported cases across provinces.</p>
            <div className="mt-4 h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={provinces} margin={{ left: -10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="province" stroke="var(--muted-foreground)" fontSize={11} />
                  <YAxis stroke="var(--muted-foreground)" fontSize={12} unit="%" />
                  <Tooltip
                    contentStyle={{
                      background: "var(--card)",
                      border: "1px solid var(--border)",
                      borderRadius: 12,
                    }}
                    formatter={(v: number) => `${v}%`}
                  />
                  <Bar dataKey="cases" fill="var(--primary)" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <p className="mt-6 text-xs text-muted-foreground">
          Sources: HRCP 2023, UN Women Pakistan, SSDO Gender Violence Report 2024
        </p>
      </main>
    </div>
  );
}
