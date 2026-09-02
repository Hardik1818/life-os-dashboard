import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Check, Plus, Trash2 } from "lucide-react";

import { AppShell } from "@/components/life-os/AppShell";
import { Card, SectionHeader, PageHeader } from "@/components/life-os/ui";
import { getAppsScriptUrl } from "@/integrations/appscript/client";
import {
  useTasks,
  useAddTask,
  useToggleTask,
  useDeleteTask,
  type TaskRow,
} from "@/lib/life-os-queries";

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

const priorityStyles: Record<TaskRow["priority"], string> = {
  High: "bg-high-soft text-high",
  Medium: "bg-medium-soft text-medium",
  Low: "bg-low-soft text-low",
};

const filters = ["All", "Open", "Done"] as const;
const areas = ["Personal", "College", "Portfolio", "Health", "Career", "Finance", "Home", "Growth"];

function TasksPage() {
  const { data: tasks = [], isLoading } = useTasks();
  const addTaskMutation = useAddTask();
  const toggleTaskMutation = useToggleTask();
  const deleteTaskMutation = useDeleteTask();

  const isConnected = !!getAppsScriptUrl();

  const [filter, setFilter] = useState<(typeof filters)[number]>("All");
  const [draft, setDraft] = useState("");
  const [selectedArea, setSelectedArea] = useState("Personal");
  const [selectedPriority, setSelectedPriority] = useState<TaskRow["priority"]>("Medium");

  const openCount = useMemo(() => tasks.filter((t) => !t.done).length, [tasks]);
  const areaCount = useMemo(() => new Set(tasks.map((t) => t.area)).size, [tasks]);

  const visible = useMemo(
    () =>
      tasks.filter((t) =>
        filter === "All" ? true : filter === "Open" ? !t.done : t.done,
      ),
    [tasks, filter],
  );

  const handleAddTask = () => {
    const text = draft.trim();
    if (!text) return;
    addTaskMutation.mutate({
      title: text,
      area: selectedArea,
      priority: selectedPriority,
    });
    setDraft("");
  };

  return (
    <AppShell>
      <PageHeader
        title="Tasks"
        subtitle={`${openCount} open across ${areaCount || 1} life areas.`}
      />

      <Card>
        <SectionHeader
          title="All tasks"
          aside={isConnected ? "Synced to Google Sheets" : "Stored locally (Offline ready)"}
        />
        <form
          className="mb-4 flex flex-col gap-2.5 sm:flex-row"
          onSubmit={(e) => {
            e.preventDefault();
            handleAddTask();
          }}
        >
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Add a task…"
            aria-label="New task"
            className="min-h-11 min-w-0 flex-1 rounded-xl border border-border bg-background px-3.5 text-sm outline-none placeholder:text-subtle-foreground focus:border-primary"
          />
          <div className="flex gap-2">
            <select
              value={selectedArea}
              onChange={(e) => setSelectedArea(e.target.value)}
              aria-label="Area"
              className="min-h-11 rounded-xl border border-border bg-background px-3 text-xs font-medium outline-none focus:border-primary"
            >
              {areas.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value as TaskRow["priority"])}
              aria-label="Priority"
              className="min-h-11 rounded-xl border border-border bg-background px-3 text-xs font-medium outline-none focus:border-primary"
            >
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
            <button
              type="submit"
              disabled={!draft.trim() || addTaskMutation.isPending}
              className="grid min-h-11 shrink-0 place-items-center gap-1 rounded-xl bg-primary px-4 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50 sm:flex sm:items-center"
            >
              <Plus className="size-4" />
              <span className="hidden sm:inline">Add</span>
            </button>
          </div>
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

        {isLoading ? (
          <div className="py-8 text-center text-sm text-subtle-foreground animate-pulse">
            Loading your tasks…
          </div>
        ) : (
          <ul className="flex flex-col">
            {visible.map((t) => (
              <li key={t.id} className="group flex items-center justify-between gap-2">
                <button
                  type="button"
                  aria-pressed={t.done}
                  onClick={() =>
                    toggleTaskMutation.mutate({ id: t.id, done: !t.done })
                  }
                  className="flex min-h-11 min-w-0 flex-1 items-center gap-3 rounded-xl px-2 py-2 text-left transition-colors hover:bg-muted active:bg-muted"
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
                      {t.area} · {t.due_date ? t.due_date : "No date"}
                    </span>
                  </span>
                  <span
                    className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-medium ${priorityStyles[t.priority]}`}
                  >
                    {t.priority}
                  </span>
                </button>
                <button
                  type="button"
                  aria-label="Delete task"
                  onClick={() => deleteTaskMutation.mutate(t.id)}
                  className="shrink-0 p-2 text-subtle-foreground opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100"
                >
                  <Trash2 className="size-4" />
                </button>
              </li>
            ))}
            {visible.length === 0 ? (
              <li className="py-8 text-center text-sm text-subtle-foreground">
                Nothing here. Enjoy the quiet.
              </li>
            ) : null}
          </ul>
        )}
      </Card>
    </AppShell>
  );
}
