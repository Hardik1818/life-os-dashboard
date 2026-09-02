import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";

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

export type HabitLogRow = { id: string; habit_id: string; log_date: string };

export type JournalRow = {
  id: string;
  entry_date: string;
  mood: string | null;
  body: string;
};

export const todayISO = () => new Date().toISOString().slice(0, 10);

export const isoDaysAgo = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
};

/* ------------------------------- tasks ------------------------------- */

export function useTasks(enabled: boolean) {
  return useQuery({
    queryKey: ["tasks"],
    enabled,
    queryFn: async (): Promise<TaskRow[]> => {
      const { data, error } = await supabase
        .from("tasks")
        .select("id, title, area, priority, due_date, done, created_at")
        .order("done", { ascending: true })
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as TaskRow[];
    },
  });
}

export function useAddTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      userId: string;
      title: string;
      area?: string;
      priority?: TaskRow["priority"];
      dueDate?: string | null;
    }) => {
      const { error } = await supabase.from("tasks").insert({
        user_id: input.userId,
        title: input.title,
        area: input.area ?? "Personal",
        priority: input.priority ?? "Medium",
        due_date: input.dueDate ?? todayISO(),
      });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tasks"] }),
  });
}

export function useToggleTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { id: string; done: boolean }) => {
      const { error } = await supabase
        .from("tasks")
        .update({ done: input.done })
        .eq("id", input.id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tasks"] }),
  });
}

export function useDeleteTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("tasks").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tasks"] }),
  });
}

/* ------------------------------- habits ------------------------------ */

export function useHabits(enabled: boolean) {
  return useQuery({
    queryKey: ["habits"],
    enabled,
    queryFn: async (): Promise<HabitRow[]> => {
      const { data, error } = await supabase
        .from("habits")
        .select("id, title, cue, sort_order")
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: true });
      if (error) throw error;
      return (data ?? []) as HabitRow[];
    },
  });
}

export function useHabitLogs(enabled: boolean, sinceDays = 30) {
  return useQuery({
    queryKey: ["habit_logs", sinceDays],
    enabled,
    queryFn: async (): Promise<HabitLogRow[]> => {
      const { data, error } = await supabase
        .from("habit_logs")
        .select("id, habit_id, log_date")
        .gte("log_date", isoDaysAgo(sinceDays))
        .order("log_date", { ascending: false });
      if (error) throw error;
      return (data ?? []) as HabitLogRow[];
    },
  });
}

export function useAddHabit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { userId: string; title: string; cue?: string }) => {
      const { error } = await supabase.from("habits").insert({
        user_id: input.userId,
        title: input.title,
        cue: input.cue ?? "",
      });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["habits"] }),
  });
}

export function useToggleHabitDay() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      userId: string;
      habitId: string;
      date: string;
      logged: boolean;
    }) => {
      if (input.logged) {
        const { error } = await supabase
          .from("habit_logs")
          .delete()
          .eq("habit_id", input.habitId)
          .eq("log_date", input.date);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("habit_logs").insert({
          user_id: input.userId,
          habit_id: input.habitId,
          log_date: input.date,
        });
        if (error) throw error;
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["habit_logs"] }),
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

/* ------------------------------ journal ------------------------------ */

export function useJournal(enabled: boolean) {
  return useQuery({
    queryKey: ["journal"],
    enabled,
    queryFn: async (): Promise<JournalRow[]> => {
      const { data, error } = await supabase
        .from("journal_entries")
        .select("id, entry_date, mood, body")
        .order("entry_date", { ascending: false })
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as JournalRow[];
    },
  });
}

export function useAddJournalEntry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { userId: string; body: string; mood: string }) => {
      const { error } = await supabase.from("journal_entries").insert({
        user_id: input.userId,
        body: input.body,
        mood: input.mood,
        entry_date: todayISO(),
      });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["journal"] }),
  });
}
