import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { Check, ChevronRight, Clock } from "lucide-react";

import { AppShell } from "@/components/life-os/AppShell";
import { ProgressRing } from "@/components/life-os/ProgressRing";
import { getAppsScriptUrl } from "@/integrations/appscript/client";
import {
  useTasks,
  useToggleTask,
  useHabits,
  useHabitLogs,
  useToggleHabitDay,
  useCalendarEvents,
  streakFor,
  todayISO,
} from "@/lib/life-os-queries";
import {
  severityLabel,
  type Severity,
} from "@/components/life-os/today-data";

const title = "Today — Life OS";
const description =
  "A calm daily dashboard: what needs attention, your top three priorities, today's schedule, tasks and habits — all in one glance.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
  }),
  component: Today,
});

const severityStyles: Record<Severity, string> = {
  high: "bg-high-soft text-high",
  medium: "bg-medium-soft text-medium",
  low: "bg-low-soft text-low",
  clear: "bg-clear-soft text-clear",
};

const severityBar: Record<Severity, string> = {
  high: "bg-high",
  medium: "bg-medium",
  low: "bg-low",
  clear: "bg-clear",
};

function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)] ${className}`}
    >
      {children}
    </section>
  );
}

function SectionHeader({ title, aside }: { title: string; aside?: React.ReactNode }) {
  return (
    <header className="mb-4 flex items-center justify-between gap-3">
      <h2 className="min-w-0 truncate text-[17px] font-semibold tracking-tight">{title}</h2>
      {aside ? (
        <div className="hidden shrink-0 text-xs text-subtle-foreground sm:block">{aside}</div>
      ) : null}
    </header>
  );
}

function Chip({ severity }: { severity: Severity }) {
  return (
    <span
      className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${severityStyles[severity]}`}
    >
      {severityLabel[severity]}
    </span>
  );
}

function CheckRow({
  done,
  onToggle,
  children,
}: {
  done: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <li>
      <button
        type="button"
        onClick={onToggle}
        aria-pressed={done}
        className="flex min-h-11 w-full items-center gap-3 rounded-xl px-2 py-2 text-left transition-colors hover:bg-muted active:bg-muted"
      >
        <span
          className={`grid size-5 shrink-0 place-items-center rounded-md border transition-colors ${
            done ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card"
          }`}
        >
          {done ? <Check className="size-3.5" strokeWidth={3} /> : null}
        </span>
        <span className="flex min-w-0 flex-1 items-center justify-between gap-3">{children}</span>
      </button>
    </li>
  );
}

