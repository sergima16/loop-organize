import { ChevronLeft, ChevronRight, Check, X } from "lucide-react";
import { useMemo, useState } from "react";
import { useLoop, todayKey, weekKeys } from "@/lib/loop-store";
import { ProgressRing } from "./ProgressRing";

const DAY_LETTERS = ["L", "M", "X", "J", "V", "S", "D"];

export function HomeView() {
  const { data, update } = useLoop();
  const [offset, setOffset] = useState(0);

  const date = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + offset);
    return d;
  }, [offset]);
  const dateKey = todayKey(date);

  const dayTasks = data.tasks.filter((t) => t.date === dateKey);
  const tasksDone = dayTasks.filter((t) => t.done).length;
  const tasksPending = dayTasks.length - tasksDone;
  const habitsDone = data.habits.filter((h) => h.log[dateKey] === true).length;
  const total = dayTasks.length + data.habits.length;
  const done = tasksDone + habitsDone;
  const pct = total === 0 ? 0 : Math.round((done / total) * 100);

  const week = weekKeys(date);
  const weekSlots = data.habits.length * 7;
  const weekDone = data.habits.reduce(
    (acc, h) => acc + week.filter((k) => h.log[k] === true).length,
    0,
  );
  const weekPct = weekSlots === 0 ? 0 : Math.round((weekDone / weekSlots) * 100);

  // streak: consecutive days back from today where all habits done
  const streak = useMemo(() => {
    if (data.habits.length === 0) return 0;
    let s = 0;
    const d = new Date();
    for (let i = 0; i < 60; i++) {
      const k = todayKey(d);
      const allDone = data.habits.every((h) => h.log[k] === true);
      if (allDone) s++;
      else if (i > 0) break;
      d.setDate(d.getDate() - 1);
    }
    return s;
  }, [data.habits]);

  const upcoming = data.tasks
    .filter((t) => !t.done && t.date >= dateKey)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 3);

  const isToday = offset === 0;
  const label = isToday ? "hoy" : offset === -1 ? "ayer" : offset === 1 ? "mañana" : dateKey;

  const toggleHabit = (id: string) => {
    update((d) => ({
      ...d,
      habits: d.habits.map((h) =>
        h.id === id
          ? { ...h, log: { ...h.log, [dateKey]: !(h.log[dateKey] === true) } }
          : h,
      ),
    }));
  };

  const toggleTask = (id: string) => {
    update((d) => ({
      ...d,
      tasks: d.tasks.map((t) => (t.id === id ? { ...t, done: !t.done } : t)),
    }));
  };

  return (
    <div className="space-y-3 px-4 pb-2">
      {/* Day navigator */}
      <div className="flex items-center justify-between text-muted-foreground">
        <button onClick={() => setOffset((o) => o - 1)} className="grid h-9 w-9 place-items-center rounded-full hover:text-foreground transition">
          <ChevronLeft className="h-5 w-5" />
        </button>
        <span className="text-base font-medium lowercase text-foreground/90">{label}</span>
        <button onClick={() => setOffset((o) => o + 1)} className="grid h-9 w-9 place-items-center rounded-full hover:text-foreground transition">
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {/* Hero card: ring + side stats */}
      <div className="premium-card p-5">
        <div className="flex items-center gap-4">
          <ProgressRing value={pct} size={140} stroke={10} label={`${pct}`} sublabel="Productividad" />
          <div className="flex-1 min-w-0 space-y-5">
            <div>
              <p className="text-[13px] text-muted-foreground">Pendientes</p>
              <p className="font-display text-[26px] font-bold leading-tight tracking-tight">
                {tasksPending}<span className="ml-1 text-base font-semibold text-muted-foreground/70">tareas</span>
              </p>
            </div>
            <div>
              <p className="text-[13px] text-muted-foreground">Hábitos hoy</p>
              <p className="font-display text-[26px] font-bold leading-tight tracking-tight">
                {habitsDone}<span className="text-muted-foreground/60">/{data.habits.length}</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 2x2 grid: hábitos semana + próximas */}
      <div className="grid grid-cols-2 gap-3">
        <div className="premium-card p-5">
          <p className="text-[13px] text-muted-foreground">Hábitos semana</p>
          <p className={`mt-2 font-display text-[34px] font-bold leading-none tracking-tight ${weekPct >= 60 ? "text-success" : "text-foreground"}`}>
            {weekPct}<span className="text-xl font-semibold text-muted-foreground/70">%</span>
          </p>
          <p className="mt-3 text-xs text-muted-foreground">{weekDone} de {weekSlots} completados</p>
        </div>
        <div className="premium-card p-5">
          <p className="text-[13px] text-muted-foreground">Próximas</p>
          {upcoming.length === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground/80">Ninguna tarea<br />activa</p>
          ) : (
            <ul className="mt-2 space-y-1.5">
              {upcoming.slice(0, 3).map((t) => (
                <li key={t.id} className="flex items-center gap-2">
                  <button
                    onClick={() => toggleTask(t.id)}
                    className="h-3.5 w-3.5 shrink-0 rounded-full border border-muted-foreground/40 hover:border-foreground transition"
                  />
                  <span className="truncate text-[13px] font-medium">{t.title}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Bottom row: racha + mini semana */}
      <div className="grid grid-cols-2 gap-3">
        <div className="premium-card p-5">
          <p className="text-[13px] text-muted-foreground">Mejor racha</p>
          <p className="mt-2 font-display text-[34px] font-bold leading-none tracking-tight">
            {streak}<span className="ml-1 text-base font-semibold text-muted-foreground/70">días</span>
          </p>
          <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
            <span>🌿</span>
            <span>{streak > 0 ? "sigue así" : "empieza hoy"}</span>
            <span>🌿</span>
          </div>
        </div>

        <div className="premium-card p-4">
          <div className="grid grid-cols-7 gap-1 text-center text-[10px] text-muted-foreground">
            {DAY_LETTERS.map((d) => (
              <div key={d}>{d}</div>
            ))}
          </div>
          <div className="mt-2 grid grid-cols-7 gap-1">
            {week.map((k) => {
              const slots = data.habits.length;
              const dDone = slots === 0 ? 0 : data.habits.filter((h) => h.log[k] === true).length;
              const p = slots === 0 ? 0 : dDone / slots;
              const isCur = k === todayKey(new Date());
              const color = p >= 0.6 ? "text-success" : p > 0 ? "text-foreground" : "text-muted-foreground/40";
              const day = Number(k.slice(-2));
              return (
                <div
                  key={k}
                  className={`grid h-7 place-items-center rounded-md text-[11px] font-semibold ${color} ${isCur ? "bg-foreground/10" : ""}`}
                >
                  {day}
                </div>
              );
            })}
          </div>
          <div className="mt-2 flex items-center justify-center gap-3 text-[10px] text-muted-foreground">
            <span className="text-danger">·&lt;60%</span>
            <span className="text-success">·&gt;60%</span>
          </div>
        </div>
      </div>

      {/* Hábitos de hoy (functionality preserved) */}
      <div className="premium-card p-5">
        <p className="mb-3 text-[13px] text-muted-foreground">Hábitos de hoy</p>
        {data.habits.length === 0 ? (
          <p className="py-2 text-sm text-muted-foreground">Sin hábitos todavía</p>
        ) : (
          <ul className="space-y-3">
            {data.habits.map((h) => {
              const isDone = h.log[dateKey] === true;
              return (
                <li key={h.id} className="flex items-center gap-3">
                  <span className="text-lg">{h.emoji}</span>
                  <span className="flex-1 text-sm font-medium">{h.name}</span>
                  <button
                    onClick={() => toggleHabit(h.id)}
                    className={`grid h-7 w-7 place-items-center rounded-full transition ${
                      isDone
                        ? "bg-success text-success-foreground"
                        : "bg-card-2 text-muted-foreground hover:text-danger"
                    }`}
                  >
                    {isDone ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5" />}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
