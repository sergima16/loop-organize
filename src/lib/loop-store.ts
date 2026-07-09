import { useEffect, useState, useCallback } from "react";

export type Priority = "Baja" | "Media" | "Importante";
export type Horizon = "corto" | "medio" | "largo";

export interface Task {
  id: string;
  title: string;
  priority: Priority;
  date: string; // YYYY-MM-DD
  done: boolean;
  projectId?: string;
  goalId?: string;
  reminder?: string; // HH:MM
}

export interface Habit {
  id: string;
  emoji: string;
  name: string;
  log: Record<string, boolean>;
  goalId?: string;
  reminder?: string;
}

export interface Goal {
  id: string;
  title: string;
  description?: string;
  deadline?: string; // YYYY-MM-DD
  horizon: Horizon;
  taskIds: string[];
  habitIds: string[];
}

export interface Project {
  id: string;
  name: string;
  color: string; // css color / token
}

export interface Settings {
  accent: string; // preset id
  notifications: boolean;
}

interface LoopData {
  userName: string;
  tasks: Task[];
  habits: Habit[];
  goals: Goal[];
  projects: Project[];
  settings: Settings;
  theme: "dark" | "light";
}

const KEY = "loop:data:v1";

const defaultData: LoopData = {
  userName: "Sergi",
  tasks: [],
  habits: [
    { id: "h1", emoji: "🧘", name: "Meditar", log: {} },
    { id: "h2", emoji: "💪", name: "Entrenar", log: {} },
    { id: "h3", emoji: "📖", name: "Leer", log: {} },
  ],
  goals: [],
  projects: [],
  settings: { accent: "default", notifications: false },
  theme: "dark",
};

function migrate(raw: Partial<LoopData>): LoopData {
  return {
    ...defaultData,
    ...raw,
    goals: raw.goals ?? [],
    projects: raw.projects ?? [],
    settings: { ...defaultData.settings, ...(raw.settings ?? {}) },
  };
}

function load(): LoopData {
  if (typeof window === "undefined") return defaultData;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return defaultData;
    return migrate(JSON.parse(raw));
  } catch {
    return defaultData;
  }
}

function save(d: LoopData) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(d));
  window.dispatchEvent(new CustomEvent("loop:update"));
}

export function useLoop() {
  const [data, setData] = useState<LoopData>(() => load());

  useEffect(() => {
    const onUpd = () => setData(load());
    window.addEventListener("loop:update", onUpd);
    window.addEventListener("storage", onUpd);
    return () => {
      window.removeEventListener("loop:update", onUpd);
      window.removeEventListener("storage", onUpd);
    };
  }, []);

  const update = useCallback((fn: (d: LoopData) => LoopData) => {
    const next = fn(load());
    save(next);
    setData(next);
  }, []);

  return { data, update };
}

export function todayKey(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function weekKeys(ref = new Date()) {
  const d = new Date(ref);
  const day = (d.getDay() + 6) % 7;
  d.setDate(d.getDate() - day);
  return Array.from({ length: 7 }, (_, i) => {
    const x = new Date(d);
    x.setDate(d.getDate() + i);
    return todayKey(x);
  });
}

export function monthKeys(ref = new Date()) {
  const y = ref.getFullYear();
  const m = ref.getMonth();
  const days = new Date(y, m + 1, 0).getDate();
  return Array.from({ length: days }, (_, i) => todayKey(new Date(y, m, i + 1)));
}

export function uid() {
  return Math.random().toString(36).slice(2, 10);
}

// Progress helpers
export function goalProgress(g: Goal, tasks: Task[], habits: Habit[]) {
  const linkedTasks = tasks.filter((t) => g.taskIds.includes(t.id));
  const linkedHabits = habits.filter((h) => g.habitIds.includes(h.id));
  const wk = weekKeys();
  let done = 0;
  let total = 0;
  linkedTasks.forEach((t) => {
    total += 1;
    if (t.done) done += 1;
  });
  linkedHabits.forEach((h) => {
    total += 7;
    done += wk.filter((k) => h.log[k] === true).length;
  });
  return total === 0 ? 0 : Math.round((done / total) * 100);
}

export function projectProgress(p: Project, tasks: Task[]) {
  const list = tasks.filter((t) => t.projectId === p.id);
  if (list.length === 0) return 0;
  return Math.round((list.filter((t) => t.done).length / list.length) * 100);
}

export function habitStreak(h: Habit) {
  let streak = 0;
  const d = new Date();
  while (true) {
    const k = todayKey(d);
    if (h.log[k] === true) {
      streak += 1;
      d.setDate(d.getDate() - 1);
    } else {
      // allow today missing (still counting from yesterday)
      if (streak === 0 && k === todayKey()) {
        d.setDate(d.getDate() - 1);
        continue;
      }
      break;
    }
  }
  return streak;
}
