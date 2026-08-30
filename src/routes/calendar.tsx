import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { AppShell } from "@/components/life-os/AppShell";
import { Card, SectionHeader, PageHeader } from "@/components/life-os/ui";

const title = "Calendar — Life OS";
const description =
  "Month and week views of events, deadlines, and time blocks — see where your time is committed.";

export const Route = createFileRoute("/calendar")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
  }),
  component: CalendarPage,
});

type CalEvent = { day: number; title: string; kind: "event" | "block" | "deadline" };

const events: CalEvent[] = [
  { day: 3, title: "Study group", kind: "event" },
  { day: 5, title: "Deep work — DBMS", kind: "block" },
  { day: 8, title: "Portfolio review", kind: "deadline" },
  { day: 12, title: "Gym — upper body", kind: "event" },
  { day: 15, title: "Writing block", kind: "block" },
  { day: 19, title: "DBMS lab viva", kind: "deadline" },
  { day: 22, title: "Rent transfer", kind: "deadline" },
  { day: 26, title: "Dentist", kind: "event" },
];

const kindDot: Record<CalEvent["kind"], string> = {
  event: "bg-clear",
  block: "bg-primary",
  deadline: "bg-high",
};

const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const upcoming = [
  { id: "u1", date: "Mon 31 Aug", title: "DBMS lab viva", meta: "10:00 · Building C, Lab 2" },
  { id: "u2", date: "Tue 1 Sep", title: "Rent transfer", meta: "All day · Finance" },
  { id: "u3", date: "Wed 2 Sep", title: "Deep work — Portfolio", meta: "09:00–11:00 · Time block" },
  { id: "u4", date: "Fri 4 Sep", title: "Study group standup", meta: "11:30 · Online" },
];

function CalendarPage() {
  const today = new Date();
  const [monthOffset, setMonthOffset] = useState(0);

  const view = useMemo(
    () => new Date(today.getFullYear(), today.getMonth() + monthOffset, 1),
    [monthOffset],
  );

  const year = view.getFullYear();
  const month = view.getMonth();
  const monthName = view.toLocaleDateString("en-GB", { month: "long", year: "numeric" });
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  // Monday-first offset
  const firstWeekday = (new Date(year, month, 1).getDay() + 6) % 7;
  const cells: (number | null)[] = [
    ...Array.from({ length: firstWeekday }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const isToday = (d: number) =>
    monthOffset === 0 && d === today.getDate();

  return (
    <AppShell>
      <PageHeader
        title="Calendar"
        subtitle="Events, deadlines and time blocks in one place."
        aside={
          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label="Previous month"
              onClick={() => setMonthOffset((m) => m - 1)}
              className="grid size-10 place-items-center rounded-xl border border-border bg-card text-muted-foreground transition-colors hover:bg-muted active:bg-muted"
            >
              <ChevronLeft className="size-4" />
            </button>
            <button
              type="button"
              aria-label="Next month"
              onClick={() => setMonthOffset((m) => m + 1)}
              className="grid size-10 place-items-center rounded-xl border border-border bg-card text-muted-foreground transition-colors hover:bg-muted active:bg-muted"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>
        }
      />

      <div className="grid min-w-0 gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <SectionHeader title={monthName} aside="Dots: event · block · deadline" />
          <div className="grid grid-cols-7 gap-1 text-center">
            {weekDays.map((d) => (
              <div key={d} className="py-1.5 text-[11px] font-medium text-subtle-foreground">
                {d}
              </div>
            ))}
            {cells.map((day, i) => {
              if (day === null) return <div key={`e${i}`} />;
              const dayEvents = monthOffset === 0 ? events.filter((e) => e.day === day) : [];
              return (
                <div
                  key={day}
                  className={`flex min-h-11 flex-col items-center gap-1 rounded-xl py-1.5 text-sm sm:min-h-14 ${
                    isToday(day)
                      ? "bg-primary font-semibold text-primary-foreground"
                      : "text-foreground hover:bg-muted"
                  }`}
                >
                  <span className="tabular">{day}</span>
                  <span className="flex gap-1">
                    {dayEvents.map((e, j) => (
                      <span
                        key={j}
                        title={e.title}
                        className={`size-1.5 rounded-full ${isToday(day) ? "bg-primary-foreground" : kindDot[e.kind]}`}
                      />
                    ))}
                  </span>
                </div>
              );
            })}
          </div>
        </Card>

        <div className="flex min-w-0 flex-col gap-5">
          <Card>
            <SectionHeader title="Coming up" aside="Next 7 days" />
            <ul className="flex flex-col">
              {upcoming.map((u) => (
                <li key={u.id} className="border-b border-border py-3 last:border-0">
                  <p className="text-xs font-medium text-subtle-foreground">{u.date}</p>
                  <p className="mt-1 truncate text-sm font-medium">{u.title}</p>
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">{u.meta}</p>
                </li>
              ))}
            </ul>
          </Card>

          <Card>
            <SectionHeader title="Legend" />
            <ul className="flex flex-col gap-2.5 text-sm">
              <li className="flex items-center gap-2.5">
                <span className="size-2 rounded-full bg-clear" /> Event
              </li>
              <li className="flex items-center gap-2.5">
                <span className="size-2 rounded-full bg-primary" /> Time block
              </li>
              <li className="flex items-center gap-2.5">
                <span className="size-2 rounded-full bg-high" /> Deadline
              </li>
            </ul>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
