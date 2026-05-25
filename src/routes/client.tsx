import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { AlertTriangle, Siren, Home, Scale, Download, Loader2 } from "lucide-react";
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from "recharts";

export const Route = createFileRoute("/client")({
  component: ClientPage,
  head: () => ({ meta: [{ title: "Client — Haqq AI" }] }),
});

const CSV_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vQ0I057_Ic_pWSXSmy2US2xDuO9z-S6UsNGAMtUkl5Vhg_IXzvZVYpbkDlHn3J5jhTGSsYHfsQf-oap/pub?gid=463877128&single=true&output=csv";

const COLORS = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"];

type StatRow = { label: string; value: string; numeric: number | null; year: string; source: string };
type ProvinceRow = { province: string; cases: number; source: string };
type SheetData = { stats: StatRow[]; provinces: ProvinceRow[] };

// Minimal CSV line parser (handles quoted fields with commas)
function parseCsvLine(line: string): string[] {
  const out: string[] = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') { cur += '"'; i++; }
      else inQuotes = !inQuotes;
    } else if (ch === "," && !inQuotes) {
      out.push(cur); cur = "";
    } else cur += ch;
  }
  out.push(cur);
  return out.map((s) => s.trim());
}

function toNumber(v: string): number | null {
  if (!v) return null;
  const cleaned = v.replace(/,/g, "").replace(/%/g, "").trim();
  // skip fractions like "145/148"
  if (cleaned.includes("/")) return null;
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
}

function parseSheet(csv: string): SheetData {
  const lines = csv.split(/\r?\n/).map(parseCsvLine);
  const stats: StatRow[] = [];
  const provinces: ProvinceRow[] = [];

  let mode: "none" | "stats" | "provinces" = "none";
  for (const row of lines) {
    const first = (row[0] || "").toLowerCase();
    if (first === "category") { mode = "stats"; continue; }
    if (first === "province") { mode = "provinces"; continue; }
    if (!row[0]) { mode = "none"; continue; }

    if (mode === "stats") {
      stats.push({
        label: row[0],
        value: row[1] || "",
        numeric: toNumber(row[1] || ""),
        year: row[2] || "",
        source: row[4] || "",
      });
    } else if (mode === "provinces") {
      const pct = toNumber(row[1] || "");
      if (pct !== null) {
        provinces.push({ province: row[0], cases: pct, source: row[4] || "" });
      }
    }
  }
  return { stats, provinces };
}

// Fallback / last-known data
const FALLBACK: SheetData = {
  stats: [
    { label: "Total GBV Cases", value: "6,543", numeric: 6543, year: "2025", source: "HRCP / Sahil 2025" },
    { label: "Domestic Violence Deaths", value: "1,332", numeric: 1332, year: "2025", source: "HRCP 2025" },
    { label: "Rape Cases", value: "3,815", numeric: 3815, year: "2025", source: "HRCP 2025" },
    { label: "Conviction Rate — Rape", value: "0.5%", numeric: null, year: "2025", source: "SSDO 2025" },
  ],
  provinces: [
    { province: "Punjab", cases: 78, source: "SSDO 2025" },
    { province: "Sindh", cases: 14, source: "Sahil 2025" },
    { province: "KPK", cases: 6, source: "Sahil 2025" },
    { province: "Balochistan", cases: 1, source: "Sahil 2025" },
    { province: "Others", cases: 1, source: "Sahil 2025" },
  ],
};

const STAT_ICONS = [AlertTriangle, Siren, Home, Scale];
const STAT_GRADIENTS = [
  "from-primary to-teal",
  "from-teal to-primary",
  "from-primary to-chart-3",
  "from-destructive to-primary",
];

