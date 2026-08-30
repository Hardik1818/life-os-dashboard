import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Check, Plus } from "lucide-react";

import { AppShell } from "@/components/life-os/AppShell";
import { Card, SectionHeader, PageHeader } from "@/components/life-os/ui";
import type { Severity } from "@/components/life-os/today-data";

const title = "Tasks — Life OS";
const description =
  "All your tasks with priorities, due dates and life areas — filter, add and check off.";

export const Route = createFileRoute("/tasks")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
  }),
  component: TasksPage,
});

type Task = {
  id: string;
  title: string;
  area: string;
  priority: "High" | "Medium" | "Low";
  due: string;
  done: boolean;
};

const seedTasks: Task[] = [
  { id: "t1", title: "Finish DBMS normalization assignment", area: "College", priority: "High", due: "Overdue", done: false },
  { id: "t2", title: "Draft portfolio case study intro", area: "Portfolio", priority: "Medium", due: "Tomorrow", done: false },
  { id: "t3", title: "Call the clinic to move the appointment", area: "Health", priority: "Low", due: "Today", done: false },
  { id: "t4", title: "Reply to internship email", area: "Career", priority: "Medium", due: "Today", done: false },
  { id: "t5", title: "Read 20 pages — Deep Work", area: "Growth", priority: "Low", due: "Today", done: false },
  { id: "t6", title: "Export last month's expenses", area: "Finance", priority: "Medium", due: "Fri", done: false },
  { id: "t7", title: "Water the plants", area: "Home", priority: "Low", due: "Today", done: true },
  { id: "t8", title: "Renew library books", area: "College", priority: "Low", due: "Sat", done: false },
];

const priorityStyles: Record<Task["priority"], string> = {
  High: "bg-high-soft text-high",
  Medium: "bg-medium-soft text-medium",
  Low: "bg-low-soft text-low",
};

const filters = ["All", "Open", "Done"] as const;

function TasksPage() {
  const [tasks, setTasks] = useState(seedTasks);
  const [filter, setFilter] = useState<(typeof filters)[number]>("All");
  const [draft, setDraft] = useState("");

  const visible = useMemo(
    () =>
      tasks.filter((t) =>
        filter === "All" ? true : filter === "Open" ? !t.done : t.done,
      ),
    [tasks, filter],
  );

  const addTask = () => {
    const text = draft.trim();
    if (!text) return;
    setTasks((prev) => [
      { id: `t${Date.now()}`, title: text, area: "Personal", priority: "Medium", due: "Today", done: false },
      ...prev,
    ]);
    setDraft("");
  };

  return (
    <AppShell>
      <PageHeader
        title="Tasks"
        subtitle={`${tasks.filter((t) => !t.done).length} open across ${new Set(tasks.map((t) => t.area)).size} life areas.`}
      />

      <Card>
        <SectionHeader
          title="All tasks"
          aside="Local state for now — backend later"
        />
        <form
          className="mb-4 flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            addTask();
          }}
        >
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Add a task…"
            aria-label="New task"
            className="min-h-11 min-w-0 flex-1 rounded-xl border border-border bg-background px-3.5 text-sm outline-none placeholder:text-subtle-foreground focus:border-primary"
          />
          <button
            type="submit"
            className="grid min-h-11 shrink-0 place-items-center gap-1 rounded-xl bg-primary px-4 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 sm:flex sm:items-center"
          >
            <Plus className="size-4" />
            <span className="hidden sm:inline">Add</span>
          </button>
        </form>

        <div className="mb-4 flex gap-1.5" role="tablist" aria-label="Filter tasks">
          {filters.map((f) => (
            <button
              key={f}
              type="button"
              role="tab"
              aria-selected={filter === f}
              onClick={() => setFilter(f)}
              className={`min-h-9 rounded-full px-3.5 text-xs font-medium transition-colors ${
                filter === f
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        <ul className="flex flex-col">
          {visible.map((t) => (
            <li key={t.id}>
              <button
                type="button"
                aria-pressed={t.done}
                onClick={() =>
                  setTasks((prev) =>
                    prev.map((x) => (x.id === t.id ? { ...x, done: !x.done } : x)),
                  )
                }
                className="flex min-h-11 w-full items-center gap-3 rounded-xl px-2 py-2 text-left transition-colors hover:bg-muted active:bg-muted"
              >
                <span
                  className={`grid size-5 shrink-0 place-items-center rounded-md border transition-colors ${
                    t.done ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card"
                  }`}
                >
                  {t.done ? <Check className="size-3.5" strokeWidth={3} /> : null}
                </span>
                <span className="min-w-0 flex-1">
                  <span
                    className={`block truncate text-sm ${
                      t.done ? "text-subtle-foreground line-through" : ""
                    }`}
                  >
                    {t.title}
                  </span>
                  <span className="mt-0.5 block truncate text-xs text-subtle-foreground">
                    {t.area} · {t.due}
                  </span>
                </span>
                <span
                  className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-medium ${priorityStyles[t.priority]}`}
                >
                  {t.priority}
                </span>
              </button>
            </li>
          ))}
          {visible.length === 0 ? (
            <li className="py-8 text-center text-sm text-subtle-foreground">
              Nothing here. Enjoy the quiet.
            </li>
          ) : null}
        </ul>
      </Card>
    </AppShell>
  );
}
