import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Activity, BedDouble, Brain, Footprints } from "lucide-react";

import { AppShell } from "@/components/life-os/AppShell";
import { Card, SectionHeader, PageHeader } from "@/components/life-os/ui";

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

const stats = [
  { id: "sleep", icon: BedDouble, label: "Sleep", value: "7 h 12 m", note: "Avg this week · +20 min" },
  { id: "steps", icon: Footprints, label: "Steps", value: "6,840", note: "Today · goal 8,000" },
  { id: "workouts", icon: Activity, label: "Workouts", value: "3", note: "This week · goal 4" },
  { id: "stress", icon: Brain, label: "Stress check-ins", value: "2 low", note: "Last 7 days" },
];

const moodWeek = [
  { day: "Mon", level: 3 },
  { day: "Tue", level: 4 },
  { day: "Wed", level: 2 },
  { day: "Thu", level: 4 },
  { day: "Fri", level: 3 },
  { day: "Sat", level: 5 },
  { day: "Sun", level: 4 },
];

const moodOptions = [
  { level: 1, label: "Rough" },
  { level: 2, label: "Low" },
  { level: 3, label: "Okay" },
  { level: 4, label: "Good" },
  { level: 5, label: "Great" },
];

function HealthPage() {
  const [mood, setMood] = useState<number | null>(null);

  return (
    <AppShell>
      <PageHeader
        title="Health & Mood"
        subtitle="Small daily check-ins, long-term patterns."
      />

      <div className="grid min-w-0 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.id} className="flex items-center gap-4">
            <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary-soft text-accent-foreground">
              <s.icon className="size-5" strokeWidth={1.8} />
            </span>
            <div className="min-w-0">
              <p className="truncate text-xs text-subtle-foreground">{s.label}</p>
              <p className="tabular mt-0.5 truncate text-lg font-semibold">{s.value}</p>
              <p className="truncate text-xs text-muted-foreground">{s.note}</p>
            </div>
          </Card>
        ))}
      </div>

      <div className="mt-5 grid min-w-0 gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <SectionHeader title="Mood this week" aside="1 = rough · 5 = great" />
          <div className="flex h-44 items-end gap-2 sm:gap-3">
            {moodWeek.map((m) => (
              <div key={m.day} className="flex min-w-0 flex-1 flex-col items-center gap-2">
                <span className="tabular text-xs font-medium text-muted-foreground">{m.level}</span>
                <div
                  className="w-full max-w-10 rounded-t-lg bg-clear/80 transition-all hover:bg-clear"
                  style={{ height: `${m.level * 18}%` }}
                />
                <span className="text-[11px] text-subtle-foreground">{m.day}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <SectionHeader title="How are you right now?" />
          <div className="flex flex-col gap-2">
            {moodOptions.map((o) => (
              <button
                key={o.level}
                type="button"
                aria-pressed={mood === o.level}
                onClick={() => setMood(o.level)}
                className={`flex min-h-11 items-center justify-between rounded-xl border px-4 text-sm transition-colors ${
                  mood === o.level
                    ? "border-primary bg-primary-soft font-medium text-accent-foreground"
                    : "border-border bg-card text-muted-foreground hover:bg-muted"
                }`}
              >
                {o.label}
                <span className="tabular text-xs text-subtle-foreground">{o.level}/5</span>
              </button>
            ))}
          </div>
          {mood !== null ? (
            <p className="mt-3 text-center text-xs text-clear">
              Logged. Thanks for checking in.
            </p>
          ) : null}
        </Card>
      </div>
    </AppShell>
  );
}
