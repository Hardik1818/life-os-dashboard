import { createFileRoute } from "@tanstack/react-router";

import { AppShell } from "@/components/life-os/AppShell";
import { Card, SectionHeader, PageHeader } from "@/components/life-os/ui";
import { ProgressRing } from "@/components/life-os/ProgressRing";

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

const weekBars = [
  { day: "Mon", focus: 65 },
  { day: "Tue", focus: 80 },
  { day: "Wed", focus: 45 },
  { day: "Thu", focus: 90 },
  { day: "Fri", focus: 55 },
  { day: "Sat", focus: 30 },
  { day: "Sun", focus: 70 },
];

const insights = [
  {
    id: "i1",
    title: "Focus peaks on Thursdays",
    detail: "You complete 2.3× more deep-work blocks on Thursdays than your weekly average.",
  },
  {
    id: "i2",
    title: "Late tasks cluster on weekends",
    detail: "4 of your last 6 overdue tasks were scheduled for Saturday or Sunday.",
  },
  {
    id: "i3",
    title: "Journal streak lifts mood",
    detail: "On days you journal, your logged mood averages 0.8 points higher.",
  },
];

function InsightsPage() {
  return (
    <AppShell>
      <PageHeader
        title="Insights"
        subtitle="Patterns from the last 4 weeks. Computed locally, never leaves your device."
      />

      <div className="grid min-w-0 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Task completion", value: 78, note: "+6% vs last week" },
          { label: "Habit consistency", value: 64, note: "5-day avg streak" },
          { label: "Focus hours", value: 52, note: "18.5 h this week" },
          { label: "Avg mood", value: 71, note: "Trending up" },
        ].map((s) => (
          <Card key={s.label} className="flex items-center gap-4">
            <ProgressRing value={s.value} size={72} stroke={8} />
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{s.label}</p>
              <p className="mt-1 text-xs text-muted-foreground">{s.note}</p>
            </div>
          </Card>
        ))}
      </div>

      <div className="mt-5 grid min-w-0 gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <SectionHeader title="Focus time by day" aside="Deep-work minutes" />
          <div className="flex h-44 items-end gap-2 sm:gap-3">
            {weekBars.map((b) => (
              <div key={b.day} className="flex min-w-0 flex-1 flex-col items-center gap-2">
                <div
                  className="w-full max-w-10 rounded-t-lg bg-primary/80 transition-all hover:bg-primary"
                  style={{ height: `${b.focus}%` }}
                  title={`${b.day}: ${b.focus}%`}
                />
                <span className="text-[11px] text-subtle-foreground">{b.day}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <SectionHeader title="What the rules noticed" />
          <ul className="flex flex-col gap-3">
            {insights.map((i) => (
              <li key={i.id} className="rounded-xl bg-muted/60 p-3.5">
                <p className="text-sm font-medium">{i.title}</p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{i.detail}</p>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </AppShell>
  );
}
