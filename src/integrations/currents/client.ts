/**
 * Currents API Client (currentsapi.services)
 * Fetches real-time global news across categories.
 */

const CURRENTS_API_KEY = "7PIx2ASWsMul946ox3Lduj357JMwUo-NQG5PEsJLYNeklzs5";
const BASE_URL = "https://api.currentsapi.services/v1";

export type CurrentsArticle = {
  id: string;
  title: string;
  description: string;
  url: string;
  author: string;
  image: string;
  language: string;
  category: string[];
  published: string;
};

export type CurrentsResponse = {
  status: string;
  news: CurrentsArticle[];
  page?: number;
};

export type NormalizedArticle = {
  id: string;
  category: "Tech" | "Science" | "Design" | "Health" | "Culture";
  source: string;
  headline: string;
  summary: string;
  readTime: string;
  when: string;
  url: string;
  image?: string | undefined;
  trending?: boolean | undefined;
};

const categoryMap: Record<string, "Tech" | "Science" | "Design" | "Health" | "Culture"> = {
  technology: "Tech",
  science: "Science",
  health: "Health",
  lifestyle: "Culture",
  general: "Design",
  entertainment: "Culture",
  business: "Tech",
};

export function normalizeCategory(categories?: string[]): "Tech" | "Science" | "Design" | "Health" | "Culture" {
  if (!categories || categories.length === 0) return "Tech";
  for (const c of categories) {
    const lower = c.toLowerCase();
    if (categoryMap[lower]) return categoryMap[lower];
    if (lower.includes("tech")) return "Tech";
    if (lower.includes("sci")) return "Science";
    if (lower.includes("health") || lower.includes("med")) return "Health";
    if (lower.includes("design") || lower.includes("art")) return "Design";
  }
  return "Tech";
}

export function formatRelativeTime(dateStr?: string): string {
  if (!dateStr) return "Today";
  try {
    const d = new Date(dateStr.replace(" +0000", "Z"));
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffHours = Math.round(diffMs / (1000 * 60 * 60));
    if (isNaN(diffHours) || diffHours < 1) return "Just now";
    if (diffHours < 24) return `${diffHours} h ago`;
    const diffDays = Math.round(diffHours / 24);
    return `${diffDays} d ago`;
  } catch {
    return "Recently";
  }
}

export async function fetchCurrentsNews(category?: string, query?: string): Promise<NormalizedArticle[]> {
  try {
    let endpoint = `${BASE_URL}/latest-news?apiKey=${CURRENTS_API_KEY}&language=en`;

    if (category && category !== "For you") {
      const catParam =
        category === "Tech"
          ? "technology"
          : category === "Science"
          ? "science"
          : category === "Health"
          ? "health"
          : category === "Culture"
          ? "lifestyle"
          : category === "Design"
          ? "general"
          : "";
      if (catParam) {
        endpoint += `&category=${catParam}`;
      }
    }

    if (query && query.trim()) {
      endpoint = `${BASE_URL}/search?apiKey=${CURRENTS_API_KEY}&language=en&keywords=${encodeURIComponent(query.trim())}`;
    }

    const res = await fetch(endpoint);
    if (!res.ok) {
      throw new Error(`Currents API error ${res.status}: ${res.statusText}`);
    }

    const data = (await res.json()) as CurrentsResponse;
    if (data.status !== "ok" || !Array.isArray(data.news)) {
      return [];
    }

    return data.news.map((item, idx) => {
      const cat = normalizeCategory(item.category);
      const cleanDesc = (item.description || "")
        .replace(/<[^>]+>/g, " ")
        .replace(/&nbsp;/g, " ")
        .replace(/\s+/g, " ")
        .trim();

      const sourceName = item.author || "Global News";

      return {
        id: item.id || `curr_${Date.now()}_${idx}`,
        category: cat,
        source: sourceName.length > 30 ? sourceName.slice(0, 30) + "…" : sourceName,
        headline: item.title,
        summary: cleanDesc || "Click to read full story.",
        readTime: `${Math.max(3, Math.min(8, Math.round(cleanDesc.length / 300) + 3))} min`,
        when: formatRelativeTime(item.published),
        url: item.url,
        image: item.image && item.image !== "None" ? item.image : undefined,
        trending: idx === 0,
      };
    });
  } catch (err) {
    console.error("[Currents API fetch failed]:", err);
    return [];
  }
}
