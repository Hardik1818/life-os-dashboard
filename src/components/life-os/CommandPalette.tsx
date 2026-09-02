import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  CalendarDays,
  CheckSquare,
  Flame,
  HeartPulse,
  LineChart,
  Moon,
  Newspaper,
  NotebookPen,
  Plus,
  Search,
  Settings,
  Sun,
  X,
} from "lucide-react";
import { useAddTask, useAddJournalEntry, useLogHealth, todayISO } from "@/lib/life-os-queries";

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [quickMode, setQuickMode] = useState<"nav" | "task" | "journal">("nav");
  const [feedback, setFeedback] = useState<string | null>(null);

  const navigate = useNavigate();
  const addTask = useAddTask();
  const addJournal = useAddJournalEntry();
  const logHealth = useLogHealth();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.key === "k" || e.key === "K") && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
      if (e.key === "Escape") {
        setOpen(false);
      }
    };

    window.addEventListener("keydown", down);
    return () => window.removeEventListener("keydown", down);
  }, []);

  const navItems = [
    { label: "Go to Today Dashboard", to: "/", icon: Sun },
    { label: "Go to Calendar & Blocks", to: "/calendar", icon: CalendarDays },
    { label: "Go to Tasks & Areas", to: "/tasks", icon: CheckSquare },
    { label: "Go to Habits & Streaks", to: "/habits", icon: Flame },
    { label: "Go to Journal & Moods", to: "/journal", icon: NotebookPen },
    { label: "Go to Health & Sleep", to: "/health", icon: HeartPulse },
    { label: "Go to Insights & Analytics", to: "/insights", icon: LineChart },
    { label: "Go to Curated News & Digests", to: "/news", icon: Newspaper },
    { label: "Go to Settings & Apps Script Sync", to: "/settings", icon: Settings },
  ];

  const filteredNav = navItems.filter((item) =>
    item.label.toLowerCase().includes(query.toLowerCase()),
  );

  const handleSelectNav = (to: string) => {
    navigate({ to });
    setOpen(false);
    setQuery("");
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    addTask.mutate({
      title: query.trim(),
      area: "Personal",
      priority: "Medium",
    });
    setFeedback("Task added!");
    setQuery("");
    setTimeout(() => {
      setFeedback(null);
      setOpen(false);
    }, 1200);
  };

  const handleCreateJournal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    addJournal.mutate({
      body: query.trim(),
      mood: "Focused",
      entryDate: todayISO(),
    });
    setFeedback("Thought saved to journal!");
    setQuery("");
    setTimeout(() => {
      setFeedback(null);
      setOpen(false);
    }, 1200);
  };

  const handleQuickMood = (rating: number) => {
    logHealth.mutate({
      log_date: todayISO(),
      sleep_minutes: 420,
      steps: 7000,
      workouts: 1,
      mood_rating: rating,
      stress_level: "low",
    });
    setFeedback(`Mood ${rating}/5 logged for today!`);
    setTimeout(() => {
      setFeedback(null);
      setOpen(false);
    }, 1200);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-foreground/30 p-4 pt-20 backdrop-blur-sm animate-in fade-in-50">
      <div
        className="w-full max-w-lg overflow-hidden rounded-2xl border border-border bg-card shadow-2xl animate-in zoom-in-95"
        role="dialog"
        aria-modal="true"
        aria-label="Command Palette"
      >
        {/* Search / Input Header */}
        <div className="flex items-center border-b border-border px-4 py-3">
          <Search className="size-4 shrink-0 text-subtle-foreground" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={
              quickMode === "task"
                ? "Type task title and press Enter…"
                : quickMode === "journal"
                ? "Type a quick journal thought and press Enter…"
                : "Type a command or search pages…"
            }
            className="ml-3 w-full bg-transparent text-sm font-medium outline-none placeholder:text-subtle-foreground"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                if (quickMode === "task") handleCreateTask(e);
                else if (quickMode === "journal") handleCreateJournal(e);
                else if (filteredNav[0]) handleSelectNav(filteredNav[0].to);
              }
            }}
          />
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="rounded-lg p-1 text-subtle-foreground hover:bg-muted"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Quick Action Mode Selector */}
        <div className="flex gap-1 border-b border-border bg-muted/40 p-2 text-xs">
          <button
            type="button"
            onClick={() => setQuickMode("nav")}
            className={`rounded-lg px-2.5 py-1 font-medium transition-colors ${
              quickMode === "nav" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"
            }`}
          >
            Search Pages
          </button>
          <button
            type="button"
            onClick={() => setQuickMode("task")}
            className={`flex items-center gap-1 rounded-lg px-2.5 py-1 font-medium transition-colors ${
              quickMode === "task" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"
            }`}
          >
            <Plus className="size-3" /> Quick Add Task
          </button>
          <button
            type="button"
            onClick={() => setQuickMode("journal")}
            className={`flex items-center gap-1 rounded-lg px-2.5 py-1 font-medium transition-colors ${
              quickMode === "journal" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"
            }`}
          >
            <NotebookPen className="size-3" /> Quick Note
          </button>
        </div>

        {/* Feedback Message */}
        {feedback ? (
          <div className="p-4 text-center text-sm font-medium text-clear animate-in fade-in">
            {feedback}
          </div>
        ) : null}

        {/* Content Section */}
        {!feedback ? (
          <div className="max-h-72 overflow-y-auto p-2">
            {quickMode === "nav" ? (
              <div className="flex flex-col gap-0.5">
                <p className="px-2 py-1 text-[11px] font-semibold uppercase tracking-wider text-subtle-foreground">
                  Navigation
                </p>
                {filteredNav.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.to}
                      type="button"
                      onClick={() => handleSelectNav(item.to)}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm text-foreground transition-colors hover:bg-primary-soft hover:text-accent-foreground"
                    >
                      <Icon className="size-4 text-subtle-foreground" />
                      <span className="flex-1">{item.label}</span>
                    </button>
                  );
                })}
                {filteredNav.length === 0 ? (
                  <p className="py-4 text-center text-xs text-subtle-foreground">
                    No matching pages found.
                  </p>
                ) : null}

                <div className="my-2 h-px bg-border" />
                <p className="px-2 py-1 text-[11px] font-semibold uppercase tracking-wider text-subtle-foreground">
                  Quick Mood Check-in
                </p>
                <div className="grid grid-cols-5 gap-1.5 p-1">
                  {[
                    { val: 1, label: "Rough" },
                    { val: 2, label: "Low" },
                    { val: 3, label: "Okay" },
                    { val: 4, label: "Good" },
                    { val: 5, label: "Great" },
                  ].map((m) => (
                    <button
                      key={m.val}
                      type="button"
                      onClick={() => handleQuickMood(m.val)}
                      className="rounded-lg border border-border p-1.5 text-center text-xs font-medium hover:bg-muted"
                    >
                      <span className="block">{m.val}/5</span>
                      <span className="block text-[10px] text-subtle-foreground">{m.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : quickMode === "task" ? (
              <div className="p-3 text-xs text-muted-foreground">
                <p className="font-medium text-foreground">Press Enter to create task with default Personal area.</p>
                <p className="mt-1">You can organize priority and areas anytime in the Tasks view.</p>
              </div>
            ) : (
              <div className="p-3 text-xs text-muted-foreground">
                <p className="font-medium text-foreground">Press Enter to save this thought into your Daily Journal.</p>
              </div>
            )}
          </div>
        ) : null}

        {/* Footer shortcuts hint */}
        <div className="flex items-center justify-between border-t border-border bg-muted/30 px-3.5 py-2 text-[11px] text-subtle-foreground">
          <span>Navigate with <kbd className="rounded border bg-card px-1 font-mono">↑</kbd> <kbd className="rounded border bg-card px-1 font-mono">↓</kbd></span>
          <span>Open with <kbd className="rounded border bg-card px-1 font-mono">⌘ K</kbd></span>
        </div>
      </div>
    </div>
  );
}
