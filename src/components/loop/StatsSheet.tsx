import { useMemo, useState } from "react";
import { useLoop, weekKeys, monthKeys, habitStreak, todayKey } from "@/lib/loop-store";
import { Sheet } from "./Sheet";

const DAY_LABELS = ["L", "M", "X", "J", "V", "S", "D"];

export function StatsSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { data } = useLoop();
  const [range, setRange] = useState<"week" | "month">("week");

  const keys = useMemo(() => (range === "week" ? weekKeys() : monthKeys()), [range]);

  const habitPct = useMemo(() => {
    const slots = data.habits.length * keys.length;
    if (slots === 0) return 0;
    const done = data.habits.reduce(
      (a, h) => a + keys.filter((k) => h.log[k] === true).length,
      0,
    );
    return Math.round((done / slots) * 100);
  }, [data.habits, keys]);

  const taskPct = useMemo(() => {
    const list = data.tasks.filter((t) => keys.includes(t.date));
    if (list.length === 0) return 0;
    return Math.round((list.filter((t) => t.done).length / list.length) * 100);
  }, [data.tasks, keys]);

  // Day of week histogram (last 30 days)
  const dow = useMemo(() => {
    const buckets = [0, 0, 0, 0, 0, 0, 0];
    const now = new Date();
    for (let i = 0; i < 30; i++) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const k = todayKey(d);
      const idx = (d.getDay() + 6) % 7;
      const tDone = data.tasks.filter((t) => t.date === k && t.done).length;
      const hDone = data.habits.filter((h) => h.log[k] === true).length;
      buckets[idx] += tDone + hDone;
    }
    return buckets;
  }, [data.tasks, data.habits]);
  const dowMax = Math.max(...dow, 1);
  const bestDayIdx = dow.indexOf(Math.max(...dow));

  // Constancy = distinct days with any completion (last 90d)
  const constancy = useMemo(() => {
    const set = new Set<string>();
    const now = new Date();
    for (let i = 0; i < 90; i++) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const k = todayKey(d);
      if (data.tasks.some((t) => t.date === k && t.done)) set.add(k);
      if (data.habits.some((h) => h.log[k] === true)) set.add(k);
    }
    return set.size;
  }, [data.tasks, data.habits]);

  return (
    <Sheet open={open} onClose={onClose} title="Estadísticas">
      <div className="mb-4 grid grid-cols-2 rounded-full bg-card-2 p-1">
        {(["week", "month"] as const).map((r) => (
          <button
            key={r}
            onClick={() => setRange(r)}
            className={`rounded-full py-2 text-xs font-medium transition ${
              range === r ? "bg-foreground text-background" : "text-muted-foreground"
            }`}
          >
            {r === "week" ? "Semana" : "Mes"}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="premium-card rounded-2xl p-4">
          <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Hábitos</p>
          <p className="stat-num mt-3 font-display text-3xl font-bold">{habitPct}%</p>
        </div>
        <div className="premium-card rounded-2xl p-4">
          <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Tareas</p>
          <p className="stat-num mt-3 font-display text-3xl font-bold">{taskPct}%</p>
        </div>
        <div className="premium-card rounded-2xl p-4">
          <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Constancia</p>
          <p className="stat-num mt-3 font-display text-3xl font-bold">
            {constancy}
            <span className="text-sm font-semibold text-muted-foreground">d</span>
          </p>
        </div>
        <div className="premium-card rounded-2xl p-4">
          <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            Día top
          </p>
          <p className="stat-num mt-3 font-display text-3xl font-bold">
            {DAY_LABELS[bestDayIdx]}
          </p>
        </div>
      </div>

      <div className="premium-card mt-3 rounded-2xl p-4">
        <p className="mb-3 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
          Días más productivos
        </p>
        <div className="flex h-24 items-end gap-2">
          {dow.map((v, i) => (
            <div key={i} className="flex flex-1 flex-col items-center gap-1">
              <div
                className="w-full rounded-t-md bg-foreground/80 transition-all"
                style={{ height: `${(v / dowMax) * 100}%`, minHeight: 2 }}
              />
              <span className="text-[10px] text-muted-foreground">{DAY_LABELS[i]}</span>
            </div>
          ))}
        </div>
      </div>

      {data.habits.length > 0 && (
        <div className="premium-card mt-3 rounded-2xl p-4">
          <p className="mb-3 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            Rachas
          </p>
          <ul className="space-y-2">
            {data.habits.map((h) => (
              <li key={h.id} className="flex items-center justify-between">
                <span className="text-sm">
                  {h.emoji} {h.name}
                </span>
                <span className="stat-num font-display text-lg font-bold">
                  {habitStreak(h)}
                  <span className="ml-0.5 text-xs text-muted-foreground">d</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Sheet>
  );
}
