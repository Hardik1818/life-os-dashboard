import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import { AppShell } from "@/components/life-os/AppShell";
import { Card, SectionHeader, PageHeader } from "@/components/life-os/ui";
import { getAppsScriptUrl } from "@/integrations/appscript/client";
import { useJournal, useAddJournalEntry, todayISO } from "@/lib/life-os-queries";

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

const moods = ["Focused", "Calm", "Grateful", "Tired", "Anxious"] as const;

function formatDisplayDate(iso: string) {
  try {
    const parts = iso.split("-").map((v) => Number(v));
    const y = parts[0];
    const m = parts[1];
    const d = parts[2];
    if (
      y !== undefined &&
      m !== undefined &&
      d !== undefined &&
      !isNaN(y) &&
      !isNaN(m) &&
      !isNaN(d)
    ) {
      const date = new Date(y, m - 1, d);
      return date.toLocaleDateString("en-GB", {
        weekday: "long",
        day: "numeric",
        month: "long",
      });
    }
    return iso;
  } catch {
    return iso;
  }
}

function JournalPage() {
  const { data: entries = [], isLoading } = useJournal();
  const addEntryMutation = useAddJournalEntry();

  const isConnected = !!getAppsScriptUrl();

  const [text, setText] = useState("");
  const [mood, setMood] = useState<(typeof moods)[number]>("Calm");

  const save = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    addEntryMutation.mutate({
      body: trimmed,
      mood,
      entryDate: todayISO(),
    });
    setText("");
  };

  return (
    <AppShell>
      <PageHeader
        title="Journal"
        subtitle={
          isConnected
            ? "Private by default. Synced securely to your private Google Sheet."
            : "Private by default. Stored safely on this device in local storage."
        }
      />

      <div className="grid min-w-0 gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <SectionHeader title="New entry" aside="No streak pressure" />
          <div className="mb-3 flex flex-wrap gap-1.5" role="group" aria-label="Select mood">
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
          <div className="mt-3 flex items-center justify-between">
            <span className="text-xs text-subtle-foreground">
              {text.trim().split(/\s+/).filter(Boolean).length} words
            </span>
            <button
              type="button"
              onClick={save}
              disabled={!text.trim() || addEntryMutation.isPending}
              className="min-h-11 rounded-xl bg-primary px-5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-40"
            >
              {addEntryMutation.isPending ? "Saving…" : "Save entry"}
            </button>
          </div>
        </Card>

        <Card>
          <SectionHeader title="Past entries" aside={`${entries.length} total`} />
          {isLoading ? (
            <div className="py-6 text-center text-sm text-subtle-foreground animate-pulse">
              Loading entries…
            </div>
          ) : (
            <ul className="flex flex-col gap-3">
              {entries.map((e) => (
                <li key={e.id} className="rounded-xl border border-border p-3.5">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-xs font-medium text-subtle-foreground">
                      {formatDisplayDate(e.entry_date)}
                    </p>
                    {e.mood ? (
                      <span className="shrink-0 rounded-full bg-primary-soft px-2.5 py-0.5 text-[11px] font-medium text-accent-foreground">
                        {e.mood}
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
                    {e.body}
                  </p>
                </li>
              ))}
              {entries.length === 0 ? (
                <li className="py-6 text-center text-xs text-subtle-foreground">
                  No past entries yet. Write your thoughts today!
                </li>
              ) : null}
            </ul>
          )}
        </Card>
      </div>
    </AppShell>
  );
}
