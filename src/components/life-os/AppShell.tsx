import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import {
  CalendarDays,
  CheckSquare,
  LineChart,
  NotebookPen,
  Repeat,
  Settings,
  Newspaper,
  Sun,
  HeartPulse,
} from "lucide-react";

type NavTo =
  | "/"
  | "/calendar"
  | "/tasks"
  | "/insights"
  | "/journal"
  | "/habits"
  | "/health"
  | "/news"
  | "/settings";

const nav: { label: string; icon: typeof Sun; to: NavTo }[] = [
  { label: "Today", icon: Sun, to: "/" },
  { label: "Calendar", icon: CalendarDays, to: "/calendar" },
  { label: "Tasks", icon: CheckSquare, to: "/tasks" },
  { label: "Insights", icon: LineChart, to: "/insights" },
  { label: "Journal", icon: NotebookPen, to: "/journal" },
  { label: "Habits", icon: Repeat, to: "/habits" },
  { label: "Health & Mood", icon: HeartPulse, to: "/health" },
  { label: "News", icon: Newspaper, to: "/news" },
  { label: "Settings", icon: Settings, to: "/settings" },
];

function NavItem({ label, icon: Icon, to }: { label: string; icon: typeof Sun; to: NavTo }) {
  return (
    <Link
      to={to}
      activeOptions={{ exact: to === "/" }}
      className="flex shrink-0 items-center gap-2 rounded-xl px-3 py-2 text-sm whitespace-nowrap transition-colors text-muted-foreground hover:bg-muted hover:text-foreground"
      activeProps={{
        className:
          "flex shrink-0 items-center gap-2 rounded-xl px-3 py-2 text-sm whitespace-nowrap transition-colors bg-primary text-primary-foreground font-medium",
      }}
    >
      <Icon className="size-[18px] shrink-0" strokeWidth={1.8} />
      {label}
    </Link>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="mx-auto w-full max-w-[1120px] px-4 pt-4 sm:px-6 lg:px-10">
          <Link to="/" className="flex items-center gap-2.5">
            <span className="grid size-8 shrink-0 place-items-center rounded-xl bg-primary text-[13px] font-semibold text-primary-foreground">
              LO
            </span>
            <span className="text-[15px] font-semibold tracking-tight">Life OS</span>
          </Link>

          <nav
            aria-label="Primary"
            className="-mx-1 mt-3 flex gap-1 overflow-x-auto pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {nav.map((item) => (
              <NavItem key={item.label} {...item} />
            ))}
          </nav>
        </div>
      </header>

      <main>
        <div className="mx-auto w-full max-w-[1120px] px-4 py-6 pb-[calc(env(safe-area-inset-bottom)+32px)] sm:px-6 lg:px-10 lg:py-10">
          {children}
        </div>
      </main>
    </div>
  );
}
