import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import { AppShell } from "@/components/life-os/AppShell";
import { Card, SectionHeader, PageHeader } from "@/components/life-os/ui";

const title = "Journal — Life OS";
const description =
  "A private daily journal — write, tag your mood, and look back on past entries.";

export const Route = createFileRoute("/journal")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
  }),
  component: JournalPage,
});

type Entry = { id: string; date: string; mood: string; text: string };

const seedEntries: Entry[] = [
  {
    id: "j1",
    date: "Monday, 24 August",
    mood: "Focused",
    text: "Finished the DBMS normalisation notes. The 3NF examples finally clicked after drawing the dependency diagram by hand.",
  },
  {
    id: "j2",
    date: "Saturday, 22 August",
    mood: "Tired",
    text: "Long week. Skipped the gym but walked for an hour in the evening — head feels clearer.",
  },
  {
    id: "j3",
    date: "Thursday, 20 August",
    mood: "Grateful",
    text: "Study group standup went well. Anisha shared her portfolio structure; going to borrow the layout for my case study.",
  },
];

const moods = ["Focused", "Calm", "Grateful", "Tired", "Anxious"] as const;

function JournalPage() {
  const [entries, setEntries] = useState(seedEntries);
  const [text, setText] = useState("");
  const [mood, setMood] = useState<(typeof moods)[number]>("Calm");

  const save = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    setEntries((prev) => [
      {
        id: `j${Date.now()}`,
        date: new Date().toLocaleDateString("en-GB", {
          weekday: "long",
          day: "numeric",
          month: "long",
        }),
        mood,
        text: trimmed,
      },
      ...prev,
    ]);
    setText("");
  };

  return (
    <AppShell>
      <PageHeader
        title="Journal"
        subtitle="Private by default. Entries stay in your browser until the backend is wired up."
      />

      <div className="grid min-w-0 gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <SectionHeader title="New entry" aside="No streak pressure" />
          <div className="mb-3 flex flex-wrap gap-1.5">
            {moods.map((m) => (
              <button
                key={m}
                type="button"
                aria-pressed={mood === m}
                onClick={() => setMood(m)}
                className={`min-h-9 rounded-full px-3.5 text-xs font-medium transition-colors ${
                  mood === m
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                {m}
              </button>
            ))}
          </div>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={6}
            placeholder="What's on your mind today?"
            aria-label="Journal entry"
            className="w-full resize-y rounded-xl border border-border bg-background p-3.5 text-sm leading-relaxed outline-none placeholder:text-subtle-foreground focus:border-primary"
          />
          <div className="mt-3 flex justify-end">
            <button
              type="button"
              onClick={save}
              disabled={!text.trim()}
              className="min-h-11 rounded-xl bg-primary px-5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-40"
            >
              Save entry
            </button>
          </div>
        </Card>

        <Card>
          <SectionHeader title="Past entries" aside={`${entries.length} total`} />
          <ul className="flex flex-col gap-3">
            {entries.map((e) => (
              <li key={e.id} className="rounded-xl border border-border p-3.5">
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-xs font-medium text-subtle-foreground">{e.date}</p>
                  <span className="shrink-0 rounded-full bg-primary-soft px-2.5 py-0.5 text-[11px] font-medium text-accent-foreground">
                    {e.mood}
                  </span>
                </div>
                <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
                  {e.text}
                </p>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </AppShell>
  );
}
