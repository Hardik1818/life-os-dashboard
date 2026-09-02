import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Activity, BedDouble, Brain, Footprints, Plus } from "lucide-react";

import { AppShell } from "@/components/life-os/AppShell";
import { Card, SectionHeader, PageHeader } from "@/components/life-os/ui";
import {
  useHealthLogs,
  useLogHealth,
  todayISO,
  isoDaysAgo,
} from "@/lib/life-os-queries";

const title = "Health & Mood — Life OS";
const description =
  "Log sleep, movement and mood — spot how they shape your days.";

export const Route = createFileRoute("/health")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
  }),
  component: HealthPage,
});

const moodOptions = [
  { level: 1, label: "Rough" },
  { level: 2, label: "Low" },
  { level: 3, label: "Okay" },
  { level: 4, label: "Good" },
  { level: 5, label: "Great" },
];

function HealthPage() {
  const { data: logs = [], isLoading } = useHealthLogs();
  const logHealthMutation = useLogHealth();

  const todayStr = todayISO();
  const todayLog = useMemo(() => logs.find((l) => l.log_date === todayStr), [logs, todayStr]);

  const [showLogModal, setShowLogModal] = useState(false);
  const [sleepHours, setSleepHours] = useState(todayLog ? Math.floor(todayLog.sleep_minutes / 60) : 7);
  const [sleepMins, setSleepMins] = useState(todayLog ? todayLog.sleep_minutes % 60 : 15);
  const [stepsInput, setStepsInput] = useState(todayLog ? todayLog.steps : 6840);
  const [workoutsInput, setWorkoutsInput] = useState(todayLog ? todayLog.workouts : 1);
  const [selectedMood, setSelectedMood] = useState<number>(todayLog ? todayLog.mood_rating : 4);
  const [stressLevel, setStressLevel] = useState<"low" | "medium" | "high">(todayLog?.stress_level ?? "low");

  // Calculate 7-day mood histogram (Mon-Sun or past 7 days)
  const last7DaysMood = useMemo(() => {
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    return Array.from({ length: 7 }, (_, i) => {
      const dayDate = isoDaysAgo(6 - i);
      const d = new Date(dayDate);
      const dayName = dayNames[d.getDay()];
      const log = logs.find((l) => l.log_date === dayDate);
      return {
        day: dayName,
        date: dayDate,
        level: log ? log.mood_rating : 3,
      };
    });
  }, [logs]);

  // Derived weekly stats
  const weeklyAvgSleep = useMemo(() => {
    const last7 = logs.slice(0, 7);
    if (last7.length === 0) return "7 h 00 m";
    const avgMinutes = Math.round(last7.reduce((sum, l) => sum + l.sleep_minutes, 0) / last7.length);
    const h = Math.floor(avgMinutes / 60);
    const m = avgMinutes % 60;
    return `${h} h ${m} m`;
  }, [logs]);

  const weeklyWorkouts = useMemo(() => {
    const last7 = logs.slice(0, 7);
    return last7.reduce((sum, l) => sum + (l.workouts || 0), 0);
  }, [logs]);

  const todaySteps = todayLog?.steps ?? stepsInput;

  const handleSaveHealth = (e: React.FormEvent) => {
    e.preventDefault();
    const totalSleepMinutes = Number(sleepHours) * 60 + Number(sleepMins);
    logHealthMutation.mutate({
      log_date: todayStr,
      sleep_minutes: totalSleepMinutes,
      steps: Number(stepsInput),
      workouts: Number(workoutsInput),
      mood_rating: selectedMood,
      stress_level: stressLevel,
    });
    setShowLogModal(false);
  };

  const handleQuickMood = (level: number) => {
    setSelectedMood(level);
    const totalSleepMinutes = Number(sleepHours) * 60 + Number(sleepMins);
    logHealthMutation.mutate({
      log_date: todayStr,
      sleep_minutes: totalSleepMinutes,
      steps: Number(stepsInput),
      workouts: Number(workoutsInput),
      mood_rating: level,
      stress_level: stressLevel,
    });
  };

  return (
    <AppShell>
      <PageHeader
        title="Health & Mood"
        subtitle="Small daily check-ins, long-term patterns."
        aside={
          <button
            type="button"
            onClick={() => setShowLogModal((v) => !v)}
            className="flex items-center gap-1.5 rounded-xl bg-primary px-3.5 py-2 text-xs font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            <Plus className="size-4" />
            <span>{showLogModal ? "Close" : "Log today's metrics"}</span>
          </button>
        }
      />

      {showLogModal ? (
        <Card className="mb-5 animate-in fade-in-50 slide-in-from-top-2">
          <SectionHeader title="Log Health Metrics for Today" />
          <form onSubmit={handleSaveHealth} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className="block text-xs text-subtle-foreground mb-1">Sleep (Hours & Minutes)</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  min={0}
                  max={24}
                  value={sleepHours}
                  onChange={(e) => setSleepHours(Number(e.target.value))}
                  placeholder="Hrs"
                  className="w-full min-h-10 rounded-xl border border-border bg-background px-3 text-xs outline-none focus:border-primary"
                />
                <input
                  type="number"
                  min={0}
                  max={59}
                  value={sleepMins}
                  onChange={(e) => setSleepMins(Number(e.target.value))}
                  placeholder="Min"
                  className="w-full min-h-10 rounded-xl border border-border bg-background px-3 text-xs outline-none focus:border-primary"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-subtle-foreground mb-1">Steps Today</label>
              <input
                type="number"
                min={0}
                value={stepsInput}
                onChange={(e) => setStepsInput(Number(e.target.value))}
                placeholder="e.g. 8000"
                className="w-full min-h-10 rounded-xl border border-border bg-background px-3 text-xs outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-xs text-subtle-foreground mb-1">Workouts Today</label>
              <input
                type="number"
                min={0}
                max={10}
                value={workoutsInput}
                onChange={(e) => setWorkoutsInput(Number(e.target.value))}
                className="w-full min-h-10 rounded-xl border border-border bg-background px-3 text-xs outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-xs text-subtle-foreground mb-1">Stress Level</label>
              <select
                value={stressLevel}
                onChange={(e) => setStressLevel(e.target.value as "low" | "medium" | "high")}
                className="w-full min-h-10 rounded-xl border border-border bg-background px-3 text-xs outline-none focus:border-primary"
              >
                <option value="low">Low stress</option>
                <option value="medium">Medium stress</option>
                <option value="high">High stress</option>
              </select>
            </div>

            <div className="sm:col-span-2 lg:col-span-4 flex justify-end">
              <button
                type="submit"
                disabled={logHealthMutation.isPending}
                className="min-h-10 rounded-xl bg-primary px-5 text-xs font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                Save today&apos;s check-in
              </button>
            </div>
          </form>
        </Card>
      ) : null}

      <div className="grid min-w-0 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="flex items-center gap-4">
          <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary-soft text-accent-foreground">
            <BedDouble className="size-5" strokeWidth={1.8} />
          </span>
          <div className="min-w-0">
            <p className="truncate text-xs text-subtle-foreground">Sleep</p>
            <p className="tabular mt-0.5 truncate text-lg font-semibold">{weeklyAvgSleep}</p>
            <p className="truncate text-xs text-muted-foreground">Avg past 7 days</p>
          </div>
        </Card>

        <Card className="flex items-center gap-4">
          <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary-soft text-accent-foreground">
            <Footprints className="size-5" strokeWidth={1.8} />
          </span>
          <div className="min-w-0">
            <p className="truncate text-xs text-subtle-foreground">Steps</p>
            <p className="tabular mt-0.5 truncate text-lg font-semibold">{todaySteps.toLocaleString()}</p>
            <p className="truncate text-xs text-muted-foreground">Today · goal 8,000</p>
          </div>
        </Card>

        <Card className="flex items-center gap-4">
          <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary-soft text-accent-foreground">
            <Activity className="size-5" strokeWidth={1.8} />
          </span>
          <div className="min-w-0">
            <p className="truncate text-xs text-subtle-foreground">Workouts</p>
            <p className="tabular mt-0.5 truncate text-lg font-semibold">{weeklyWorkouts}</p>
            <p className="truncate text-xs text-muted-foreground">This week · goal 4</p>
          </div>
        </Card>

        <Card className="flex items-center gap-4">
          <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary-soft text-accent-foreground">
            <Brain className="size-5" strokeWidth={1.8} />
          </span>
          <div className="min-w-0">
            <p className="truncate text-xs text-subtle-foreground">Stress check-in</p>
            <p className="tabular mt-0.5 truncate text-lg font-semibold capitalize">{todayLog?.stress_level ?? "Low"}</p>
            <p className="truncate text-xs text-muted-foreground">Current state</p>
          </div>
        </Card>
      </div>

      <div className="mt-5 grid min-w-0 gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <SectionHeader title="Mood trend (Past 7 Days)" aside="1 = rough · 5 = great" />
          {isLoading ? (
            <div className="py-12 text-center text-xs text-subtle-foreground animate-pulse">
              Loading mood history…
            </div>
          ) : (
            <div className="flex h-44 items-end gap-2 sm:gap-3 pt-4">
              {last7DaysMood.map((m) => (
                <div key={m.date} className="flex min-w-0 flex-1 flex-col items-center gap-2">
                  <span className="tabular text-xs font-medium text-muted-foreground">{m.level}</span>
                  <div
                    className="w-full max-w-10 rounded-t-lg bg-clear/80 transition-all hover:bg-clear"
                    style={{ height: `${m.level * 18}%` }}
                    title={`${m.day} (${m.date}): ${m.level}/5`}
                  />
                  <span className="text-[11px] text-subtle-foreground">{m.day}</span>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card>
          <SectionHeader title="How are you right now?" />
          <div className="flex flex-col gap-2">
            {moodOptions.map((o) => (
              <button
                key={o.level}
                type="button"
                aria-pressed={selectedMood === o.level}
                onClick={() => handleQuickMood(o.level)}
                className={`flex min-h-11 items-center justify-between rounded-xl border px-4 text-sm transition-colors ${
                  selectedMood === o.level
                    ? "border-primary bg-primary-soft font-medium text-accent-foreground shadow-sm"
                    : "border-border bg-card text-muted-foreground hover:bg-muted"
                }`}
              >
                {o.label}
                <span className="tabular text-xs text-subtle-foreground">{o.level}/5</span>
              </button>
            ))}
          </div>
          {todayLog ? (
            <p className="mt-3 text-center text-xs text-clear">
              Logged for today. Thanks for checking in.
            </p>
          ) : null}
        </Card>
      </div>
    </AppShell>
  );
}
