import { Link } from "@tanstack/react-router";

const links = [
  { to: "/user", label: "Chat" },
  { to: "/admin", label: "Admin" },
  { to: "/client", label: "Client" },
] as const;

export function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2 font-bold text-lg">
          <span className="rounded-md bg-gradient-to-br from-primary to-teal px-2 py-1 text-primary-foreground">
            Haqq AI
          </span>
          <span className="text-2xl text-primary" dir="rtl">حق</span>
        </Link>
        <nav className="flex items-center gap-1 sm:gap-2">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition hover:bg-secondary hover:text-foreground"
              activeProps={{ className: "rounded-md px-3 py-2 text-sm font-medium bg-secondary text-primary" }}
            >
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
