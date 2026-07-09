import { useEffect } from "react";
import { useLoop, todayKey } from "@/lib/loop-store";

// Schedules browser notifications for today's tasks/habits with a reminder time.
export function useReminders() {
  const { data } = useLoop();

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (typeof Notification === "undefined") return;
    if (!data.settings.notifications) return;
    if (Notification.permission !== "granted") return;

    const timers: number[] = [];
    const today = todayKey();
    const now = Date.now();

    const schedule = (title: string, reminder: string) => {
      const [h, m] = reminder.split(":").map(Number);
      const when = new Date();
      when.setHours(h || 0, m || 0, 0, 0);
      const delay = when.getTime() - now;
      if (delay <= 0 || delay > 24 * 60 * 60 * 1000) return;
      const id = window.setTimeout(() => {
        try {
          new Notification("loop", { body: title });
        } catch {}
      }, delay);
      timers.push(id);
    };

    data.tasks
      .filter((t) => t.date === today && !t.done && t.reminder)
      .forEach((t) => schedule(t.title, t.reminder!));
    data.habits
      .filter((h) => h.reminder && h.log[today] !== true)
      .forEach((h) => schedule(`${h.emoji} ${h.name}`, h.reminder!));

    return () => timers.forEach((id) => window.clearTimeout(id));
  }, [data]);
}
