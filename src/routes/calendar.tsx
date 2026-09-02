import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Plus, Trash2 } from "lucide-react";

import { AppShell } from "@/components/life-os/AppShell";
import { Card, SectionHeader, PageHeader } from "@/components/life-os/ui";
import {
  useCalendarEvents,
  useAddCalendarEvent,
  useDeleteCalendarEvent,
  type CalendarEventRow,
  todayISO,
} from "@/lib/life-os-queries";

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

const kindDot: Record<CalendarEventRow["kind"], string> = {
  event: "bg-clear",
  block: "bg-primary",
  deadline: "bg-high",
};

const kindLabel: Record<CalendarEventRow["kind"], string> = {
  event: "Event",
  block: "Time block",
  deadline: "Deadline",
};

const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function CalendarPage() {
  const { data: events = [], isLoading } = useCalendarEvents();
  const addEventMutation = useAddCalendarEvent();
  const deleteEventMutation = useDeleteCalendarEvent();

  const today = new Date();
  const [monthOffset, setMonthOffset] = useState(0);
  const [showAddModal, setShowAddModal] = useState(false);

  // Form State
  const [titleInput, setTitleInput] = useState("");
  const [kindInput, setKindInput] = useState<CalendarEventRow["kind"]>("event");
  const [dateInput, setDateInput] = useState(todayISO());
  const [timeInput, setTimeInput] = useState("09:00");
  const [durationInput, setDurationInput] = useState("1 h");
  const [metaInput, setMetaInput] = useState("");

  const view = useMemo(
    () => new Date(today.getFullYear(), today.getMonth() + monthOffset, 1),
    [today, monthOffset],
  );

  const year = view.getFullYear();
  const month = view.getMonth();
  const monthName = view.toLocaleDateString("en-GB", { month: "long", year: "numeric" });
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstWeekday = (new Date(year, month, 1).getDay() + 6) % 7;

  const cells: (number | null)[] = useMemo(() => [
    ...Array.from({ length: firstWeekday }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ], [firstWeekday, daysInMonth]);

  const isToday = (d: number) =>
    monthOffset === 0 && d === today.getDate();

  // Get events for a specific cell day (YYYY-MM-DD)
  const getEventsForDay = (day: number) => {
    const mm = String(month + 1).padStart(2, "0");
    const dd = String(day).padStart(2, "0");
    const targetIso = `${year}-${mm}-${dd}`;
    return events.filter((e) => e.event_date === targetIso);
  };

  // Upcoming events from today onwards
  const upcomingList = useMemo(() => {
    const todayStr = todayISO();
    return [...events]
      .filter((e) => e.event_date >= todayStr)
      .sort((a, b) => a.event_date.localeCompare(b.event_date))
      .slice(0, 5);
  }, [events]);

  const handleAddEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!titleInput.trim()) return;

    addEventMutation.mutate({
      title: titleInput.trim(),
      kind: kindInput,
      event_date: dateInput,
      time: timeInput || "All day",
      duration: durationInput || "-",
      meta: metaInput.trim() || undefined,
    });

    setTitleInput("");
    setMetaInput("");
    setShowAddModal(false);
  };

  return (
    <AppShell>
      <PageHeader
        title="Calendar"
        subtitle="Events, deadlines and time blocks in one place."
        aside={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowAddModal((v) => !v)}
              className="flex items-center gap-1.5 rounded-xl bg-primary px-3.5 py-2 text-xs font-medium text-primary-foreground transition-opacity hover:opacity-90"
            >
              <Plus className="size-4" />
              <span>{showAddModal ? "Cancel" : "Add event"}</span>
            </button>
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

      {showAddModal ? (
        <Card className="mb-5 animate-in fade-in-50 slide-in-from-top-2">
          <SectionHeader title="Schedule new event or deadline" />
          <form onSubmit={handleAddEvent} className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <input
              value={titleInput}
              onChange={(e) => setTitleInput(e.target.value)}
              placeholder="Title (e.g. DBMS Lab Viva)"
              required
              className="min-h-10 rounded-xl border border-border bg-background px-3 text-xs outline-none focus:border-primary sm:col-span-2"
              autoFocus
            />
            <select
              value={kindInput}
              onChange={(e) => setKindInput(e.target.value as CalendarEventRow["kind"])}
              className="min-h-10 rounded-xl border border-border bg-background px-3 text-xs outline-none focus:border-primary"
            >
              <option value="event">Event</option>
              <option value="block">Time Block</option>
              <option value="deadline">Deadline</option>
            </select>
            <input
              type="date"
              value={dateInput}
              onChange={(e) => setDateInput(e.target.value)}
              className="min-h-10 rounded-xl border border-border bg-background px-3 text-xs outline-none focus:border-primary"
            />
            <input
              type="time"
              value={timeInput}
              onChange={(e) => setTimeInput(e.target.value)}
              className="min-h-10 rounded-xl border border-border bg-background px-3 text-xs outline-none focus:border-primary"
            />
            <input
              value={durationInput}
              onChange={(e) => setDurationInput(e.target.value)}
              placeholder="Duration (e.g. 1 h, 45 min)"
              className="min-h-10 rounded-xl border border-border bg-background px-3 text-xs outline-none focus:border-primary"
            />
            <input
              value={metaInput}
              onChange={(e) => setMetaInput(e.target.value)}
              placeholder="Location or detail (optional)"
              className="min-h-10 rounded-xl border border-border bg-background px-3 text-xs outline-none focus:border-primary sm:col-span-2"
            />
            <button
              type="submit"
              disabled={!titleInput.trim() || addEventMutation.isPending}
              className="flex min-h-10 items-center justify-center rounded-xl bg-primary px-4 text-xs font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              Add to Calendar
            </button>
          </form>
        </Card>
      ) : null}

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
              const dayEvents = getEventsForDay(day);
              return (
                <div
                  key={day}
                  className={`flex min-h-11 flex-col items-center gap-1 rounded-xl py-1.5 text-sm sm:min-h-14 transition-colors ${
                    isToday(day)
                      ? "bg-primary font-semibold text-primary-foreground"
                      : "text-foreground hover:bg-muted"
                  }`}
                >
                  <span className="tabular">{day}</span>
                  <span className="flex gap-1">
                    {dayEvents.map((e) => (
                      <span
                        key={e.id}
                        title={`${e.title} (${kindLabel[e.kind]})`}
                        className={`size-1.5 rounded-full ${
                          isToday(day) ? "bg-primary-foreground" : kindDot[e.kind]
                        }`}
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
            <SectionHeader title="Coming up" aside={`${upcomingList.length} scheduled`} />
            {isLoading ? (
              <div className="py-4 text-center text-xs text-subtle-foreground animate-pulse">
                Loading events…
              </div>
            ) : (
              <ul className="flex flex-col">
                {upcomingList.map((u) => (
                  <li key={u.id} className="group flex items-center justify-between border-b border-border py-3 last:border-0">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className={`size-1.5 rounded-full ${kindDot[u.kind]}`} />
                        <p className="text-xs font-medium text-subtle-foreground">{u.event_date}</p>
                      </div>
                      <p className="mt-1 truncate text-sm font-medium">{u.title}</p>
                      <p className="mt-0.5 truncate text-xs text-muted-foreground">
                        {u.time || "All day"} {u.meta ? `· ${u.meta}` : ""}
                      </p>
                    </div>
                    <button
                      type="button"
                      aria-label="Delete event"
                      onClick={() => deleteEventMutation.mutate(u.id)}
                      className="shrink-0 p-2 text-subtle-foreground opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </li>
                ))}
                {upcomingList.length === 0 ? (
                  <li className="py-4 text-center text-xs text-subtle-foreground">
                    No upcoming events.
                  </li>
                ) : null}
              </ul>
            )}
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
