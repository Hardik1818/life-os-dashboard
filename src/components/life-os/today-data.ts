export type Severity = "high" | "medium" | "low" | "clear";

export const attentionItems: {
  id: string;
  severity: Severity;
  title: string;
  detail: string;
}[] = [
  {
    id: "a1",
    severity: "high",
    title: "DBMS assignment is overdue",
    detail: "Due yesterday, 18:00 · linked to goal “Finish semester strong”",
  },
  {
    id: "a2",
    severity: "medium",
    title: "Portfolio review deadline in 26 hours",
    detail: "No time block scheduled yet",
  },
  {
    id: "a3",
    severity: "low",
    title: "No journal entry for 4 days",
    detail: "Last entry: Monday",
  },
];

export const severityLabel: Record<Severity, string> = {
  high: "High",
  medium: "Medium",
  low: "Low",
  clear: "Clear",
};

export const priorities = [
  {
    id: "p1",
    title: "Finish DBMS normalization assignment",
    meta: "Overdue · ~90 min · College",
    severity: "high" as Severity,
  },
  {
    id: "p2",
    title: "Draft portfolio case study intro",
    meta: "Due tomorrow · ~45 min · Portfolio",
    severity: "medium" as Severity,
  },
  {
    id: "p3",
    title: "Call the clinic to move the appointment",
    meta: "Today · ~10 min · Health",
    severity: "low" as Severity,
  },
];

export const schedule = [
  { id: "s1", time: "09:30", title: "Deep work — DBMS assignment", kind: "block" as const, duration: "90m" },
  { id: "s2", time: "11:30", title: "Standup with the study group", kind: "event" as const, duration: "30m" },
  { id: "s3", time: "14:00", title: "Portfolio writing block", kind: "block" as const, duration: "60m" },
  { id: "s4", time: "18:00", title: "Gym — lower body", kind: "event" as const, duration: "50m" },
];

export const tasks = [
  { id: "t1", title: "Reply to internship email", priority: "Medium", due: "Today", done: false },
  { id: "t2", title: "Read 20 pages — Deep Work", priority: "Low", due: "Today", done: false },
  { id: "t3", title: "Water the plants", priority: "Low", due: "Today", done: true },
  { id: "t4", title: "Export last month's expenses", priority: "Medium", due: "Today", done: false },
];

export const habits = [
  { id: "h1", title: "Morning walk", streak: 12, done: true },
  { id: "h2", title: "Read 20 minutes", streak: 5, done: true },
  { id: "h3", title: "No phone before bed", streak: 0, done: false },
  { id: "h4", title: "Journal", streak: 3, done: false },
];

export const deadlines = [
  { id: "d1", title: "Portfolio review", when: "Tomorrow, 16:00" },
  { id: "d2", title: "DBMS lab viva", when: "Mon, 31 Aug" },
  { id: "d3", title: "Rent transfer", when: "Tue, 1 Sep" },
];
