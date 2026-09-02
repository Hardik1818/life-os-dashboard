import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  Bookmark,
  BookmarkCheck,
  Clock,
  ExternalLink,
  Globe,
  Newspaper,
  RefreshCw,
  Search,
  Trash2,
  TrendingUp,
} from "lucide-react";

import { AppShell } from "@/components/life-os/AppShell";
import { Card, SectionHeader, PageHeader } from "@/components/life-os/ui";
import { useLiveNews, type ArticleItem } from "@/lib/life-os-queries";

const title = "News — Life OS";
const description =
  "Real-time global news powered by Currents API — curated for focus, zero infinite feeds.";

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

const STORAGE_SAVED_KEY = "life_os_saved_articles_v1";

const categories = ["For you", "Tech", "Science", "Design", "Health", "Culture"] as const;

function getSavedFromStorage(): ArticleItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_SAVED_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as ArticleItem[];
  } catch {
    return [];
  }
}

function setSavedToStorage(articles: ArticleItem[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_SAVED_KEY, JSON.stringify(articles));
  } catch (e) {
    console.error("Failed to save articles:", e);
  }
}

function NewsPage() {
  const [selectedCategory, setSelectedCategory] = useState<(typeof categories)[number]>("For you");
  const [searchQuery, setSearchQuery] = useState("");
  const [savedArticles, setSavedArticles] = useState<ArticleItem[]>(() => getSavedFromStorage());

  const { data: articles = [], isLoading, refetch, isRefetching } = useLiveNews(
    selectedCategory,
    searchQuery,
  );

  const isSaved = (id: string) => savedArticles.some((a) => a.id === id);

  const toggleSave = (article: ArticleItem) => {
    let next: ArticleItem[];
    if (isSaved(article.id)) {
      next = savedArticles.filter((a) => a.id !== article.id);
    } else {
      next = [article, ...savedArticles];
    }
    setSavedArticles(next);
    setSavedToStorage(next);
  };

  const removeSaved = (id: string) => {
    const next = savedArticles.filter((a) => a.id !== id);
    setSavedArticles(next);
    setSavedToStorage(next);
  };

  return (
    <AppShell>
      <PageHeader
        title="Live News"
        subtitle="Global real-time headlines powered by Currents API — fast, curated, and calm."
        aside={
          <button
            type="button"
            onClick={() => refetch()}
            disabled={isRefetching}
            className="flex items-center gap-1.5 rounded-xl border border-border bg-card px-3.5 py-2 text-xs font-medium text-foreground transition-colors hover:bg-muted disabled:opacity-50"
          >
            <RefreshCw className={`size-3.5 ${isRefetching ? "animate-spin" : ""}`} />
            <span>{isRefetching ? "Fetching news…" : "Refresh News"}</span>
          </button>
        }
      />

      {/* Category Tabs & Search Bar */}
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`flex min-h-9 shrink-0 items-center rounded-full px-3.5 text-xs font-medium transition-colors ${
                selectedCategory === cat
                  ? "bg-primary text-primary-foreground"
                  : "border border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative min-w-[220px]">
          <Search className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-subtle-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search live news…"
            className="min-h-9 w-full rounded-xl border border-border bg-background pl-8 pr-3 text-xs outline-none focus:border-primary"
          />
        </div>
      </div>

      <div className="grid min-w-0 gap-5 lg:grid-cols-3">
        {/* Main Live Currents Feed */}
        <Card className="min-w-0 lg:col-span-2">
          <SectionHeader
            title={`${selectedCategory} (${articles.length})`}
            aside="Currents API · Live Feed"
          />

          {isLoading || isRefetching ? (
            <div className="py-16 text-center text-sm text-subtle-foreground animate-pulse">
              Fetching real-time headlines from Currents API…
            </div>
          ) : (
            <ul className="flex flex-col">
              {articles.map((story) => {
                const bookmarked = isSaved(story.id);
                return (
                  <li
                    key={story.id}
                    className="group flex flex-col gap-3 border-b border-border py-4.5 last:border-0 sm:flex-row sm:gap-4"
                  >
                    {story.image ? (
                      <div className="relative h-36 w-full shrink-0 overflow-hidden rounded-xl border border-border bg-muted sm:h-24 sm:w-32">
                        <img
                          src={story.image}
                          alt={story.headline}
                          loading="lazy"
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                          onError={(e) => {
                            // Hide image on broken URL
                            (e.currentTarget as HTMLElement).style.display = "none";
                          }}
                        />
                      </div>
                    ) : (
                      <div className="hidden size-11 shrink-0 place-items-center rounded-xl bg-primary-soft text-accent-foreground sm:grid">
                        <Newspaper className="size-5" />
                      </div>
                    )}

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 text-xs text-subtle-foreground">
                        <span className="font-semibold text-foreground">{story.source}</span>
                        <span>·</span>
                        <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                          {story.category}
                        </span>
                        <span>·</span>
                        <span className="flex items-center gap-1">
                          <Clock className="size-3" /> {story.when}
                        </span>
                      </div>
                      <h3 className="mt-1 text-[15px] font-semibold leading-snug tracking-tight transition-colors group-hover:text-primary">
                        <a href={story.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                          {story.headline}
                        </a>
                      </h3>
                      <p className="mt-1 text-sm leading-relaxed text-muted-foreground line-clamp-2">
                        {story.summary}
                      </p>
                      <div className="mt-2.5 flex items-center gap-3">
                        <span className="rounded-md bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">
                          {story.readTime}
                        </span>
                        {story.trending ? (
                          <span className="flex items-center gap-1 text-[11px] font-medium text-primary">
                            <TrendingUp className="size-3" /> Top Story
                          </span>
                        ) : null}
                        <a
                          href={story.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-[11px] font-medium text-subtle-foreground transition-colors hover:text-foreground"
                        >
                          <ExternalLink className="size-3" /> Read original
                        </a>
                      </div>
                    </div>

                    <button
                      type="button"
                      title={bookmarked ? "Remove from Read Later" : "Save to Read Later"}
                      aria-label={bookmarked ? "Remove from Read Later" : "Save to Read Later"}
                      onClick={() => toggleSave(story)}
                      className={`self-start shrink-0 rounded-xl p-2 transition-colors ${
                        bookmarked
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      }`}
                    >
                      {bookmarked ? (
                        <BookmarkCheck className="size-4" />
                      ) : (
                        <Bookmark className="size-4" />
                      )}
                    </button>
                  </li>
                );
              })}
              {articles.length === 0 ? (
                <li className="py-12 text-center text-sm text-subtle-foreground">
                  No headlines found. Try clicking &ldquo;Refresh News&rdquo; or choosing another category.
                </li>
              ) : null}
            </ul>
          )}
        </Card>

        {/* Read Later & API Status */}
        <div className="flex min-w-0 flex-col gap-5">
          <Card>
            <SectionHeader
              title="Read later"
              aside={`${savedArticles.length} saved`}
            />
            <ul className="flex flex-col">
              {savedArticles.map((item) => (
                <li
                  key={item.id}
                  className="group flex items-start justify-between gap-3 border-b border-border py-3 last:border-0"
                >
                  <div className="min-w-0 flex-1">
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-medium leading-snug hover:text-primary hover:underline block"
                    >
                      {item.headline}
                    </a>
                    <p className="mt-1 text-xs text-subtle-foreground">
                      {item.source} · {item.readTime}
                    </p>
                  </div>
                  <button
                    type="button"
                    title="Remove from saved"
                    aria-label="Delete saved article"
                    onClick={() => removeSaved(item.id)}
                    className="shrink-0 rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive active:scale-95"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </li>
              ))}
              {savedArticles.length === 0 ? (
                <li className="py-4 text-center text-xs text-subtle-foreground">
                  No saved articles. Bookmark stories on the left to read during quiet hours.
                </li>
              ) : null}
            </ul>
          </Card>

          <Card>
            <SectionHeader title="News Engine" />
            <div className="flex items-center gap-2.5 rounded-xl bg-muted/60 px-3.5 py-3 text-xs text-muted-foreground">
              <Globe className="size-4 shrink-0 text-primary" />
              <span>Live API: <strong>currentsapi.services</strong></span>
            </div>
            <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
              Real-time headlines are pulled on-demand directly from Currents API and cached locally to keep your browsing private, fast, and low-noise.
            </p>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
