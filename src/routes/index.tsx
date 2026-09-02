import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { Check, ChevronRight, Clock, Trash2 } from "lucide-react";

import { AppShell } from "@/components/life-os/AppShell";
import { ProgressRing } from "@/components/life-os/ProgressRing";
import { useUserProfile } from "@/hooks/use-user-profile";
import { getAppsScriptUrl } from "@/integrations/appscript/client";
import {
  useTasks,
  useToggleTask,
  useDeleteTask,
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
  low: "bg-clear-soft text-clear",
  clear: "bg-clear-soft text-clear",
};

function Chip({ severity }: { severity: Severity }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${severityStyles[severity]}`}
    >
      <span className="size-1.5 rounded-full bg-current" />
      {severityLabel[severity]}
    </span>
  );
}

function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)] transition-shadow hover:shadow-[var(--shadow-card-hover)] ${className}`}
    >
      {children}
    </div>
  );
}

function SectionHeader({
  title,
  aside,
}: {
  title: string;
  aside?: React.ReactNode;
}) {
  return (
    <div className="mb-4 flex items-baseline justify-between gap-2">
      <h2 className="text-base font-semibold tracking-tight">{title}</h2>
      {aside ? (
        <span className="text-xs text-subtle-foreground">{aside}</span>
      ) : null}
    </div>
  );
}

function CheckRow({
  done,
  onToggle,
  onDelete,
  children,
}: {
  done: boolean;
  onToggle: () => void;
  onDelete?: () => void;
  children: React.ReactNode;
}) {
  return (
    <li className="flex items-center justify-between gap-2 border-b border-border py-2.5 last:border-0">
      <button
        type="button"
        role="checkbox"
        aria-checked={done}
        onClick={onToggle}
        className="flex min-h-10 min-w-0 flex-1 items-center gap-3 rounded-lg text-left transition-colors hover:bg-muted/50 p-1"
      >
        <span
          className={`grid size-5 shrink-0 place-items-center rounded-md border transition-colors ${
            done
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border bg-card"
          }`}
        >
          {done ? <Check className="size-3.5" strokeWidth={3} /> : null}
        </span>
        <div className="flex min-w-0 flex-1 items-center justify-between gap-2">
          {children}
        </div>
      </button>
      {onDelete ? (
        <button
          type="button"
          aria-label="Delete item"
          title="Delete"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="shrink-0 rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive active:scale-95"
        >
          <Trash2 className="size-3.5" />
        </button>
      ) : null}
    </li>
  );
}

function Today() {
  const { userName } = useUserProfile();
  const { data: tasks = [] } = useTasks();
  const { data: habits = [] } = useHabits();
  const { data: logs = [] } = useHabitLogs();
  const { data: calendarEvents = [] } = useCalendarEvents();

  const toggleTaskMutation = useToggleTask();
  const deleteTaskMutation = useDeleteTask();
  const toggleHabitMutation = useToggleHabitDay();

  const todayDate = todayISO();

  // Dynamic Time Greeting
  const hour = new Date().getHours();
  const timeGreeting =
    hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  // Check habits done today
  const isHabitDoneToday = (habitId: string) => {
    return logs.some((l) => l.habit_id === habitId && l.log_date === todayDate);
  };

  const completedTasksCount = tasks.filter((t) => t.done).length;
  const completedHabitsCount = habits.filter((h) => isHabitDoneToday(h.id)).length;

  const totalActions = tasks.length + habits.length;
  const completion =
    totalActions > 0
      ? Math.round(((completedTasksCount + completedHabitsCount) / totalActions) * 100)
      : 0;

  // Build dynamic Attention list
  const attentionList = useMemo(() => {
    const list: Array<{ id: string; title: string; detail: string; severity: Severity }> = [];

    // 1. Check Apps Script backend
    if (!getAppsScriptUrl()) {
      list.push({
        id: "att-appscript",
        title: "Google Apps Script not connected",
        detail: "Connect your Web App in Settings to sync with Google Sheets & Calendar.",
        severity: "medium",
      });
    }

    // 2. Urgent / High priority incomplete tasks
    const urgentTasks = tasks.filter((t) => !t.done && t.priority === "High");
    if (urgentTasks.length > 0) {
      list.push({
        id: "att-urgent",
        title: `${urgentTasks.length} high-priority task${urgentTasks.length > 1 ? "s" : ""} pending`,
        detail: urgentTasks.map((t) => t.title).slice(0, 2).join(", "),
        severity: "high",
      });
    }

    // 3. Unlogged habits
    const unloggedHabits = habits.filter((h) => !isHabitDoneToday(h.id));
    if (unloggedHabits.length > 0 && hour >= 18) {
      list.push({
        id: "att-habits-evening",
        title: `${unloggedHabits.length} habit${unloggedHabits.length > 1 ? "s" : ""} to log tonight`,
        detail: "Keep your streaks going before the day ends.",
        severity: "medium",
      });
    }

    // If all clear
    if (list.length === 0) {
      list.push({
        id: "att-clear",
        title: "All critical systems clear",
        detail: "No overdue tasks or calendar conflicts. Focus on deep work.",
        severity: "clear",
      });
    }

    return list;
  }, [tasks, habits, logs]);

  // Top 3 Priorities
  const topPriorities = useMemo(() => {
    return tasks
      .filter((t) => !t.done)
      .slice(0, 3)
      .map((t) => ({
        id: t.id,
        title: t.title,
        meta: `${t.area} · Due ${t.due_date || "today"}`,
        severity: (t.priority === "High" ? "high" : t.priority === "Medium" ? "medium" : "clear") as Severity,
      }));
  }, [tasks]);

  // Today's schedule from Calendar
  const todaySchedule = useMemo(() => {
    return calendarEvents
      .filter((e) => e.event_date === todayDate)
      .map((e) => ({
        id: e.id,
        time: e.time,
        title: e.title,
        kind: e.kind,
        meta: e.meta,
        duration: e.duration,
      }));
  }, [calendarEvents, todayDate]);

  // Upcoming deadlines
  const upcomingDeadlines = useMemo(() => {
    return calendarEvents
      .filter((e) => e.event_date >= todayDate)
      .sort((a, b) => a.event_date.localeCompare(b.event_date))
      .slice(0, 5);
  }, [calendarEvents, todayDate]);

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
            {timeGreeting}, {userName}
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

      <div className="grid min-w-0 gap-5 lg:grid-cols-2">
        <div className="flex min-w-0 flex-col gap-5">
          <Card>
            <SectionHeader
              title="Needs attention"
              aside={
                attentionList.some((a) => a.severity === "high")
                  ? "Action needed"
                  : "All clear"
              }
            />
            <ul className="flex flex-col gap-3">
              {attentionList.map((item) => (
                <li
                  key={item.id}
                  className="flex items-center justify-between gap-4 rounded-xl border border-border p-3.5"
                >
                  <div className="min-w-0">
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
                  onDelete={() => deleteTaskMutation.mutate(t.id)}
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
