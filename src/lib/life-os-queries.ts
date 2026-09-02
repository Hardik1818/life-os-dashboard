import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  callAppsScript,
  fetchAllFromAppsScript,
  getAppsScriptUrl,
} from "@/integrations/appscript/client";
import {
  fetchCurrentsNews,
  type NormalizedArticle,
} from "@/integrations/currents/client";

export type TaskRow = {
  id: string;
  title: string;
  area: string;
  priority: "High" | "Medium" | "Low";
  due_date: string | null;
  done: boolean;
  created_at: string;
};

export type HabitRow = {
  id: string;
  title: string;
  cue: string;
  sort_order: number;
};

export type HabitLogRow = {
  id: string;
  habit_id: string;
  log_date: string;
};

export type JournalRow = {
  id: string;
  entry_date: string;
  mood: string | null;
  body: string;
  created_at?: string | undefined;
};

export type CalendarEventRow = {
  id: string;
  title: string;
  kind: "event" | "block" | "deadline";
  event_date: string; // YYYY-MM-DD
  time?: string | undefined;
  duration?: string | undefined;
  meta?: string | undefined;
};

export type HealthLogRow = {
  id: string;
  log_date: string; // YYYY-MM-DD
  sleep_minutes: number;
  steps: number;
  workouts: number;
  mood_rating: number; // 1 to 5
  stress_level?: "low" | "medium" | "high" | undefined;
  notes?: string | undefined;
};

export type ArticleItem = NormalizedArticle;

export const todayISO = () => new Date().toISOString().slice(0, 10);

export const isoDaysAgo = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
};

/* --------------------------- Local Storage Keys --------------------------- */

const STORAGE_KEYS = {
  TASKS: "life_os_tasks_v1",
  HABITS: "life_os_habits_v1",
  HABIT_LOGS: "life_os_habit_logs_v1",
  JOURNAL: "life_os_journal_v1",
  CALENDAR: "life_os_calendar_v1",
  HEALTH: "life_os_health_v1",
  NEWS_CACHE: "life_os_news_cache_v1",
};

/* --------------------------- Default Seed Data ---------------------------- */

const DEFAULT_TASKS: TaskRow[] = [
  { id: "t1", title: "Finish DBMS normalization assignment", area: "College", priority: "High", due_date: todayISO(), done: false, created_at: new Date().toISOString() },
  { id: "t2", title: "Draft portfolio case study intro", area: "Portfolio", priority: "Medium", due_date: isoDaysAgo(-1), done: false, created_at: new Date().toISOString() },
  { id: "t3", title: "Call the clinic to move the appointment", area: "Health", priority: "Low", due_date: todayISO(), done: false, created_at: new Date().toISOString() },
  { id: "t4", title: "Reply to internship email", area: "Career", priority: "Medium", due_date: todayISO(), done: false, created_at: new Date().toISOString() },
  { id: "t5", title: "Read 20 pages — Deep Work", area: "Growth", priority: "Low", due_date: todayISO(), done: false, created_at: new Date().toISOString() },
  { id: "t6", title: "Export last month's expenses", area: "Finance", priority: "Medium", due_date: isoDaysAgo(-2), done: false, created_at: new Date().toISOString() },
  { id: "t7", title: "Water the plants", area: "Home", priority: "Low", due_date: todayISO(), done: true, created_at: new Date().toISOString() },
  { id: "t8", title: "Renew library books", area: "College", priority: "Low", due_date: isoDaysAgo(-3), done: false, created_at: new Date().toISOString() },
];

const DEFAULT_HABITS: HabitRow[] = [
  { id: "h1", title: "Morning walk", cue: "After waking, 15 min", sort_order: 1 },
  { id: "h2", title: "Read 20 minutes", cue: "With morning tea", sort_order: 2 },
  { id: "h3", title: "No phone before bed", cue: "Phone charges outside bedroom", sort_order: 3 },
  { id: "h4", title: "Journal", cue: "Before bed", sort_order: 4 },
  { id: "h5", title: "Stretch 5 minutes", cue: "After each study block", sort_order: 5 },
];

