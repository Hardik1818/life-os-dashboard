import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Check, Flame } from "lucide-react";

import { AppShell } from "@/components/life-os/AppShell";
import { Card, SectionHeader, PageHeader } from "@/components/life-os/ui";

const title = "Habits — Life OS";
const description =
  "Track daily habits with gentle streaks — consistency over perfection.";

export const Route = createFileRoute("/habits")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
  }),
  component: HabitsPage,
});

type Habit = {
  id: string;
  title: string;
  cue: string;
  streak: number;
  week: boolean[]; // Mon–Sun
};

const seedHabits: Habit[] = [
  { id: "h1", title: "Morning walk", cue: "After waking, 15 min", streak: 12, week: [true, true, true, true, true, false, true] },
  { id: "h2", title: "Read 20 minutes", cue: "With morning tea", streak: 5, week: [true, true, false, true, true, true, false] },
  { id: "h3", title: "No phone before bed", cue: "Phone charges outside bedroom", streak: 0, week: [false, true, false, false, true, false, false] },
  { id: "h4", title: "Journal", cue: "Before bed", streak: 3, week: [true, false, true, true, false, false, false] },
  { id: "h5", title: "Stretch 5 minutes", cue: "After each study block", streak: 8, week: [true, true, true, false, true, true, true] },
];

const weekDays = ["M", "T", "W", "T", "F", "S", "S"];

function HabitsPage() {
  const [habits, setHabits] = useState(seedHabits);
  const todayIdx = (new Date().getDay() + 6) % 7;

  const toggleToday = (id: string) =>
    setHabits((prev) =>
      prev.map((h) => {
        if (h.id !== id) return h;
        const done = h.week[todayIdx];
        const week = h.week.map((v, i) => (i === todayIdx ? !v : v));
        return { ...h, week, streak: done ? Math.max(0, h.streak - 1) : h.streak + 1 };
      }),
    );

  return (
    <AppShell>
      <PageHeader
        title="Habits"
        subtitle="Streaks are just numbers. Showing up is the goal."
      />

      <Card>
        <SectionHeader title="This week" aside="Tap a row to log today" />
        <ul className="flex flex-col">
          {habits.map((h) => {
            const doneToday = h.week[todayIdx];
            return (
              <li key={h.id}>
                <button
                  type="button"
                  aria-pressed={doneToday}
                  onClick={() => toggleToday(h.id)}
                  className="flex w-full flex-col gap-3 rounded-xl px-2 py-3.5 text-left transition-colors hover:bg-muted active:bg-muted sm:flex-row sm:items-center sm:gap-4"
                >
                  <span className="flex min-w-0 flex-1 items-center gap-3">
                    <span
                      className={`grid size-5 shrink-0 place-items-center rounded-md border transition-colors ${
                        doneToday
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-card"
                      }`}
                    >
                      {doneToday ? <Check className="size-3.5" strokeWidth={3} /> : null}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-medium">{h.title}</span>
                      <span className="mt-0.5 block truncate text-xs text-subtle-foreground">
                        {h.cue}
                      </span>
                    </span>
                  </span>
                  <span className="flex items-center justify-between gap-4 pl-8 sm:justify-end sm:pl-0">
                    <span className="flex gap-1.5">
                      {h.week.map((v, i) => (
                        <span
                          key={i}
                          title={weekDays[i]}
                          className={`grid size-6 place-items-center rounded-md text-[10px] font-medium ${
                            v
                              ? "bg-primary-soft text-accent-foreground"
                              : "bg-muted text-subtle-foreground"
                          } ${i === todayIdx ? "ring-2 ring-primary ring-offset-1 ring-offset-card" : ""}`}
                        >
                          {weekDays[i]}
                        </span>
                      ))}
                    </span>
                    <span className="tabular flex w-14 shrink-0 items-center justify-end gap-1 text-xs text-muted-foreground">
                      <Flame className={`size-3.5 ${h.streak > 0 ? "text-medium" : "text-subtle-foreground"}`} />
                      {h.streak} d
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </Card>
    </AppShell>
  );
}
