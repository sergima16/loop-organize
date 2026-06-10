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
    <div className="space-y-4 px-5">
      <div className="flex items-center justify-between text-muted-foreground">
        <button onClick={() => setOffset((o) => o - 1)} className="p-2 hover:text-foreground">
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className="text-sm">{dayLabel}</span>
        <button onClick={() => setOffset((o) => o + 1)} className="p-2 hover:text-foreground">
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>


      <div className="premium-card rounded-3xl p-5">
        <div className="flex items-center gap-5">
          <ProgressRing value={pct} />
          <div className="flex-1">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              PROGRESO
            </p>
            <p className="font-display text-4xl font-extrabold leading-none tracking-tight">
              {done}
              <span className="text-2xl font-bold text-muted-foreground">/{total}</span>
            </p>
            <div className="mt-4 h-px bg-border" />
            <div className="mt-3 grid grid-cols-2 gap-2">
              <div>
                <p className="text-sm text-muted-foreground">Tareas</p>
                <p className="font-display text-lg font-extrabold tracking-tight">
                  {tasksDone}<span className="text-muted-foreground">/{dayTasks.length}</span>
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Hábitos</p>
                <p className="font-display text-lg font-extrabold tracking-tight">
                  {habitsDone}<span className="text-muted-foreground">/{data.habits.length}</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="premium-card rounded-2xl p-4">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            PENDIENTES HOY
          </p>
          <p className="font-display text-4xl font-extrabold tracking-tight">
            {dayTasks.length - tasksDone}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">tareas</p>
        </div>
        <div className="premium-card rounded-2xl p-4">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            HÁBITOS SEMANA
          </p>
          <p className={`font-display text-4xl font-extrabold tracking-tight ${weekPct >= 60 ? "text-success" : weekPct > 0 ? "text-danger" : "text-muted-foreground"}`}>
            {weekPct}%
          </p>
          <p className="mt-1 text-sm text-muted-foreground">completado</p>
        </div>
      </div>

      <div className="premium-card rounded-2xl p-4">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
            Próximas
          </p>
          <span className="text-xs text-muted-foreground">Ver todo →</span>
        </div>
        {upcoming.length === 0 ? (
          <p className="py-2 text-sm text-muted-foreground">Sin tareas próximas</p>
        ) : (
          <ul className="space-y-2.5">
            {upcoming.map((t) => (
              <li key={t.id} className="flex items-center gap-3">
                <button
                  onClick={() => toggleTask(t.id)}
                  className="h-5 w-5 rounded-full border-2 border-muted-foreground/40 transition hover:border-foreground"
                />
                <span className="text-sm font-medium">{t.title}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="premium-card rounded-2xl p-4">
        <p className="mb-3 text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
          Hábitos de hoy
        </p>
        {data.habits.length === 0 ? (
          <p className="py-2 text-sm text-muted-foreground">Sin hábitos todavía</p>
        ) : (
          <ul className="space-y-3">
            {data.habits.map((h) => {
              const state = h.log[dateKey];
              const isDone = state === true;
              return (
                <li key={h.id} className="flex items-center gap-3">
                  <span className="text-lg">{h.emoji}</span>
                  <span className="flex-1 text-sm">{h.name}</span>
                  <button
                    onClick={() => toggleHabit(h.id)}
                    className={`grid h-7 w-7 place-items-center rounded-full transition ${
                      isDone
                        ? "bg-success text-success-foreground"
                        : "bg-danger/20 text-danger hover:bg-danger/30"
                    }`}
                  >
                    {isDone ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <p className="py-4 text-center text-xs italic text-muted-foreground">
        Hoy es un buen día para avanzar.
      </p>
    </div>
  );
}
