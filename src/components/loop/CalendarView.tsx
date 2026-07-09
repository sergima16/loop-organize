import { ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";
import { useLoop, todayKey } from "@/lib/loop-store";
import { WeekCalendar } from "./WeekCalendar";

const MONTHS = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];
const DAYS = ["L", "M", "X", "J", "V", "S", "D"];

export function CalendarView() {
  const { data, update } = useLoop();
  const today = new Date();
  const [mode, setMode] = useState<"month" | "week">("month");
  const [cursor, setCursor] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));
  const [selected, setSelected] = useState<string>(todayKey(today));
  const [dragId, setDragId] = useState<string | null>(null);

  const cells = useMemo(() => {
    const first = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
    const startDay = (first.getDay() + 6) % 7;
    const start = new Date(first);
    start.setDate(start.getDate() - startDay);
    return Array.from({ length: 42 }, (_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      return d;
    });
  }, [cursor]);

  const selectedTasks = data.tasks.filter((t) => t.date === selected);

  const shift = (dir: number) => {
    if (mode === "month") {
      setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + dir, 1));
    } else {
      const d = new Date(selected);
      d.setDate(d.getDate() + dir * 7);
      setSelected(todayKey(d));
    }
  };

  return (
    <div className="space-y-4 px-5">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold tracking-tight">
          {MONTHS[cursor.getMonth()]} {cursor.getFullYear()}
        </h2>
        <div className="flex gap-2">
          <button
            onClick={() => shift(-1)}
            className="grid h-9 w-9 place-items-center rounded-xl bg-card hover:bg-accent"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => shift(1)}
            className="grid h-9 w-9 place-items-center rounded-xl bg-card hover:bg-accent"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 rounded-full bg-card p-1">
        {(["month", "week"] as const).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`rounded-full py-2 text-xs font-medium transition ${
              mode === m ? "bg-foreground text-background" : "text-muted-foreground"
            }`}
          >
            {m === "month" ? "Mes" : "Semana"}
          </button>
        ))}
      </div>

      {mode === "month" ? (
        <div className="premium-card rounded-3xl p-4">
          <div className="grid grid-cols-7 pb-3 text-center text-[11px] uppercase tracking-wider text-muted-foreground">
            {DAYS.map((d) => (
              <div key={d}>{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-y-2">
            {cells.map((d) => {
              const k = todayKey(d);
              const inMonth = d.getMonth() === cursor.getMonth();
              const isToday = k === todayKey(today);
              const isSelected = k === selected;
              const hasTasks = data.tasks.some((t) => t.date === k);
              return (
                <button
                  key={k}
                  onClick={() => setSelected(k)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => {
                    if (!dragId) return;
                    update((dd) => ({
                      ...dd,
                      tasks: dd.tasks.map((t) => (t.id === dragId ? { ...t, date: k } : t)),
                    }));
                    setDragId(null);
                  }}
                  className={`relative mx-auto grid h-10 w-10 place-items-center rounded-xl text-sm transition ${
                    isSelected
                      ? "bg-foreground font-semibold text-background"
                      : inMonth
                        ? "text-foreground hover:bg-accent"
                        : "text-muted-foreground/40"
                  } ${isToday && !isSelected ? "ring-1 ring-success" : ""}`}
                >
                  {d.getDate()}
                  {hasTasks && !isSelected && (
                    <span className="absolute bottom-1 h-1 w-1 rounded-full bg-success" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        <WeekCalendar date={new Date(selected)} />
      )}

      <div className="premium-card rounded-2xl p-4">
        <p className="mb-3 text-[11px] uppercase tracking-wider text-muted-foreground">
          {selected === todayKey(today) ? "Hoy" : selected}
        </p>
        {selectedTasks.length === 0 ? (
          <p className="text-sm text-muted-foreground">Sin tareas este día.</p>
        ) : (
          <ul className="space-y-2">
            {selectedTasks.map((t) => (
              <li
                key={t.id}
                draggable
                onDragStart={() => setDragId(t.id)}
                className="flex cursor-grab items-center gap-3 text-sm active:cursor-grabbing"
              >
                <span
                  className={`h-2 w-2 rounded-full ${
                    t.done ? "bg-success" : "bg-muted-foreground"
                  }`}
                />
                <span className={t.done ? "line-through text-muted-foreground" : ""}>
                  {t.title}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