const DEFAULT_HABIT_LOGS: HabitLogRow[] = [
  { id: "hl-1", habit_id: "h1", log_date: isoDaysAgo(0) },
  { id: "hl-2", habit_id: "h1", log_date: isoDaysAgo(1) },
  { id: "hl-3", habit_id: "h1", log_date: isoDaysAgo(2) },
  { id: "hl-4", habit_id: "h1", log_date: isoDaysAgo(3) },
  { id: "hl-5", habit_id: "h2", log_date: isoDaysAgo(0) },
  { id: "hl-6", habit_id: "h2", log_date: isoDaysAgo(1) },
  { id: "hl-7", habit_id: "h4", log_date: isoDaysAgo(0) },
  { id: "hl-8", habit_id: "h5", log_date: isoDaysAgo(0) },
  { id: "hl-9", habit_id: "h5", log_date: isoDaysAgo(1) },
];

const DEFAULT_JOURNAL: JournalRow[] = [
  {
    id: "j1",
    entry_date: todayISO(),
    mood: "Focused",
    body: "Finished the DBMS normalisation notes. The 3NF examples finally clicked after drawing the dependency diagram by hand.",
    created_at: new Date().toISOString(),
  },
  {
    id: "j2",
    entry_date: isoDaysAgo(2),
    mood: "Tired",
    body: "Long week. Skipped the gym but walked for an hour in the evening — head feels clearer.",
    created_at: new Date().toISOString(),
  },
  {
    id: "j3",
    entry_date: isoDaysAgo(4),
    mood: "Grateful",
    body: "Study group standup went well. Anisha shared her portfolio structure; going to borrow the layout for my case study.",
    created_at: new Date().toISOString(),
  },
];

const DEFAULT_CALENDAR: CalendarEventRow[] = [
  { id: "c1", title: "Deep work — DBMS lab prep", kind: "block", event_date: todayISO(), time: "09:00", duration: "2 h", meta: "Library silent area" },
  { id: "c2", title: "Study group standup", kind: "event", event_date: todayISO(), time: "11:30", duration: "45 min", meta: "Online call" },
  { id: "c3", title: "Portfolio case study review", kind: "block", event_date: todayISO(), time: "15:00", duration: "1.5 h", meta: "Design review" },
  { id: "c4", title: "DBMS Lab Viva", kind: "deadline", event_date: isoDaysAgo(-1), time: "10:00", duration: "1 h", meta: "Building C, Lab 2" },
  { id: "c5", title: "Rent transfer", kind: "deadline", event_date: isoDaysAgo(-2), time: "All day", duration: "-", meta: "Finance" },
  { id: "c6", title: "Gym — Upper body", kind: "event", event_date: isoDaysAgo(-3), time: "17:30", duration: "1 h", meta: "Campus Gym" },
  { id: "c7", title: "Deep work — Research writing", kind: "block", event_date: isoDaysAgo(-4), time: "09:00", duration: "2 h", meta: "Focus session" },
  { id: "c8", title: "Dentist checkup", kind: "event", event_date: isoDaysAgo(-6), time: "14:00", duration: "45 min", meta: "City Dental" },
];

const DEFAULT_HEALTH: HealthLogRow[] = [
  { id: "hl-0", log_date: todayISO(), sleep_minutes: 440, steps: 6840, workouts: 1, mood_rating: 4, stress_level: "low", notes: "Good energy today" },
  { id: "hl-1", log_date: isoDaysAgo(1), sleep_minutes: 420, steps: 8450, workouts: 1, mood_rating: 4, stress_level: "low" },
  { id: "hl-2", log_date: isoDaysAgo(2), sleep_minutes: 390, steps: 5900, workouts: 0, mood_rating: 3, stress_level: "medium" },
  { id: "hl-3", log_date: isoDaysAgo(3), sleep_minutes: 460, steps: 9100, workouts: 1, mood_rating: 5, stress_level: "low" },
  { id: "hl-4", log_date: isoDaysAgo(4), sleep_minutes: 380, steps: 4200, workouts: 0, mood_rating: 2, stress_level: "high" },
  { id: "hl-5", log_date: isoDaysAgo(5), sleep_minutes: 450, steps: 7800, workouts: 1, mood_rating: 4, stress_level: "low" },
  { id: "hl-6", log_date: isoDaysAgo(6), sleep_minutes: 430, steps: 6500, workouts: 0, mood_rating: 3, stress_level: "low" },
];

