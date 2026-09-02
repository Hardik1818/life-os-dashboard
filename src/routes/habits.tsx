import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Check, Flame, Plus, Trash2 } from "lucide-react";

import { AppShell } from "@/components/life-os/AppShell";
import { Card, SectionHeader, PageHeader } from "@/components/life-os/ui";
import { getAppsScriptUrl } from "@/integrations/appscript/client";
import {
  useHabits,
  useHabitLogs,
  useAddHabit,
  useToggleHabitDay,
  useDeleteHabit,
  streakFor,
  todayISO,
} from "@/lib/life-os-queries";

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

function getWeekDays() {
  const now = new Date();
  const dayOfWeek = (now.getDay() + 6) % 7; // 0 = Mon, 6 = Sun
  const monday = new Date(now);
  monday.setDate(now.getDate() - dayOfWeek);

  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return {
      label: ["M", "T", "W", "T", "F", "S", "S"][i],
      fullLabel: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][i],
      dateISO: d.toISOString().slice(0, 10),
      isToday: i === dayOfWeek,
    };
  });
}

function HabitsPage() {
  const { data: habits = [], isLoading: habitsLoading } = useHabits();
  const { data: logs = [], isLoading: logsLoading } = useHabitLogs();
  const addHabitMutation = useAddHabit();
  const toggleHabitMutation = useToggleHabitDay();
  const deleteHabitMutation = useDeleteHabit();

  const isConnected = !!getAppsScriptUrl();

  const [draftTitle, setDraftTitle] = useState("");
  const [draftCue, setDraftCue] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);

  const weekDays = useMemo(() => getWeekDays(), []);
  const todayDate = todayISO();

  const handleAddHabit = (e: React.FormEvent) => {
    e.preventDefault();
    const title = draftTitle.trim();
    if (!title) return;
    addHabitMutation.mutate({
      title,
      cue: draftCue.trim(),
    });
    setDraftTitle("");
    setDraftCue("");
    setShowAddForm(false);
  };

  const isLogged = (habitId: string, date: string) => {
    return logs.some((l) => l.habit_id === habitId && l.log_date === date);
  };

  return (
    <AppShell>
      <PageHeader
        title="Habits"
        subtitle="Streaks are just numbers. Showing up is the goal."
        aside={
          <button
            type="button"
            onClick={() => setShowAddForm((v) => !v)}
            className="flex items-center gap-1.5 rounded-xl bg-primary px-3.5 py-2 text-xs font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            <Plus className="size-4" />
            <span>{showAddForm ? "Cancel" : "New habit"}</span>
          </button>
        }
      />

      {showAddForm ? (
        <Card className="mb-5 animate-in fade-in-50 slide-in-from-top-2">
          <SectionHeader title="Create a new habit" />
          <form onSubmit={handleAddHabit} className="flex flex-col gap-3 sm:flex-row">
            <input
              value={draftTitle}
              onChange={(e) => setDraftTitle(e.target.value)}
              placeholder="Habit title (e.g. Read 20 mins)"
              className="min-h-11 min-w-0 flex-1 rounded-xl border border-border bg-background px-3.5 text-sm outline-none placeholder:text-subtle-foreground focus:border-primary"
              autoFocus
            />
            <input
              value={draftCue}
              onChange={(e) => setDraftCue(e.target.value)}
              placeholder="Cue (e.g. With morning tea)"
              className="min-h-11 min-w-0 flex-1 rounded-xl border border-border bg-background px-3.5 text-sm outline-none placeholder:text-subtle-foreground focus:border-primary"
            />
            <button
              type="submit"
              disabled={!draftTitle.trim() || addHabitMutation.isPending}
              className="min-h-11 rounded-xl bg-primary px-5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              Add
            </button>
          </form>
        </Card>
      ) : null}

      <Card>
        <SectionHeader
          title="This week"
          aside={isConnected ? "Synced to Google Sheets · Tap a day to log" : "Local-first · Tap a day to log"}
        />

        {habitsLoading || logsLoading ? (
          <div className="py-8 text-center text-sm text-subtle-foreground animate-pulse">
            Loading your habits…
          </div>
        ) : (
          <ul className="flex flex-col">
            {habits.map((h) => {
              const streak = streakFor(h.id, logs);
              const doneToday = isLogged(h.id, todayDate);

              return (
                <li key={h.id} className="group border-b border-border py-3.5 last:border-0">
                  <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
                    <button
                      type="button"
                      aria-pressed={doneToday}
                      onClick={() =>
                        toggleHabitMutation.mutate({
                          habitId: h.id,
                          date: todayDate,
                          logged: doneToday,
                        })
                      }
                      className="flex min-w-0 flex-1 items-center gap-3 text-left transition-colors hover:opacity-80"
                    >
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
                        {h.cue ? (
                          <span className="mt-0.5 block truncate text-xs text-subtle-foreground">
                            {h.cue}
                          </span>
                        ) : null}
                      </span>
                    </button>

                    <div className="flex items-center justify-between gap-3 pl-8 sm:justify-end sm:pl-0">
                      <div className="flex gap-1.5" role="group" aria-label={`Weekly logs for ${h.title}`}>
                        {weekDays.map((day) => {
                          const logged = isLogged(h.id, day.dateISO);
                          return (
                            <button
                              key={day.dateISO}
                              type="button"
                              title={`${day.fullLabel} (${day.dateISO}): ${logged ? "Done" : "Not logged"}`}
                              onClick={() =>
                                toggleHabitMutation.mutate({
                                  habitId: h.id,
                                  date: day.dateISO,
                                  logged,
                                })
                              }
                              className={`grid size-7 place-items-center rounded-lg text-[10px] font-medium transition-all ${
                                logged
                                  ? "bg-primary text-primary-foreground shadow-sm"
                                  : "bg-muted text-subtle-foreground hover:bg-muted/80"
                              } ${
                                day.isToday
                                  ? "ring-2 ring-primary ring-offset-2 ring-offset-card"
                                  : ""
                              }`}
                            >
                              {day.label}
                            </button>
                          );
                        })}
                      </div>

                      <span className="tabular flex w-12 shrink-0 items-center justify-end gap-1 text-xs text-muted-foreground">
                        <Flame
                          className={`size-3.5 ${streak > 0 ? "text-medium" : "text-subtle-foreground"}`}
                        />
                        {streak} d
                      </span>

                      {/* Delete Habit Button */}
                      <button
                        type="button"
                        aria-label={`Delete habit ${h.title}`}
                        title="Delete habit"
                        onClick={() => deleteHabitMutation.mutate(h.id)}
                        className="shrink-0 rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive active:scale-95"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </div>
                </li>
              );
            })}
            {habits.length === 0 ? (
              <li className="py-8 text-center text-sm text-subtle-foreground">
                No habits added yet. Click &ldquo;New habit&rdquo; to begin.
              </li>
            ) : null}
          </ul>
        )}
      </Card>
    </AppShell>
  );
}