function Today() {
  const { data: tasks = [] } = useTasks();
  const { data: habits = [] } = useHabits();
  const { data: logs = [] } = useHabitLogs();
  const { data: calendarEvents = [] } = useCalendarEvents();

  const toggleTaskMutation = useToggleTask();
  const toggleHabitMutation = useToggleHabitDay();

  const isConnected = !!getAppsScriptUrl();
  const todayDate = todayISO();

  // Habit completion today
  const isHabitDoneToday = (habitId: string) =>
    logs.some((l) => l.habit_id === habitId && l.log_date === todayDate);

  const completedTasksCount = useMemo(() => tasks.filter((t) => t.done).length, [tasks]);
  const completedHabitsCount = useMemo(
    () => habits.filter((h) => isHabitDoneToday(h.id)).length,
    [habits, logs, todayDate],
  );

  const completion = useMemo(() => {
    const totalItems = tasks.length + habits.length;
    if (totalItems === 0) return 0;
    return Math.round(((completedTasksCount + completedHabitsCount) / totalItems) * 100);
  }, [tasks.length, habits.length, completedTasksCount, completedHabitsCount]);

  // Derived today's schedule from Calendar events
  const todaySchedule = useMemo(() => {
    return calendarEvents
      .filter((e) => e.event_date === todayDate)
      .sort((a, b) => (a.time || "").localeCompare(b.time || ""));
  }, [calendarEvents, todayDate]);

  // Derived upcoming deadlines (next 7 days)
  const upcomingDeadlines = useMemo(() => {
    return calendarEvents
      .filter((e) => e.event_date > todayDate)
      .sort((a, b) => a.event_date.localeCompare(b.event_date))
      .slice(0, 5);
  }, [calendarEvents, todayDate]);

  // Derive dynamic Priorities from high/medium open tasks
  const topPriorities = useMemo(() => {
    const open = tasks.filter((t) => !t.done);
    const sorted = [...open].sort((a, b) => {
      const pMap = { High: 0, Medium: 1, Low: 2 };
      return pMap[a.priority] - pMap[b.priority];
    });
    return sorted.slice(0, 3).map((t) => ({
      id: t.id,
      title: t.title,
      meta: `${t.area} · Due ${t.due_date || "Today"}`,
      severity: (t.priority === "High" ? "high" : t.priority === "Medium" ? "medium" : "low") as Severity,
    }));
  }, [tasks]);

  // Derived Attention Items
  const attentionList = useMemo(() => {
    const items: Array<{ id: string; title: string; detail: string; severity: Severity }> = [];
    
    // Check overdue/high priority tasks
    const highTasks = tasks.filter((t) => !t.done && t.priority === "High");
    const firstHighTask = highTasks[0];
    if (firstHighTask) {
      items.push({
        id: "att-high",
        title: firstHighTask.title,
        detail: `High priority · ${firstHighTask.area}`,
        severity: "high",
      });
    }

    // Check habits not yet logged
    const unloggedHabits = habits.filter((h) => !isHabitDoneToday(h.id));
    const firstUnlogged = unloggedHabits[0];
    if (firstUnlogged) {
      items.push({
        id: "att-habits",
        title: `${unloggedHabits.length} habits pending for today`,
        detail: `Next up: ${firstUnlogged.title} (${firstUnlogged.cue || "Daily"})`,
        severity: "medium",
      });
    }

    // Check deadlines today
    const deadlinesToday = calendarEvents.filter((e) => e.event_date === todayDate && e.kind === "deadline");
    const firstDeadline = deadlinesToday[0];
    if (firstDeadline) {
      items.push({
        id: "att-deadline",
        title: `Deadline today: ${firstDeadline.title}`,
        detail: firstDeadline.meta || "Scheduled for today",
        severity: "high",
      });
    }

    if (items.length === 0) {
      items.push({
        id: "att-clear",
        title: "All priority actions clear",
        detail: "You are on track for today. Take a restful break.",
        severity: "clear",
      });
    }

    return items;
  }, [tasks, habits, logs, calendarEvents, todayDate]);

  const todayHeader = new Date().toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <AppShell>
      <header className="mb-7 flex flex-wrap items-end justify-between gap-5">
        <div>
          <p className="text-sm text-subtle-foreground">{todayHeader}</p>
          <h1 className="mt-1 text-[28px] font-semibold tracking-tight">
            Good morning, Hardik
          </h1>
          <p className="mt-1.5 max-w-md text-sm text-muted-foreground">
            {attentionList.length > 0
              ? `${attentionList.length} items to keep in mind. Everything else can wait.`
              : "Everything is calm and clear today."}
          </p>
        </div>
        <div className="flex items-center gap-4 rounded-2xl border border-border bg-card px-5 py-3 shadow-[var(--shadow-card)]">
          <ProgressRing value={completion} label="logged" />
          <div className="text-sm">
            <p className="font-medium">Day so far</p>
            <p className="tabular mt-1 text-muted-foreground">
              {completedTasksCount}/{tasks.length} tasks
            </p>
            <p className="tabular text-muted-foreground">
              {completedHabitsCount}/{habits.length} habits
            </p>
          </div>
        </div>
      </header>

      <div className="grid min-w-0 gap-5 lg:grid-cols-3">
        <div className="flex min-w-0 flex-col gap-5 lg:col-span-2">
          <Card>
            <SectionHeader
              title="Needs attention"
              aside={isConnected ? "Google Sheets active · Live rules" : "Local mode · Always offline"}
            />
            <ul className="flex flex-col gap-2.5">
              {attentionList.map((item) => (
                <li
                  key={item.id}
                  className="flex items-center gap-3 overflow-hidden rounded-xl bg-muted/60 pr-3"
                >
                  <span className={`h-full w-1 shrink-0 self-stretch ${severityBar[item.severity]}`} />
                  <div className="min-w-0 flex-1 py-3">
                    <p className="truncate text-sm font-medium">{item.title}</p>
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">{item.detail}</p>
                  </div>
                  <span className="shrink-0">
                    <Chip severity={item.severity} />
                  </span>
                </li>
              ))}
            </ul>
          </Card>

          <Card>
            <SectionHeader title="Top 3 priorities" />
            <ol className="flex flex-col gap-3">
              {topPriorities.length > 0 ? (
                topPriorities.map((p, i) => (
                  <li
                    key={p.id}
                    className="flex items-center gap-3 rounded-xl border border-border p-4 transition-shadow hover:shadow-[var(--shadow-lift)] sm:gap-4"
                  >
                    <span className="tabular grid size-8 shrink-0 place-items-center rounded-full bg-primary-soft text-sm font-semibold text-accent-foreground">
                      {i + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[15px] font-medium">{p.title}</p>
                      <p className="mt-0.5 truncate text-xs text-muted-foreground">{p.meta}</p>
                    </div>
                    <span className="shrink-0">
                      <Chip severity={p.severity} />
                    </span>
                    <ChevronRight className="hidden size-4 shrink-0 text-subtle-foreground sm:block" />
                  </li>
                ))
              ) : (
                <li className="py-4 text-center text-sm text-subtle-foreground">
                  No open priority tasks. Great job!
                </li>
              )}
            </ol>
          </Card>

          <Card>
            <SectionHeader title="Today's schedule" aside="Events + time blocks" />
            <ul className="flex flex-col">
              {todaySchedule.map((s) => (
                <li
                  key={s.id}
                  className="flex items-center gap-3 border-b border-border py-3.5 last:border-0 sm:gap-4 sm:py-3"
                >
                  <span className="tabular w-12 shrink-0 text-sm text-muted-foreground">
                    {s.time || "All day"}
                  </span>
                  <span
                    className={`h-8 w-1 shrink-0 rounded-full ${
                      s.kind === "block" ? "bg-primary" : s.kind === "deadline" ? "bg-high" : "bg-clear"
                    }`}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{s.title}</p>
                    <p className="mt-0.5 text-xs text-subtle-foreground">
                      {s.kind === "block" ? "Time block" : s.kind === "deadline" ? "Deadline" : "Event"}{" "}
                      {s.meta ? `· ${s.meta}` : ""}
                    </p>
                  </div>
                  {s.duration && s.duration !== "-" ? (
                    <span className="tabular flex shrink-0 items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="size-3.5" /> {s.duration}
                    </span>
                  ) : null}
                </li>
              ))}
              {todaySchedule.length === 0 ? (
                <li className="py-4 text-center text-xs text-subtle-foreground">
                  No calendar events scheduled for today.
                </li>
              ) : null}
            </ul>
          </Card>
        </div>

        <div className="flex min-w-0 flex-col gap-5">
          <Card>
            <SectionHeader
              title="Tasks"
              aside={`${tasks.filter((t) => !t.done).length} left`}
            />
            <ul className="flex flex-col">
              {tasks.slice(0, 6).map((t) => (
                <CheckRow
                  key={t.id}
                  done={t.done}
                  onToggle={() =>
                    toggleTaskMutation.mutate({ id: t.id, done: !t.done })
                  }
                >
                  <span
                    className={`truncate text-sm ${
                      t.done ? "text-subtle-foreground line-through" : ""
                    }`}
                  >
                    {t.title}
                  </span>
                  <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">
                    {t.priority}
                  </span>
                </CheckRow>
              ))}
              {tasks.length === 0 ? (
                <li className="py-4 text-center text-xs text-subtle-foreground">
                  No tasks for today.
                </li>
              ) : null}
            </ul>
          </Card>

          <Card>
            <SectionHeader title="Habits" aside="Streaks are just numbers" />
            <ul className="flex flex-col">
              {habits.map((h) => {
                const done = isHabitDoneToday(h.id);
                const streak = streakFor(h.id, logs);
                return (
                  <CheckRow
                    key={h.id}
                    done={done}
                    onToggle={() =>
                      toggleHabitMutation.mutate({
                        habitId: h.id,
                        date: todayDate,
                        logged: done,
                      })
                    }
                  >
                    <span className={`truncate text-sm ${done ? "text-subtle-foreground" : ""}`}>
                      {h.title}
                    </span>
                    <span className="tabular shrink-0 text-[11px] text-subtle-foreground">
                      {streak} d
                    </span>
                  </CheckRow>
                );
              })}
              {habits.length === 0 ? (
                <li className="py-4 text-center text-xs text-subtle-foreground">
                  No habits configured.
                </li>
              ) : null}
            </ul>
          </Card>

          <Card>
            <SectionHeader title="Upcoming" aside="Next 5 items" />
            <ul className="flex flex-col gap-2">
              {upcomingDeadlines.map((d) => (
                <li key={d.id} className="flex items-center justify-between gap-3 py-1.5">
                  <div className="min-w-0 flex-1">
                    <span className="truncate block text-sm font-medium">{d.title}</span>
                    <span className="truncate block text-xs text-subtle-foreground">
                      {d.meta || (d.kind === "block" ? "Time block" : d.kind === "deadline" ? "Deadline" : "Event")}
                    </span>
                  </div>
                  <span className="shrink-0 text-xs text-muted-foreground">{d.event_date}</span>
                </li>
              ))}
              {upcomingDeadlines.length === 0 ? (
                <li className="py-3 text-center text-xs text-subtle-foreground">
                  No upcoming deadlines.
                </li>
              ) : null}
            </ul>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