const DEFAULT_NEWS: ArticleItem[] = [
  {
    id: "n-science-1",
    category: "Science",
    source: "Nature",
    headline: "A new map of the human brain's hidden wiring",
    summary:
      "Neuroscientists trace thousands of previously unseen synaptic connections that explain how durable habits form and resist cognitive fatigue.",
    readTime: "4 min",
    when: "2 h ago",
    url: "https://www.nature.com",
    trending: true,
  },
  {
    id: "n-science-2",
    category: "Science",
    source: "Quanta Magazine",
    headline: "How deep sleep actively clears metabolic waste from neurons",
    summary:
      "Recent imaging studies show cerebrospinal fluid surges during slow-wave sleep to flush adenosine and reset neural pathways.",
    readTime: "5 min",
    when: "5 h ago",
    url: "https://www.quantamagazine.org",
    trending: false,
  },
  {
    id: "n-health-1",
    category: "Health",
    source: "Harvard Health",
    headline: "How micro-recovery breaks boost afternoon focus",
    summary:
      "Taking 3-minute visual resets away from screens every 90 minutes reduces cortisol accumulation and restores baseline attention.",
    readTime: "3 min",
    when: "3 h ago",
    url: "https://www.health.harvard.edu",
    trending: true,
  },
  {
    id: "n-health-2",
    category: "Health",
    source: "Stanford Medicine",
    headline: "Morning sunlight and cortisol alignment for deep focus",
    summary:
      "Viewing 10 minutes of natural outdoor light within an hour of waking sets a circadian timer that optimizes daytime alertness and evening melatonin.",
    readTime: "4 min",
    when: "6 h ago",
    url: "https://med.stanford.edu",
    trending: false,
  },
  {
    id: "n-tech-1",
    category: "Tech",
    source: "Ars Technica",
    headline: "The end of the app-for-everything era: Why local-first dashboards win",
    summary:
      "Consolidated personal life dashboards and local-first databases are gaining ground as developers and power users tire of tool fragmentation.",
    readTime: "5 min",
    when: "1 h ago",
    url: "https://arstechnica.com",
    trending: true,
  },
  {
    id: "n-tech-2",
    category: "Tech",
    source: "Hacker News",
    headline: "Building resilient personal software with zero subscription lock-in",
    summary:
      "How open APIs, Google Apps Script, and client-side web apps create long-term sovereign productivity systems that last for decades.",
    readTime: "6 min",
    when: "4 h ago",
    url: "https://news.ycombinator.com",
    trending: false,
  },
  {
    id: "n-design-1",
    category: "Design",
    source: "Smashing Magazine",
    headline: "The renaissance of calm, purposeful interfaces",
    summary:
      "Designing software that respects human attention: muted palettes, zero manipulative push alerts, and high information clarity.",
    readTime: "5 min",
    when: "7 h ago",
    url: "https://www.smashingmagazine.com",
    trending: true,
  },
  {
    id: "n-design-2",
    category: "Design",
    source: "UX Collective",
    headline: "Designing for attention density: Fewer alerts, higher clarity",
    summary:
      "Why the next generation of productivity applications are removing infinite feeds in favor of finite daily summaries and clear finish lines.",
    readTime: "4 min",
    when: "8 h ago",
    url: "https://uxdesign.cc",
    trending: false,
  },
  {
    id: "n-culture-1",
    category: "Culture",
    source: "The Atlantic",
    headline: "The quiet return of slow productivity",
    summary:
      "Why the most resilient creators and workers are scheduling fewer meetings and protecting uninterrupted blocks of deep work.",
    readTime: "6 min",
    when: "3 h ago",
    url: "https://www.theatlantic.com",
    trending: true,
  },
  {
    id: "n-culture-2",
    category: "Culture",
    source: "Aeon",
    headline: "Ritual, not routine, keeps creative practice alive",
    summary:
      "Understanding the psychological distinction between rigid checklists and meaningful daily rituals that ground long-term creative projects.",
    readTime: "5 min",
    when: "9 h ago",
    url: "https://aeon.co",
    trending: false,
  },
];

function getLocal<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(fallback));
      return fallback;
    }
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function setLocal<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error("Local storage error:", e);
  }
}

/* ------------------------------- Tasks Hooks ------------------------------- */

export function useTasks() {
  return useQuery({
    queryKey: ["tasks"],
    queryFn: async (): Promise<TaskRow[]> => {
      return getLocal<TaskRow[]>(STORAGE_KEYS.TASKS, DEFAULT_TASKS);
    },
  });
}

