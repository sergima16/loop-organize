import { useState } from "react";
import { useLoop, weekKeys, todayKey } from "@/lib/loop-store";

const DAY_LETTERS = ["L", "M", "X", "J", "V", "S", "D"];

export function WeekCalendar({ ref: refDate }: { ref: Date }) {
  const { data, update } = useLoop();
  const [dragId, setDragId] = useState<string | null>(null);
  const keys = weekKeys(refDate);
  const today = todayKey();

  return (
    <div className="premium-card rounded-3xl p-3">
      <div className="grid grid-cols-7 gap-1">
        {keys.map((k, i) => {
          const day = Number(k.slice(-2));
          const isToday = k === today;
          const dayTasks = data.tasks.filter((t) => t.date === k);
          return (
            <div
              key={k}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => {
                if (!dragId) return;
                update((d) => ({
                  ...d,
                  tasks: d.tasks.map((t) => (t.id === dragId ? { ...t, date: k } : t)),
                }));
                setDragId(null);
              }}
              className="flex min-h-[140px] flex-col rounded-xl bg-card-2/40 p-1.5"
            >
              <div
                className={`mb-1 flex items-center justify-between text-[10px] ${
                  isToday ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                <span>{DAY_LETTERS[i]}</span>
                <span className={isToday ? "font-bold" : ""}>{day}</span>
              </div>
              <div className="flex-1 space-y-1 overflow-hidden">
                {dayTasks.map((t) => (
                  <div
                    key={t.id}
                    draggable
                    onDragStart={() => setDragId(t.id)}
                    className={`cursor-grab truncate rounded-md px-1.5 py-1 text-[10px] active:cursor-grabbing ${
                      t.done
                        ? "bg-success/20 text-success line-through"
                        : "bg-foreground/10 text-foreground"
                    }`}
                    title={t.title}
                  >
                    {t.title}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
