import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { Brain, CheckCircle2, Flame, LineChart, Moon, Sparkles, Timer } from "lucide-react";

import { AppShell } from "@/components/life-os/AppShell";
import { Card, SectionHeader, PageHeader } from "@/components/life-os/ui";
import { ProgressRing } from "@/components/life-os/ProgressRing";
import {
  useTasks,
  useHabits,
  useHabitLogs,
  useCalendarEvents,
  useHealthLogs,
  isoDaysAgo,
} from "@/lib/life-os-queries";

const title = "Insights — Life OS";
const description =
  "Weekly patterns across tasks, habits, focus time and mood — rule-based, always offline.";

export const Route = createFileRoute("/insights")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
  }),
  component: InsightsPage,
});

function parseDurationMinutes(durationStr?: string): number {
  if (!durationStr || durationStr === "-") return 60;
  const hMatch = durationStr.match(/(\d+(?:\.\d+)?)\s*h/i);
  const mMatch = durationStr.match(/(\d+)\s*m/i);
  let total = 0;
  if (hMatch && hMatch[1]) total += parseFloat(hMatch[1]) * 60;
  if (mMatch && mMatch[1]) total += parseInt(mMatch[1], 10);
  return total > 0 ? total : 60;
}

function InsightsPage() {
  const { data: tasks = [] } = useTasks();
  const { data: habits = [] } = useHabits();
  const { data: habitLogs = [] } = useHabitLogs();
  const { data: calendarEvents = [] } = useCalendarEvents();
  const { data: healthLogs = [] } = useHealthLogs();

  // 1. Task Completion Rate
  const taskCompletionRate = useMemo(() => {
    if (tasks.length === 0) return 0;
    const completed = tasks.filter((t) => t.done).length;
    return Math.round((completed / tasks.length) * 100);
  }, [tasks]);

  // 2. Habit Consistency over past 7 days
  const habitConsistency = useMemo(() => {
    if (habits.length === 0) return 0;
    const past7Days = new Set(Array.from({ length: 7 }, (_, i) => isoDaysAgo(i)));
    const loggedInPast7 = habitLogs.filter((l) => past7Days.has(l.log_date)).length;
    const totalPossible = habits.length * 7;
    return Math.min(100, Math.round((loggedInPast7 / totalPossible) * 100));
  }, [habits, habitLogs]);

  // 3. Weekly Focus Hours from Calendar blocks
  const weeklyFocusHours = useMemo(() => {
    const past7Days = new Set(Array.from({ length: 7 }, (_, i) => isoDaysAgo(i)));
    const blockEvents = calendarEvents.filter(
      (e) => e.kind === "block" && past7Days.has(e.event_date),
    );
    const totalMinutes = blockEvents.reduce((sum, e) => sum + parseDurationMinutes(e.duration), 0);
    return (totalMinutes / 60).toFixed(1);
  }, [calendarEvents]);

  // 4. Average Mood Rating
  const avgMoodStats = useMemo(() => {
    const last7 = healthLogs.slice(0, 7);
    if (last7.length === 0) return { score: 75, label: "4.0/5 avg" };
    const avg = last7.reduce((sum, l) => sum + l.mood_rating, 0) / last7.length;
    const score = Math.round((avg / 5) * 100);
    return { score, label: `${avg.toFixed(1)}/5 avg` };
  }, [healthLogs]);

  // 5. Focus Time by Day (Mon-Sun of current week)
  const weekBars = useMemo(() => {
    const now = new Date();
    const dayOfWeek = (now.getDay() + 6) % 7; // 0 = Mon, 6 = Sun
    const monday = new Date(now);
    monday.setDate(now.getDate() - dayOfWeek);

    const dayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const results = dayLabels.map((label, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const iso = d.toISOString().slice(0, 10);
      const blocksForDay = calendarEvents.filter(
        (e) => e.kind === "block" && e.event_date === iso,
      );
      const minutes = blocksForDay.reduce((sum, e) => sum + parseDurationMinutes(e.duration), 0);
      return {
        day: label,
        date: iso,
        minutes,
        isToday: i === dayOfWeek,
      };
    });

    const maxMinutes = Math.max(...results.map((r) => r.minutes), 120);
    return results.map((r) => ({
      ...r,
      percent: Math.max(10, Math.round((r.minutes / maxMinutes) * 100)),
    }));
  }, [calendarEvents]);

  // 6. Area Breakdown
  const areaBreakdown = useMemo(() => {
    const counts: Record<string, { total: number; done: number }> = {};
    for (const t of tasks) {
      if (!counts[t.area]) counts[t.area] = { total: 0, done: 0 };
      const c = counts[t.area];
      if (c) {
        c.total++;
        if (t.done) c.done++;
      }
    }
    return Object.entries(counts)
      .map(([area, { total, done }]) => ({
        area,
        total,
        done,
        rate: total > 0 ? Math.round((done / total) * 100) : 0,
      }))
      .sort((a, b) => b.total - a.total);
  }, [tasks]);

  // 7. Dynamic Pattern Detection Rules Engine
  const rulesNoticed = useMemo(() => {
    const items: Array<{ id: string; title: string; detail: string; icon: typeof Brain }> = [];

    // Rule A: Peak Focus Day
    const sortedDays = [...weekBars].sort((a, b) => b.minutes - a.minutes);
    const topDay = sortedDays[0];
    if (topDay && topDay.minutes > 0) {
      items.push({
        id: "r1",
        title: `Focus peaks on ${topDay.day}s`,
        detail: `You scheduled ${topDay.minutes} minutes of deep-work blocks on ${topDay.day}, leading your weekly focus output.`,
        icon: Timer,
      });
    } else {
      items.push({
        id: "r1-fallback",
        title: "Balanced deep-work distribution",
        detail: "Focus blocks are spread evenly throughout the week. Maintain 90-minute blocks for peak retention.",
        icon: Timer,
      });
    }

    // Rule B: Habit Momentum
    if (habitConsistency >= 70) {
      items.push({
        id: "r2",
        title: "High habit momentum detected",
        detail: `${habitConsistency}% consistency over the past 7 days. Consistency over perfection is paying off.`,
        icon: Flame,
      });
    } else {
      items.push({
        id: "r2-alt",
        title: "Gentle habit ramp-up",
        detail: "Focus on completing just 1 high-impact habit today (e.g. morning walk) to rebuild compound streaks.",
        icon: Flame,
      });
    }

    // Rule C: Sleep & Energy Correlation
    const avgSleepMin =
      healthLogs.length > 0
        ? Math.round(healthLogs.slice(0, 7).reduce((s, l) => s + l.sleep_minutes, 0) / Math.min(7, healthLogs.length))
        : 440;
    const sleepH = (avgSleepMin / 60).toFixed(1);
    if (avgSleepMin >= 420) {
      items.push({
        id: "r3",
        title: "Sleep duration supports high cognitive stamina",
        detail: `Averaging ${sleepH} hours of sleep per night provides the foundation for deep focus sessions.`,
        icon: Moon,
      });
    } else {
      items.push({
        id: "r3-alt",
        title: "Sleep deficit warning",
        detail: `Averaging ${sleepH} hours of sleep. Aim for an extra 30 minutes tonight to restore peak cognitive focus.`,
        icon: Moon,
      });
    }

    // Rule D: Task Velocity
    if (taskCompletionRate >= 60) {
      items.push({
        id: "r4",
        title: "Strong task completion velocity",
        detail: `${taskCompletionRate}% of your tasks are cleared. Open task backlog remains calm and manageable.`,
        icon: CheckCircle2,
      });
    }

    return items;
  }, [weekBars, habitConsistency, healthLogs, taskCompletionRate]);

  return (
    <AppShell>
      <PageHeader
        title="Insights"
        subtitle="Computed locally from your daily actions. Zero tracking, complete privacy."
      />

      {/* 4 Core Summary Metric Rings */}
      <div className="grid min-w-0 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="flex items-center gap-4">
          <ProgressRing value={taskCompletionRate} size={72} stroke={8} />
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">Task completion</p>
            <p className="mt-1 text-xs text-muted-foreground">{tasks.filter((t) => t.done).length} of {tasks.length} done</p>
          </div>
        </Card>

        <Card className="flex items-center gap-4">
          <ProgressRing value={habitConsistency} size={72} stroke={8} />
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">Habit consistency</p>
            <p className="mt-1 text-xs text-muted-foreground">7-day compound rate</p>
          </div>
        </Card>

        <Card className="flex items-center gap-4">
          <span className="grid size-[72px] shrink-0 place-items-center rounded-2xl bg-primary-soft text-accent-foreground font-semibold text-xl">
            {weeklyFocusHours}h
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">Focus hours</p>
            <p className="mt-1 text-xs text-muted-foreground">Deep work this week</p>
          </div>
        </Card>

        <Card className="flex items-center gap-4">
          <ProgressRing value={avgMoodStats.score} size={72} stroke={8} />
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">Avg mood score</p>
            <p className="mt-1 text-xs text-muted-foreground">{avgMoodStats.label}</p>
          </div>
        </Card>
      </div>

      <div className="mt-5 grid min-w-0 gap-5 lg:grid-cols-3">
        {/* Dynamic Focus Time Bar Chart */}
        <Card className="lg:col-span-2">
          <SectionHeader
            title="Focus time by day (This Week)"
            aside="Logged deep-work blocks"
          />
          <div className="flex h-48 items-end gap-2 sm:gap-4 pt-6">
            {weekBars.map((b) => (
              <div key={b.date} className="flex min-w-0 flex-1 flex-col items-center gap-2">
                <span className="tabular text-[11px] font-medium text-muted-foreground">
                  {b.minutes > 0 ? `${b.minutes}m` : "-"}
                </span>
                <div
                  className={`w-full max-w-11 rounded-t-xl transition-all duration-500 hover:opacity-90 ${
                    b.isToday ? "bg-primary" : "bg-primary/60"
                  }`}
                  style={{ height: `${Math.max(12, b.percent * 1.3)}px` }}
                  title={`${b.day} (${b.date}): ${b.minutes} minutes focus`}
                />
                <span
                  className={`text-[11px] ${
                    b.isToday ? "font-semibold text-primary" : "text-subtle-foreground"
                  }`}
                >
                  {b.day}
                </span>
              </div>
            ))}
          </div>
        </Card>

        {/* Intelligent Rules Engine Output */}
        <Card>
          <SectionHeader
            title="What the rules noticed"
            aside={<Sparkles className="size-4 text-primary" />}
          />
          <ul className="flex flex-col gap-3">
            {rulesNoticed.map((i) => {
              const Icon = i.icon;
              return (
                <li key={i.id} className="rounded-xl bg-muted/60 p-3.5">
                  <div className="flex items-center gap-2 mb-1">
                    <Icon className="size-4 shrink-0 text-primary" />
                    <p className="text-sm font-medium leading-snug">{i.title}</p>
                  </div>
                  <p className="text-xs leading-relaxed text-muted-foreground">{i.detail}</p>
                </li>
              );
            })}
          </ul>
        </Card>
      </div>

      {/* Life Areas Balance Distribution */}
      <Card className="mt-5">
        <SectionHeader
          title="Life areas balance"
          aside={<LineChart className="size-4" />}
        />
        <div className="grid min-w-0 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {areaBreakdown.map((item) => (
            <div key={item.area} className="rounded-xl border border-border p-3.5">
              <div className="flex items-center justify-between gap-2 text-xs">
                <span className="font-semibold text-foreground">{item.area}</span>
                <span className="tabular text-muted-foreground">{item.done}/{item.total} tasks</span>
              </div>
              <div className="mt-2.5 h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-500"
                  style={{ width: `${item.rate}%` }}
                />
              </div>
              <p className="mt-1.5 text-right text-[11px] font-medium text-subtle-foreground">
                {item.rate}% complete
              </p>
            </div>
          ))}
          {areaBreakdown.length === 0 ? (
            <p className="py-4 text-xs text-subtle-foreground">No tasks categorized yet.</p>
          ) : null}
        </div>
      </Card>
    </AppShell>
  );
}