export function useAddTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      title: string;
      area?: string;
      priority?: TaskRow["priority"];
      dueDate?: string | null;
    }) => {
      const current = getLocal<TaskRow[]>(STORAGE_KEYS.TASKS, DEFAULT_TASKS);
      const newTask: TaskRow = {
        id: `t_${Date.now()}`,
        title: input.title,
        area: input.area ?? "Personal",
        priority: input.priority ?? "Medium",
        due_date: input.dueDate ?? todayISO(),
        done: false,
        created_at: new Date().toISOString(),
      };
      const updated = [newTask, ...current];
      setLocal(STORAGE_KEYS.TASKS, updated);

      if (getAppsScriptUrl()) {
        callAppsScript("saveTasks", { tasks: updated }).catch(console.error);
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tasks"] }),
  });
}

export function useToggleTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { id: string; done: boolean }) => {
      const current = getLocal<TaskRow[]>(STORAGE_KEYS.TASKS, DEFAULT_TASKS);
      const updated = current.map((t) => (t.id === input.id ? { ...t, done: input.done } : t));
      setLocal(STORAGE_KEYS.TASKS, updated);

      if (getAppsScriptUrl()) {
        callAppsScript("saveTasks", { tasks: updated }).catch(console.error);
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tasks"] }),
  });
}

export function useDeleteTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const current = getLocal<TaskRow[]>(STORAGE_KEYS.TASKS, DEFAULT_TASKS);
      const updated = current.filter((t) => t.id !== id);
      setLocal(STORAGE_KEYS.TASKS, updated);

      if (getAppsScriptUrl()) {
        callAppsScript("saveTasks", { tasks: updated }).catch(console.error);
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tasks"] }),
  });
}

/* ------------------------------- Habits Hooks ------------------------------ */

export function useHabits() {
  return useQuery({
    queryKey: ["habits"],
    queryFn: async (): Promise<HabitRow[]> => {
      return getLocal<HabitRow[]>(STORAGE_KEYS.HABITS, DEFAULT_HABITS);
    },
  });
}

export function useHabitLogs() {
  return useQuery({
    queryKey: ["habit_logs"],
    queryFn: async (): Promise<HabitLogRow[]> => {
      return getLocal<HabitLogRow[]>(STORAGE_KEYS.HABIT_LOGS, DEFAULT_HABIT_LOGS);
    },
  });
}

export function useAddHabit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { title: string; cue?: string }) => {
      const current = getLocal<HabitRow[]>(STORAGE_KEYS.HABITS, DEFAULT_HABITS);
      const newHabit: HabitRow = {
        id: `h_${Date.now()}`,
        title: input.title,
        cue: input.cue ?? "",
        sort_order: current.length + 1,
      };
      const updated = [...current, newHabit];
      setLocal(STORAGE_KEYS.HABITS, updated);

      if (getAppsScriptUrl()) {
        callAppsScript("saveHabits", { habits: updated }).catch(console.error);
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["habits"] });
    },
  });
}

export function useToggleHabitDay() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { habitId: string; date: string; logged: boolean }) => {
      const current = getLocal<HabitLogRow[]>(STORAGE_KEYS.HABIT_LOGS, DEFAULT_HABIT_LOGS);
      let updated: HabitLogRow[];
      if (input.logged) {
        updated = current.filter((l) => !(l.habit_id === input.habitId && l.log_date === input.date));
      } else {
        const newLog: HabitLogRow = {
          id: `hl_${Date.now()}`,
          habit_id: input.habitId,
          log_date: input.date,
        };
        updated = [newLog, ...current];
      }
      setLocal(STORAGE_KEYS.HABIT_LOGS, updated);

      if (getAppsScriptUrl()) {
        callAppsScript("saveHabitLogs", { logs: updated }).catch(console.error);
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["habit_logs"] }),
  });
}

