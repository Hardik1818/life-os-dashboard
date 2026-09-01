import { useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import {
  CalendarDays,
  CheckSquare,
  LineChart,
  MoreHorizontal,
  NotebookPen,
  Repeat,
  Settings,
  Newspaper,
  Sun,
  HeartPulse,
} from "lucide-react";

const primaryNav = [
  { label: "Today", icon: Sun, to: "/" as const },
  { label: "Calendar", icon: CalendarDays, to: "/calendar" as const },
  { label: "Tasks", icon: CheckSquare, to: "/tasks" as const },
  { label: "Insights", icon: LineChart, to: "/insights" as const },
];

const secondaryNav = [
  { label: "Journal", icon: NotebookPen, to: "/journal" as const },
  { label: "Habits", icon: Repeat, to: "/habits" as const },
  { label: "Health & Mood", icon: HeartPulse, to: "/health" as const },
  { label: "News", icon: Newspaper, to: "/news" as const },
];

const mobileNav = [
  { label: "Today", icon: Sun, to: "/" as const },
  { label: "Calendar", icon: CalendarDays, to: "/calendar" as const },
  { label: "Tasks", icon: CheckSquare, to: "/tasks" as const },
  { label: "Insights", icon: LineChart, to: "/insights" as const },
];

const moreNav = [
  ...secondaryNav,
  { label: "Settings", icon: Settings, to: "/settings" as const },
];

type NavTo = "/" | "/calendar" | "/tasks" | "/insights" | "/journal" | "/habits" | "/health" | "/news" | "/settings";

function NavItem({
  label,
  icon: Icon,
  to,
}: {
  label: string;
  icon: typeof Sun;
  to: NavTo;
}) {
  return (
    <Link
      to={to}
      activeOptions={{ exact: to === "/" }}
      aria-current={undefined}
      className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors text-muted-foreground hover:bg-muted hover:text-foreground"
      activeProps={{
        className:
          "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors bg-primary text-primary-foreground font-medium",
      }}
    >
      <Icon className="size-[18px]" strokeWidth={1.8} />
      {label}
    </Link>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const [moreOpen, setMoreOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 hidden w-[248px] flex-col border-r border-border bg-card px-4 py-6 lg:flex">
        <Link to="/" className="flex items-center gap-2.5 px-2">
          <span className="grid size-8 place-items-center rounded-xl bg-primary text-primary-foreground text-[13px] font-semibold">
            LO
          </span>
          <span className="text-[15px] font-semibold tracking-tight">Life OS</span>
        </Link>

        <nav className="mt-8 flex flex-1 flex-col gap-1">
          {primaryNav.map((item) => (
            <NavItem key={item.label} {...item} />
          ))}
          <div className="my-3 h-px bg-border" />
          {secondaryNav.map((item) => (
            <NavItem key={item.label} {...item} />
          ))}
          <div className="mt-auto">
            <NavItem label="Settings" icon={Settings} to="/settings" />
          </div>
        </nav>
      </aside>

      <main className="pb-24 lg:pb-12 lg:pl-[248px]">
        <div className="mx-auto w-full max-w-[1120px] px-4 py-6 sm:px-6 lg:px-10 lg:py-10">
          {children}
        </div>
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-card/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden">
        <ul className="grid grid-cols-5">
          {mobileNav.map(({ label, icon: Icon, to }) => (
            <li key={label}>
              <Link
                to={to}
                activeOptions={{ exact: to === "/" }}
                className="flex w-full flex-col items-center gap-1 py-2.5 text-[11px] text-subtle-foreground"
                activeProps={{
                  className:
                    "flex w-full flex-col items-center gap-1 py-2.5 text-[11px] text-primary font-medium",
                }}
              >
                <Icon className="size-5" strokeWidth={1.8} />
                {label}
              </Link>
            </li>
          ))}
          <li>
            <button
              type="button"
              onClick={() => setMoreOpen(true)}
              aria-haspopup="dialog"
              aria-expanded={moreOpen}
              className="flex w-full flex-col items-center gap-1 py-2.5 text-[11px] text-subtle-foreground"
            >
              <MoreHorizontal className="size-5" strokeWidth={1.8} />
              More
            </button>
          </li>
        </ul>
      </nav>

      {moreOpen ? (
        <div className="fixed inset-0 z-30 lg:hidden">
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setMoreOpen(false)}
            className="absolute inset-0 bg-foreground/30 backdrop-blur-[2px]"
          />
          <div
            role="dialog"
            aria-label="More pages"
            className="absolute inset-x-0 bottom-0 rounded-t-2xl border-t border-border bg-card px-4 pb-[calc(env(safe-area-inset-bottom)+16px)] pt-3"
          >
            <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-border" />
            <nav className="flex flex-col gap-1">
              {moreNav.map((item) => (
                <div key={item.label} onClick={() => setMoreOpen(false)}>
                  <NavItem {...item} />
                </div>
              ))}
            </nav>
          </div>
        </div>
      ) : null}
    </div>
  );
}
