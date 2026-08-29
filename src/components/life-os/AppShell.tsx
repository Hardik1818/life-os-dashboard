import type { ReactNode } from "react";
import {
  CalendarDays,
  CheckSquare,
  LineChart,
  MoreHorizontal,
  NotebookPen,
  Repeat,
  Settings,
  Share2,
  Sun,
  HeartPulse,
} from "lucide-react";

const primaryNav = [
  { label: "Today", icon: Sun, active: true },
  { label: "Calendar", icon: CalendarDays },
  { label: "Tasks", icon: CheckSquare },
  { label: "Insights", icon: LineChart },
];

const secondaryNav = [
  { label: "Journal", icon: NotebookPen },
  { label: "Habits", icon: Repeat },
  { label: "Health & Mood", icon: HeartPulse },
  { label: "Social", icon: Share2 },
];

const mobileNav = [
  { label: "Today", icon: Sun, active: true },
  { label: "Calendar", icon: CalendarDays },
  { label: "Tasks", icon: CheckSquare },
  { label: "Insights", icon: LineChart },
  { label: "More", icon: MoreHorizontal },
];

function NavItem({
  label,
  icon: Icon,
  active,
}: {
  label: string;
  icon: typeof Sun;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      aria-current={active ? "page" : undefined}
      className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors ${
        active
          ? "bg-primary text-primary-foreground font-medium"
          : "text-muted-foreground hover:bg-muted hover:text-foreground"
      }`}
    >
      <Icon className="size-[18px]" strokeWidth={active ? 2.2 : 1.8} />
      {label}
    </button>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 hidden w-[248px] flex-col border-r border-border bg-card px-4 py-6 lg:flex">
        <div className="flex items-center gap-2.5 px-2">
          <span className="grid size-8 place-items-center rounded-xl bg-primary text-primary-foreground text-[13px] font-semibold">
            LO
          </span>
          <span className="text-[15px] font-semibold tracking-tight">Life OS</span>
        </div>

        <nav className="mt-8 flex flex-1 flex-col gap-1">
          {primaryNav.map((item) => (
            <NavItem key={item.label} {...item} />
          ))}
          <div className="my-3 h-px bg-border" />
          {secondaryNav.map((item) => (
            <NavItem key={item.label} {...item} />
          ))}
          <div className="mt-auto">
            <NavItem label="Settings" icon={Settings} />
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
          {mobileNav.map(({ label, icon: Icon, active }) => (
            <li key={label}>
              <button
                type="button"
                aria-current={active ? "page" : undefined}
                className={`flex w-full flex-col items-center gap-1 py-2.5 text-[11px] ${
                  active ? "text-primary font-medium" : "text-subtle-foreground"
                }`}
              >
                <Icon className="size-5" strokeWidth={active ? 2.3 : 1.8} />
                {label}
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
