import { useEffect, useState, useCallback } from "react";

export type Priority = "Baja" | "Media" | "Importante";

export interface Task {
  id: string;
  title: string;
  priority: Priority;
  date: string; // YYYY-MM-DD
  done: boolean;
}

export interface Habit {
  id: string;
  emoji: string;
  name: string;
  // record of YYYY-MM-DD -> boolean (true done, false skipped/failed). Missing = not tracked yet.
  log: Record<string, boolean>;
}

interface LoopData {
  userName: string;
  tasks: Task[];
  habits: Habit[];
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
  theme: "dark",
};

function load(): LoopData {
  if (typeof window === "undefined") return defaultData;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return defaultData;
    return { ...defaultData, ...JSON.parse(raw) };
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
  // Monday..Sunday
  const d = new Date(ref);
  const day = (d.getDay() + 6) % 7; // 0=Mon
  d.setDate(d.getDate() - day);
  return Array.from({ length: 7 }, (_, i) => {
    const x = new Date(d);
    x.setDate(d.getDate() + i);
    return todayKey(x);
  });
}

export function uid() {
  return Math.random().toString(36).slice(2, 10);
}
