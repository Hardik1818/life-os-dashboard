import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Check, ChevronRight, Clock } from "lucide-react";

import { AppShell } from "@/components/life-os/AppShell";
import { ProgressRing } from "@/components/life-os/ProgressRing";
import {
  attentionItems,
  deadlines,
  habits as seedHabits,
  priorities,
  schedule,
  severityLabel,
  tasks as seedTasks,
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
  const [tasks, setTasks] = useState(seedTasks);
  const [habits, setHabits] = useState(seedHabits);

  const completion = useMemo(() => {
    const items = [...tasks, ...habits];
    return (items.filter((i) => i.done).length / items.length) * 100;
  }, [tasks, habits]);

  const today = new Date().toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <AppShell>
      <header className="mb-7 flex flex-wrap items-end justify-between gap-5">
        <div>
          <p className="text-sm text-subtle-foreground">{today}</p>
          <h1 className="mt-1 text-[28px] font-semibold tracking-tight">Good morning, Hardik</h1>
          <p className="mt-1.5 max-w-md text-sm text-muted-foreground">
            Three things need your attention. Everything else can wait.
          </p>
        </div>
        <div className="flex items-center gap-4 rounded-2xl border border-border bg-card px-5 py-3 shadow-[var(--shadow-card)]">
          <ProgressRing value={completion} label="logged" />
          <div className="text-sm">
            <p className="font-medium">Day so far</p>
            <p className="tabular mt-1 text-muted-foreground">
              {tasks.filter((t) => t.done).length}/{tasks.length} tasks
            </p>
            <p className="tabular text-muted-foreground">
              {habits.filter((h) => h.done).length}/{habits.length} habits
            </p>
          </div>
        </div>
      </header>

      <div className="grid min-w-0 gap-5 lg:grid-cols-3">
        <div className="flex min-w-0 flex-col gap-5 lg:col-span-2">
          <Card>
            <SectionHeader title="Needs attention" aside="Rule-based · always offline" />
            <ul className="flex flex-col gap-2.5">
              {attentionItems.map((item) => (
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
              {priorities.map((p, i) => (
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
              ))}
            </ol>
          </Card>

          <Card>
            <SectionHeader title="Today's schedule" aside="Events + time blocks" />
            <ul className="flex flex-col">
              {schedule.map((s) => (
                <li
                  key={s.id}
                  className="flex items-center gap-3 border-b border-border py-3.5 last:border-0 sm:gap-4 sm:py-3"
                >
                  <span className="tabular w-11 shrink-0 text-sm text-muted-foreground sm:w-12">
                    {s.time}
                  </span>
                  <span
                    className={`h-8 w-1 shrink-0 rounded-full ${
                      s.kind === "block" ? "bg-primary" : "bg-clear"
                    }`}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{s.title}</p>
                    <p className="mt-0.5 text-xs text-subtle-foreground">
                      {s.kind === "block" ? "Time block" : "Event"}
                    </p>
                  </div>
                  <span className="tabular flex shrink-0 items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="size-3.5" /> {s.duration}
                  </span>
                </li>
              ))}
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
              {tasks.map((t) => (
                <CheckRow
                  key={t.id}
                  done={t.done}
                  onToggle={() =>
                    setTasks((prev) =>
                      prev.map((x) => (x.id === t.id ? { ...x, done: !x.done } : x)),
                    )
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
            </ul>
          </Card>

          <Card>
            <SectionHeader title="Habits" aside="Streaks are just numbers" />
            <ul className="flex flex-col">
              {habits.map((h) => (
                <CheckRow
                  key={h.id}
                  done={h.done}
                  onToggle={() =>
                    setHabits((prev) =>
                      prev.map((x) =>
                        x.id === h.id
                          ? { ...x, done: !x.done, streak: x.done ? x.streak : x.streak + 1 }
                          : x,
                      ),
                    )
                  }
                >
                  <span className={`truncate text-sm ${h.done ? "text-subtle-foreground" : ""}`}>
                    {h.title}
                  </span>
                  <span className="tabular shrink-0 text-[11px] text-subtle-foreground">
                    {h.streak} d
                  </span>
                </CheckRow>
              ))}
            </ul>
          </Card>

          <Card>
            <SectionHeader title="Upcoming" aside="Next 5 days" />
            <ul className="flex flex-col gap-2">
              {deadlines.map((d) => (
                <li key={d.id} className="flex items-center justify-between gap-3 py-1.5">
                  <span className="truncate text-sm">{d.title}</span>
                  <span className="shrink-0 text-xs text-muted-foreground">{d.when}</span>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
