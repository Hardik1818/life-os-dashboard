import { createFileRoute } from "@tanstack/react-router";
import { MessageCircle, Users } from "lucide-react";

import { AppShell } from "@/components/life-os/AppShell";
import { Card, SectionHeader, PageHeader } from "@/components/life-os/ui";

const title = "Social — Life OS";
const description =
  "Optional accountability — share wins and streaks with the people you choose.";

export const Route = createFileRoute("/social")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
  }),
  component: SocialPage,
});

const people = [
  { id: "p1", name: "Anisha", relation: "Study group", shared: "Habit streaks", streak: 9 },
  { id: "p2", name: "Rohan", relation: "Gym partner", shared: "Workout check-ins", streak: 4 },
  { id: "p3", name: "Meera", relation: "Accountability buddy", shared: "Weekly goals", streak: 6 },
];

const activity = [
  { id: "a1", text: "Anisha completed “Read 20 minutes” — 9-day streak", when: "2 h ago" },
  { id: "a2", text: "Rohan logged a workout: upper body", when: "Yesterday" },
  { id: "a3", text: "Meera finished her weekly goal review", when: "Yesterday" },
  { id: "a4", text: "You shared your focus summary with the study group", when: "Mon" },
];

function SocialPage() {
  return (
    <AppShell>
      <PageHeader
        title="Social"
        subtitle="Private by default. You choose exactly what each person sees."
      />

      <div className="grid min-w-0 gap-5 lg:grid-cols-3">
        <Card className="min-w-0 lg:col-span-2">
          <SectionHeader title="Your circle" aside="3 people · all opt-in" />
          <ul className="grid min-w-0 gap-3 sm:grid-cols-2">
            {people.map((p) => (
              <li
                key={p.id}
                className="flex min-w-0 items-center gap-3.5 rounded-xl border border-border p-4 transition-shadow hover:shadow-[var(--shadow-lift)]"
              >
                <span className="grid size-10 shrink-0 place-items-center rounded-full bg-primary-soft text-sm font-semibold text-accent-foreground">
                  {p.name.slice(0, 1)}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{p.name}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {p.relation} · sees {p.shared.toLowerCase()}
                  </p>
                </div>
                <span className="tabular shrink-0 rounded-full bg-muted px-2.5 py-1 text-[11px] text-muted-foreground">
                  {p.streak} d
                </span>
              </li>
            ))}
            <li>
              <button
                type="button"
                className="flex min-h-[74px] w-full items-center justify-center gap-2 rounded-xl border border-dashed border-border text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <Users className="size-4" /> Invite someone
              </button>
            </li>
          </ul>
        </Card>

        <Card>
          <SectionHeader title="Recent activity" />
          <ul className="flex flex-col">
            {activity.map((a) => (
              <li key={a.id} className="flex gap-3 border-b border-border py-3 last:border-0">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
                <div className="min-w-0">
                  <p className="text-sm leading-snug">{a.text}</p>
                  <p className="mt-1 text-xs text-subtle-foreground">{a.when}</p>
                </div>
              </li>
            ))}
          </ul>
          <button
            type="button"
            className="mt-4 flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-muted text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <MessageCircle className="size-4" /> Send encouragement
          </button>
        </Card>
      </div>
    </AppShell>
  );
}
