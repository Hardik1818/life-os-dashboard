import { createFileRoute } from "@tanstack/react-router";
import { Bookmark, Clock, ExternalLink, Newspaper, TrendingUp } from "lucide-react";

import { AppShell } from "@/components/life-os/AppShell";
import { Card, SectionHeader, PageHeader } from "@/components/life-os/ui";

const title = "News — Life OS";
const description =
  "A calm, curated feed of the stories that matter to your day.";

export const Route = createFileRoute("/news")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
  }),
  component: NewsPage,
});

const categories = ["For you", "Tech", "Science", "Design", "Health", "Culture"];

const topStories = [
  {
    id: "n1",
    source: "The Atlantic",
    headline: "The quiet return of slow productivity",
    summary:
      "Why the most resilient workers are scheduling fewer meetings and protecting longer blocks of deep work.",
    readTime: "6 min",
    when: "2 h ago",
    trending: true,
  },
  {
    id: "n2",
    source: "Nature Briefing",
    headline: "A new map of the human brain's hidden wiring",
    summary:
      "Researchers trace thousands of previously unseen connections that may explain how we form habits.",
    readTime: "4 min",
    when: "4 h ago",
    trending: false,
  },
  {
    id: "n3",
    source: "Wired",
    headline: "The end of the app-for-everything era",
    summary:
      "Consolidated life dashboards are gaining ground as users tire of switching between dozens of tools.",
    readTime: "5 min",
    when: "6 h ago",
    trending: true,
  },
];

const saved = [
  {
    id: "s1",
    source: "Harvard Health",
    headline: "How micro-recovery breaks boost focus",
    readTime: "3 min",
  },
  {
    id: "s2",
    source: "Aeon",
    headline: "Ritual, not routine, keeps creative practice alive",
    readTime: "7 min",
  },
];

function NewsPage() {
  return (
    <AppShell>
      <PageHeader
        title="News"
        subtitle="Curated reads for a calmer, more informed day."
      />

      <div className="mb-5 flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {categories.map((cat, i) => (
          <button
            key={cat}
            type="button"
            className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${
              i === 0
                ? "bg-primary text-primary-foreground"
                : "border border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="grid min-w-0 gap-5 lg:grid-cols-3">
        <Card className="min-w-0 lg:col-span-2">
          <SectionHeader title="Top stories" aside="Updated this morning" />
          <ul className="flex flex-col">
            {topStories.map((story) => (
              <li
                key={story.id}
                className="group flex gap-4 border-b border-border py-4 last:border-0"
              >
                <div className="mt-1 flex shrink-0 flex-col items-center gap-1">
                  <span className="grid size-10 place-items-center rounded-xl bg-primary-soft text-accent-foreground">
                    <Newspaper className="size-4" />
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 text-xs text-subtle-foreground">
                    <span className="font-medium text-foreground">{story.source}</span>
                    <span>·</span>
                    <span className="flex items-center gap-1">
                      <Clock className="size-3" /> {story.when}
                    </span>
                  </div>
                  <h3 className="mt-1 text-[15px] font-semibold leading-snug tracking-tight group-hover:text-primary">
                    {story.headline}
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                    {story.summary}
                  </p>
                  <div className="mt-2.5 flex items-center gap-3">
                    <span className="rounded-md bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">
                      {story.readTime}
                    </span>
                    {story.trending ? (
                      <span className="flex items-center gap-1 text-[11px] font-medium text-primary">
                        <TrendingUp className="size-3" /> Trending
                      </span>
                    ) : null}
                  </div>
                </div>
                <button
                  type="button"
                  aria-label="Save story"
                  className="mt-0.5 shrink-0 rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  <Bookmark className="size-4" />
                </button>
              </li>
            ))}
          </ul>
          <button
            type="button"
            className="mt-4 flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-dashed border-border text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <ExternalLink className="size-4" /> Browse more sources
          </button>
        </Card>

        <div className="flex min-w-0 flex-col gap-5">
          <Card>
            <SectionHeader title="Read later" aside={`${saved.length} saved`} />
            <ul className="flex flex-col">
              {saved.map((item) => (
                <li
                  key={item.id}
                  className="flex gap-3 border-b border-border py-3 last:border-0"
                >
                  <span className="mt-1 size-1.5 shrink-0 rounded-full bg-primary" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium leading-snug">{item.headline}</p>
                    <p className="mt-1 text-xs text-subtle-foreground">
                      {item.source} · {item.readTime}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </Card>

          <Card>
            <SectionHeader title="Digest settings" />
            <p className="text-sm text-muted-foreground">
              One summary each morning. No feeds, no infinite scroll.
            </p>
            <div className="mt-4 flex items-center gap-2.5 rounded-xl bg-muted/60 px-3.5 py-3 text-xs text-muted-foreground">
              <Clock className="size-4 shrink-0" />
              Next digest arrives at 08:00.
            </div>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