export function useDeleteHabit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (habitId: string) => {
      const currentHabits = getLocal<HabitRow[]>(STORAGE_KEYS.HABITS, DEFAULT_HABITS);
      const updatedHabits = currentHabits.filter((h) => h.id !== habitId);
      setLocal(STORAGE_KEYS.HABITS, updatedHabits);

      const currentLogs = getLocal<HabitLogRow[]>(STORAGE_KEYS.HABIT_LOGS, DEFAULT_HABIT_LOGS);
      const updatedLogs = currentLogs.filter((l) => l.habit_id !== habitId);
      setLocal(STORAGE_KEYS.HABIT_LOGS, updatedLogs);

      if (getAppsScriptUrl()) {
        callAppsScript("saveHabits", { habits: updatedHabits }).catch(console.error);
        callAppsScript("saveHabitLogs", { logs: updatedLogs }).catch(console.error);
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["habits"] });
      qc.invalidateQueries({ queryKey: ["habit_logs"] });
    },
  });
}

export function streakFor(habitId: string, logs: HabitLogRow[]) {
  const days = new Set(logs.filter((l) => l.habit_id === habitId).map((l) => l.log_date));
  let streak = 0;
  for (let i = 0; i < 90; i++) {
    const day = isoDaysAgo(i);
    if (days.has(day)) streak++;
    else if (i > 0) break;
  }
  return streak;
}

/* ------------------------------ Journal Hooks ------------------------------ */

export function useJournal() {
  return useQuery({
    queryKey: ["journal"],
    queryFn: async (): Promise<JournalRow[]> => {
      return getLocal<JournalRow[]>(STORAGE_KEYS.JOURNAL, DEFAULT_JOURNAL);
    },
  });
}

export function useAddJournalEntry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { body: string; mood: string; entryDate?: string }) => {
      const date = input.entryDate ?? todayISO();
      const current = getLocal<JournalRow[]>(STORAGE_KEYS.JOURNAL, DEFAULT_JOURNAL);
      const newEntry: JournalRow = {
        id: `j_${Date.now()}`,
        entry_date: date,
        mood: input.mood,
        body: input.body,
        created_at: new Date().toISOString(),
      };
      const updated = [newEntry, ...current];
      setLocal(STORAGE_KEYS.JOURNAL, updated);

      if (getAppsScriptUrl()) {
        callAppsScript("saveJournal", { entries: updated }).catch(console.error);
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["journal"] }),
  });
}

export function useDeleteJournalEntry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const current = getLocal<JournalRow[]>(STORAGE_KEYS.JOURNAL, DEFAULT_JOURNAL);
      const updated = current.filter((j) => j.id !== id);
      setLocal(STORAGE_KEYS.JOURNAL, updated);

      if (getAppsScriptUrl()) {
        callAppsScript("saveJournal", { entries: updated }).catch(console.error);
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["journal"] }),
  });
}

/* -------------------------- Calendar Events Hooks -------------------------- */

export function useCalendarEvents() {
  return useQuery({
    queryKey: ["calendar_events"],
    queryFn: async (): Promise<CalendarEventRow[]> => {
      return getLocal<CalendarEventRow[]>(STORAGE_KEYS.CALENDAR, DEFAULT_CALENDAR);
    },
  });
}

export function useAddCalendarEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: Omit<CalendarEventRow, "id">) => {
      const current = getLocal<CalendarEventRow[]>(STORAGE_KEYS.CALENDAR, DEFAULT_CALENDAR);
      const newEvent: CalendarEventRow = {
        id: `cal_${Date.now()}`,
        ...input,
      };
      const updated = [newEvent, ...current];
      setLocal(STORAGE_KEYS.CALENDAR, updated);

      if (getAppsScriptUrl()) {
        callAppsScript("saveCalendarEvents", { events: updated }).catch(console.error);
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["calendar_events"] }),
  });
}

export function useDeleteCalendarEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const current = getLocal<CalendarEventRow[]>(STORAGE_KEYS.CALENDAR, DEFAULT_CALENDAR);
      const updated = current.filter((e) => e.id !== id);
      setLocal(STORAGE_KEYS.CALENDAR, updated);

      if (getAppsScriptUrl()) {
        callAppsScript("saveCalendarEvents", { events: updated }).catch(console.error);
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["calendar_events"] }),
  });
}

/* --------------------------- Health & Mood Hooks --------------------------- */

export function useHealthLogs() {
  return useQuery({
    queryKey: ["health_logs"],
    queryFn: async (): Promise<HealthLogRow[]> => {
      return getLocal<HealthLogRow[]>(STORAGE_KEYS.HEALTH, DEFAULT_HEALTH);
    },
  });
}

