import { useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import {
  CalendarDays,
  CheckSquare,
  Command,
  LineChart,
  Lock,
  MoreHorizontal,
  NotebookPen,
  Repeat,
  Settings,
  Newspaper,
  Sun,
  HeartPulse,
} from "lucide-react";
import { CommandPalette } from "./CommandPalette";
import { useLockAuth } from "@/hooks/use-lock-auth";

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
  const { lock } = useLockAuth();

  const triggerPalette = () => {
    window.dispatchEvent(new KeyboardEvent("keydown", { key: "k", metaKey: true }));
  };

  return (
    <div className="min-h-screen bg-background">
      <CommandPalette />

      {/* Desktop Sidebar */}
      <aside className="fixed inset-y-0 left-0 hidden w-[248px] flex-col border-r border-border bg-card px-4 py-6 lg:flex">
        <Link to="/" className="flex items-center gap-2.5 px-2">
          <span className="grid size-8 place-items-center rounded-xl bg-primary text-primary-foreground text-[13px] font-semibold">
            LO
          </span>
          <span className="text-[15px] font-semibold tracking-tight">Life OS</span>
        </Link>

        {/* Quick Command Trigger Button */}
        <button
          type="button"
          onClick={triggerPalette}
          className="mt-6 flex items-center justify-between rounded-xl border border-border bg-muted/60 px-3 py-2 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <span className="flex items-center gap-2">
            <Command className="size-3.5" />
            <span>Quick search…</span>
          </span>
          <kbd className="rounded border border-border bg-card px-1.5 py-0.5 text-[10px] font-mono">
            ⌘K
          </kbd>
        </button>

        <nav className="mt-6 flex flex-1 flex-col gap-1">
          {primaryNav.map((item) => (
            <NavItem key={item.label} {...item} />
          ))}
          <div className="my-3 h-px bg-border" />
          {secondaryNav.map((item) => (
            <NavItem key={item.label} {...item} />
          ))}
          <div className="mt-auto flex flex-col gap-1">
            <NavItem label="Settings" icon={Settings} to="/settings" />
            <button
              type="button"
              onClick={lock}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors text-muted-foreground hover:bg-destructive/10 hover:text-destructive text-left"
            >
              <Lock className="size-[18px]" strokeWidth={1.8} />
              <span>Lock Dashboard</span>
            </button>
          </div>
        </nav>
      </aside>

      <main className="pb-24 lg:pb-12 lg:pl-[248px]">
        <div className="mx-auto w-full max-w-[1120px] px-4 py-6 sm:px-6 lg:px-10 lg:py-10">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Navigation Bar */}
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

      {/* Mobile More Sheet */}
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
            <button
              type="button"
              onClick={() => {
                setMoreOpen(false);
                triggerPalette();
              }}
              className="mb-3 flex w-full items-center justify-between rounded-xl border border-border bg-muted/60 px-3 py-2.5 text-xs font-medium text-foreground"
            >
              <span className="flex items-center gap-2">
                <Command className="size-3.5 text-primary" />
                <span>Quick Command Palette (⌘K)</span>
              </span>
              <kbd className="rounded border border-border bg-card px-1.5 py-0.5 font-mono">
                ⌘K
              </kbd>
            </button>
            <nav className="flex flex-col gap-1">
              {moreNav.map((item) => (
                <div key={item.label} onClick={() => setMoreOpen(false)}>
                  <NavItem {...item} />
                </div>
              ))}
              <button
                type="button"
                onClick={() => {
                  setMoreOpen(false);
                  lock();
                }}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors text-destructive hover:bg-destructive/10 text-left"
              >
                <Lock className="size-[18px]" strokeWidth={1.8} />
                <span>Lock Dashboard</span>
              </button>
            </nav>
          </div>
        </div>
      ) : null}
    </div>
  );
}
