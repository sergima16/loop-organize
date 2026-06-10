import { ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";
import { useLoop, todayKey, weekKeys } from "@/lib/loop-store";
import { ProgressRing } from "./ProgressRing";
import { Check, X } from "lucide-react";

function greeting(d = new Date()) {
  const h = d.getHours();
  if (h < 6) return "Buenas noches";
  if (h < 13) return "Buenos días";
  if (h < 20) return "Buenas tardes";
  return "Buenas noches";
}

const DAY_NAMES = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
const MONTHS = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

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
  const habitsDone = data.habits.filter((h) => h.log[dateKey] === true).length;
  const total = dayTasks.length + data.habits.length;
  const done = tasksDone + habitsDone;
  const pct = total === 0 ? 0 : Math.round((done / total) * 100);

  // weekly habits %
  const week = weekKeys(date);
  const weekSlots = data.habits.length * 7;
  const weekDone = data.habits.reduce(
    (acc, h) => acc + week.filter((k) => h.log[k] === true).length,
    0
  );
  const weekPct = weekSlots === 0 ? 0 : Math.round((weekDone / weekSlots) * 100);

  const upcoming = data.tasks
    .filter((t) => !t.done && t.date >= dateKey)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 3);

  const dayLabel = `${DAY_NAMES[date.getDay()]}, ${date.getDate()} ${MONTHS[date.getMonth()]}`;

  const toggleHabit = (id: string) => {
    update((d) => ({
      ...d,
      habits: d.habits.map((h) =>
        h.id === id
          ? { ...h, log: { ...h.log, [dateKey]: !(h.log[dateKey] === true) } }
          : h
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
    <div className="space-y-5 px-5 pb-2">
      <div className="flex items-center justify-between text-muted-foreground">
        <button onClick={() => setOffset((o) => o - 1)} className="grid h-9 w-9 place-items-center rounded-full hover:bg-card hover:text-foreground transition">
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className="text-[13px] font-medium tracking-tight">{dayLabel}</span>
        <button onClick={() => setOffset((o) => o + 1)} className="grid h-9 w-9 place-items-center rounded-full hover:bg-card hover:text-foreground transition">
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div className="premium-card p-6">
        <div className="flex items-center gap-6">
          <ProgressRing value={pct} size={132} stroke={9} />
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Progreso
            </p>
            <p className="mt-1 font-display text-5xl font-bold leading-none tracking-[-0.04em]">
              {done}
              <span className="ml-0.5 text-2xl font-semibold text-muted-foreground/60">/{total}</span>
            </p>
            <div className="hairline my-5" />
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">Tareas</p>
                <p className="mt-1 font-display text-xl font-bold tracking-tight">
                  {tasksDone}<span className="text-muted-foreground/60">/{dayTasks.length}</span>
                </p>
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">Hábitos</p>
                <p className="mt-1 font-display text-xl font-bold tracking-tight">
                  {habitsDone}<span className="text-muted-foreground/60">/{data.habits.length}</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="premium-card p-5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Pendientes
          </p>
          <p className="mt-2 font-display text-5xl font-bold leading-none tracking-[-0.04em]">
            {dayTasks.length - tasksDone}
          </p>
          <p className="mt-2 text-xs text-muted-foreground">tareas hoy</p>
        </div>
        <div className="premium-card p-5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Hábitos
          </p>
          <p className={`mt-2 font-display text-5xl font-bold leading-none tracking-[-0.04em] ${weekPct >= 60 ? "text-success" : weekPct > 0 ? "text-foreground" : "text-muted-foreground"}`}>
            {weekPct}<span className="text-2xl font-semibold text-muted-foreground/60">%</span>
          </p>
          <p className="mt-2 text-xs text-muted-foreground">esta semana</p>
        </div>
      </div>

      <div className="premium-card p-5">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Próximas
          </p>
          <span className="text-xs text-muted-foreground">Ver todo →</span>
        </div>
        {upcoming.length === 0 ? (
          <p className="py-2 text-sm text-muted-foreground">Sin tareas próximas</p>
        ) : (
          <ul className="space-y-3">
            {upcoming.map((t) => (
              <li key={t.id} className="flex items-center gap-3">
                <button
                  onClick={() => toggleTask(t.id)}
                  className="h-5 w-5 rounded-full border-2 border-muted-foreground/30 transition hover:border-foreground"
                />
                <span className="text-sm font-medium tracking-tight">{t.title}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="premium-card p-5">
        <p className="mb-4 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          Hábitos de hoy
        </p>
        {data.habits.length === 0 ? (
          <p className="py-2 text-sm text-muted-foreground">Sin hábitos todavía</p>
        ) : (
          <ul className="space-y-3.5">
            {data.habits.map((h) => {
              const state = h.log[dateKey];
              const isDone = state === true;
              return (
                <li key={h.id} className="flex items-center gap-3">
                  <span className="text-lg">{h.emoji}</span>
                  <span className="flex-1 text-sm font-medium tracking-tight">{h.name}</span>
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

      <p className="py-3 text-center text-xs italic text-muted-foreground/70">
        Hoy es un buen día para avanzar.
      </p>
    </div>
  );
}
