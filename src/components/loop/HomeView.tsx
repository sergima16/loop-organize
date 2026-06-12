import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import { useMemo, useState } from "react";
import { useLoop, todayKey, weekKeys } from "@/lib/loop-store";
import { ProgressRing } from "./ProgressRing";

const DAYS = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
const MONTHS = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

export function HomeView() {
  const { data } = useLoop();
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

  const dateLabel = `${DAYS[date.getDay()]}, ${date.getDate()} ${MONTHS[date.getMonth()]}`;

  return (
    <div className="space-y-7 px-5 pb-6">
      {/* Day navigator */}
      <div className="flex items-center justify-between text-muted-foreground pt-1">
        <button onClick={() => setOffset((o) => o - 1)} className="grid h-9 w-9 place-items-center rounded-full hover:text-foreground transition">
          <ChevronLeft className="h-5 w-5" />
        </button>
        <span className="text-[15px] font-medium tracking-tight text-foreground/90">{dateLabel}</span>
        <button onClick={() => setOffset((o) => o + 1)} className="grid h-9 w-9 place-items-center rounded-full hover:text-foreground transition">
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {/* Hero card */}
      <div className="premium-card p-7">
        <div className="flex items-center gap-7">
          <ProgressRing value={pct} size={138} stroke={8} />
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-semibold tracking-[0.22em] text-muted-foreground">PROGRESO</p>
            <p className="stat-num mt-2 font-display text-[40px] font-bold leading-none">
              {done}<span className="text-2xl font-semibold text-muted-foreground/50">/{total}</span>
            </p>
            <div className="hairline my-5" />
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Tareas</p>
                <p className="mt-1.5 font-display text-xl font-bold tracking-tight">
                  {tasksDone}<span className="text-muted-foreground/50">/{dayTasks.length}</span>
                </p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Hábitos</p>
                <p className="mt-1.5 font-display text-xl font-bold tracking-tight">
                  {habitsDone}<span className="text-muted-foreground/50">/{data.habits.length}</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2 cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="premium-card p-6">
          <p className="text-[10px] font-semibold tracking-[0.22em] text-muted-foreground">PENDIENTES</p>
          <p className="stat-num mt-5 font-display text-[46px] font-bold leading-none">{tasksPending}</p>
          <p className="mt-2.5 text-[12px] text-muted-foreground">tareas hoy</p>
        </div>
        <div className="premium-card p-6">
          <p className="text-[10px] font-semibold tracking-[0.22em] text-muted-foreground">HÁBITOS SEMANA</p>
          <p className={`stat-num mt-5 font-display text-[46px] font-bold leading-none ${weekPct >= 60 ? "text-success" : "text-foreground/90"}`}>
            {weekPct}<span className="text-2xl font-semibold text-muted-foreground/50">%</span>
          </p>
          <p className="mt-2.5 text-[12px] text-muted-foreground">completado</p>
        </div>
      </div>

      {/* Empty state CTA */}
      {data.tasks.length === 0 && (
        <div className="pt-6 text-center space-y-2">
          <p className="text-sm text-muted-foreground">Comienza creando tareas y hábitos</p>
          <p className="inline-flex items-center gap-2 text-[15px] font-medium text-foreground">
            Ir a Checks <ArrowRight className="h-4 w-4" />
          </p>
        </div>
      )}
    </div>
  );
}
