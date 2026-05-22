import { createFileRoute, Link } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { MessageCircle, BarChart3, Building2 } from "lucide-react";

export const Route = createFileRoute("/")({
  component: Home,
  head: () => ({
    meta: [
      { title: "Haqq AI — Women's Rights Agent for Pakistan" },
      { name: "description", content: "Bilingual AI legal assistant for women's rights in Pakistan." },
    ],
  }),
});

function Home() {
  const tiles = [
    { to: "/user", icon: MessageCircle, title: "Chat with Haqq AI", desc: "Ask legal questions in Urdu or English.", color: "from-primary to-teal" },
    { to: "/admin", icon: BarChart3, title: "Admin Dashboard", desc: "Monitor queries, users and trends.", color: "from-teal to-primary" },
    { to: "/client", icon: Building2, title: "Partner View", desc: "Impact metrics for NGOs and law firms.", color: "from-primary to-chart-3" },
  ] as const;

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-16 sm:py-24">
        <div className="text-center">
          <p className="inline-block rounded-full bg-secondary px-3 py-1 text-xs font-medium text-primary">
            Women's Rights · Pakistan
          </p>
          <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-6xl">
            Know your <span className="bg-gradient-to-r from-primary to-teal bg-clip-text text-transparent">rights</span>.
            <br />Get help instantly.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            Haqq AI — حق — is a bilingual legal assistant empowering women in Pakistan
            with accessible knowledge about their rights and protections.
          </p>
        </div>
        <div className="mt-16 grid gap-6 md:grid-cols-3">
          {tiles.map((t) => (
            <Link key={t.to} to={t.to} className="group rounded-2xl border border-border bg-card p-6 transition hover:shadow-lg hover:-translate-y-1">
              <div className={`inline-flex rounded-xl bg-gradient-to-br ${t.color} p-3 text-primary-foreground`}>
                <t.icon className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-lg font-semibold">{t.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{t.desc}</p>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