export function useLogHealth() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      log_date?: string;
      sleep_minutes: number;
      steps: number;
      workouts: number;
      mood_rating: number;
      stress_level?: "low" | "medium" | "high" | undefined;
      notes?: string | undefined;
    }) => {
      const date = input.log_date ?? todayISO();
      const current = getLocal<HealthLogRow[]>(STORAGE_KEYS.HEALTH, DEFAULT_HEALTH);
      const existingIdx = current.findIndex((l) => l.log_date === date);
      let updated: HealthLogRow[];

      if (existingIdx >= 0) {
        const prev = current[existingIdx];
        if (prev) {
          current[existingIdx] = {
            id: prev.id,
            log_date: date,
            sleep_minutes: input.sleep_minutes,
            steps: input.steps,
            workouts: input.workouts,
            mood_rating: input.mood_rating,
            stress_level: input.stress_level ?? prev.stress_level ?? "low",
            notes: input.notes !== undefined ? input.notes : prev.notes,
          };
          updated = [...current];
        } else {
          updated = [...current];
        }
      } else {
        const newLog: HealthLogRow = {
          id: `hl_${Date.now()}`,
          log_date: date,
          sleep_minutes: input.sleep_minutes,
          steps: input.steps,
          workouts: input.workouts,
          mood_rating: input.mood_rating,
          stress_level: input.stress_level ?? "low",
          notes: input.notes,
        };
        updated = [newLog, ...current];
      }
      setLocal(STORAGE_KEYS.HEALTH, updated);

      if (getAppsScriptUrl()) {
        callAppsScript("saveHealthLogs", { logs: updated }).catch(console.error);
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["health_logs"] }),
  });
}

/* --------------------------- Currents API News Hook ------------------------ */

export function useLiveNews(category?: string, query?: string) {
  return useQuery({
    queryKey: ["currents_news", category ?? "all", query ?? ""],
    queryFn: async (): Promise<ArticleItem[]> => {
      // 1. Fetch live articles from Currents API (currentsapi.services)
      try {
        const liveArticles = await fetchCurrentsNews(category, query);
        if (liveArticles.length > 0) {
          setLocal(STORAGE_KEYS.NEWS_CACHE, liveArticles);
          return liveArticles;
        }
      } catch (err) {
        console.warn("Currents API fetch failed, using fallback:", err);
      }

      // 2. Return local cached articles or curated seed defaults
      const cached = getLocal<ArticleItem[]>(STORAGE_KEYS.NEWS_CACHE, DEFAULT_NEWS);
      if (category && category !== "For you") {
        return cached.filter((a) => a.category === category);
      }
      return cached;
    },
    staleTime: 1000 * 60 * 15, // 15 min cache
  });
}

/* -------------------- Google Apps Script Full Sync Hook -------------------- */

export function useSyncAppsScript() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const res = await fetchAllFromAppsScript();
      if (!res.success || !res.data) {
        throw new Error(res.error || "Sync failed");
      }

      const data = res.data as {
        tasks?: TaskRow[];
        habits?: HabitRow[];
        habit_logs?: HabitLogRow[];
        journal?: JournalRow[];
        calendar_events?: CalendarEventRow[];
        health_logs?: HealthLogRow[];
        google_calendar?: CalendarEventRow[];
        news?: ArticleItem[];
      };

      if (data.tasks && data.tasks.length > 0) setLocal(STORAGE_KEYS.TASKS, data.tasks);
      if (data.habits && data.habits.length > 0) setLocal(STORAGE_KEYS.HABITS, data.habits);
      if (data.habit_logs && data.habit_logs.length > 0) setLocal(STORAGE_KEYS.HABIT_LOGS, data.habit_logs);
      if (data.journal && data.journal.length > 0) setLocal(STORAGE_KEYS.JOURNAL, data.journal);
      if (data.calendar_events && data.calendar_events.length > 0) {
        const allCal = [...data.calendar_events, ...(data.google_calendar || [])];
        setLocal(STORAGE_KEYS.CALENDAR, allCal);
      }
      if (data.health_logs && data.health_logs.length > 0) setLocal(STORAGE_KEYS.HEALTH, data.health_logs);
      if (data.news && data.news.length > 0) setLocal(STORAGE_KEYS.NEWS_CACHE, data.news);

      return true;
    },
    onSuccess: () => {
      qc.invalidateQueries();
    },
  });
}