function ClientPage() {
  const [data, setData] = useState<SheetData>(FALLBACK);
  const [loading, setLoading] = useState(true);
  const [usingFallback, setUsingFallback] = useState(false);
  const [updatedAt] = useState(() =>
    new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(CSV_URL);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const csv = await res.text();
        const parsed = parseSheet(csv);
        if (cancelled) return;
        if (parsed.stats.length === 0 && parsed.provinces.length === 0) {
          setUsingFallback(true);
        } else {
          setData(parsed);
          setUsingFallback(false);
        }
      } catch {
        if (!cancelled) setUsingFallback(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const statCards = data.stats.slice(0, 4);
  const pieData = data.stats.filter((s) => s.numeric !== null).slice(0, 6).map((s) => ({
    name: s.label,
    value: s.numeric as number,
  }));
  const provinceData = data.provinces;

  function downloadReport() {
    const lines = [
      "Haqq AI — Pakistan Women's Rights Live Data Report",
      "===================================================",
      `Last updated: ${updatedAt}`,
      "",
      "Key Statistics:",
      ...data.stats.map((s) => `- ${s.label} (${s.year}): ${s.value} — ${s.source}`),
      "",
      "Cases by Province:",
      ...data.provinces.map((p) => `- ${p.province}: ${p.cases}% — ${p.source}`),
      "",
      "Sources: HRCP, UN Women Pakistan, SSDO, Sahil, UNICEF, WEF",
    ].join("\n");
    const blob = new Blob([lines], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "haqq-ai-impact-report.txt";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Partner Dashboard</h1>
            <p className="mt-1 text-muted-foreground">
              Real data from Pakistan — sourced from HRCP, UN Women Pakistan & SSDO 2023–2025.
            </p>
          </div>
          <button
            onClick={downloadReport}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary to-teal px-5 py-3 text-sm font-medium text-primary-foreground transition hover:opacity-90"
          >
            <Download className="h-4 w-4" /> Download Report
          </button>
        </div>

        {loading ? (
          <div className="mt-16 flex flex-col items-center justify-center gap-3 text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm">Fetching live data from Google Sheets…</p>
          </div>
        ) : (
          <>
            {usingFallback && (
              <div className="mt-6 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                Couldn't reach live source. Showing last known data.
              </div>
            )}

            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {statCards.map((m, i) => {
                const Icon = STAT_ICONS[i % STAT_ICONS.length];
                return (
                  <div key={m.label} className="rounded-2xl border border-border bg-card p-6">
                    <div className={`inline-flex rounded-xl bg-gradient-to-br ${STAT_GRADIENTS[i % STAT_GRADIENTS.length]} p-3 text-primary-foreground`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <div className="mt-4 text-3xl font-bold">{m.value}</div>
                    <div className="text-sm text-muted-foreground">{m.label}</div>
                    <div className="mt-2 text-xs text-muted-foreground/80">
                      {m.year && <span>{m.year} · </span>}{m.source}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-8 grid gap-6 lg:grid-cols-2">
              <div className="rounded-2xl border border-border bg-card p-6">
                <h2 className="text-lg font-semibold">Reported Cases by Category in Pakistan</h2>
                <p className="text-sm text-muted-foreground">Distribution of reported GBV cases (live).</p>
                <div className="mt-4 h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        innerRadius={50}
                        paddingAngle={2}
                      >
                        {pieData.map((_, i) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          background: "var(--card)",
                          border: "1px solid var(--border)",
                          borderRadius: 12,
                        }}
                        formatter={(v: number) => v.toLocaleString()}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="rounded-2xl border border-border bg-card p-6">
                <h2 className="text-lg font-semibold">Cases by Province in Pakistan</h2>
                <p className="text-sm text-muted-foreground">Share of reported cases across provinces.</p>
                <div className="mt-4 h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={provinceData} margin={{ left: -10 }}>
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
              Sources: HRCP, UN Women Pakistan, SSDO, Sahil, UNICEF, WEF.
            </p>
            <p className="mt-1 text-xs text-muted-foreground/80">
              Live data — Last updated: {updatedAt}
            </p>
          </>
        )}
      </main>
    </div>
  );
}
