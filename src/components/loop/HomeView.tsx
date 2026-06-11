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

  const hour = new Date().getHours();
  const greeting =
    hour < 6 ? "Buenas noches" : hour < 13 ? "Buenos días" : hour < 21 ? "Buenas tardes" : "Buenas noches";

  return (
    <div className="space-y-5 px-5 pb-2">
      {/* Day navigator */}
      <div className="flex items-center justify-between text-muted-foreground pt-1">
        <button onClick={() => setOffset((o) => o - 1)} className="grid h-9 w-9 place-items-center rounded-full hover:text-foreground transition">
          <ChevronLeft className="h-5 w-5" />
        </button>
        <span className="text-base font-medium text-foreground/85">{dateLabel}</span>
        <button onClick={() => setOffset((o) => o + 1)} className="grid h-9 w-9 place-items-center rounded-full hover:text-foreground transition">
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {/* Greeting */}
      <p className="text-base text-foreground/80 -mb-1">{greeting}</p>

      {/* Hero card */}
      <div className="premium-card p-5">
        <div className="flex items-center gap-5">
          <ProgressRing value={pct} size={130} stroke={9} />
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-medium tracking-[0.18em] text-muted-foreground">PROGRESO</p>
            <p className="mt-1 font-display text-[34px] font-bold leading-none tracking-tight">
              {done}<span className="text-2xl font-semibold text-muted-foreground/60">/{total}</span>
            </p>
            <div className="hairline my-4" />
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-[12px] text-muted-foreground">Tareas</p>
                <p className="mt-1 font-display text-lg font-bold tracking-tight">
                  {tasksDone}<span className="text-muted-foreground/60">/{dayTasks.length}</span>
                </p>
              </div>
              <div>
                <p className="text-[12px] text-muted-foreground">Hábitos</p>
                <p className="mt-1 font-display text-lg font-bold tracking-tight">
                  {habitsDone}<span className="text-muted-foreground/60">/{data.habits.length}</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2 cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="premium-card p-5">
          <p className="text-[11px] font-medium tracking-[0.18em] text-muted-foreground">PENDIENTES HOY</p>
          <p className="mt-3 font-display text-[40px] font-bold leading-none tracking-tight">{tasksPending}</p>
          <p className="mt-2 text-[13px] text-muted-foreground">tareas</p>
        </div>
        <div className="premium-card p-5">
          <p className="text-[11px] font-medium tracking-[0.18em] text-muted-foreground">HÁBITOS SEMANA</p>
          <p className={`mt-3 font-display text-[40px] font-bold leading-none tracking-tight ${weekPct >= 60 ? "text-success" : "text-foreground/70"}`}>
            {weekPct}<span className="text-2xl font-semibold text-muted-foreground/60">%</span>
          </p>
          <p className="mt-2 text-[13px] text-muted-foreground">completado</p>
        </div>
      </div>

      {/* Motivational */}
      <p className="text-center text-sm italic text-muted-foreground/80 pt-2">
        Hoy es un buen día para avanzar.
      </p>

      {/* Empty state CTA */}
      {data.tasks.length === 0 && (
        <div className="pt-8 text-center space-y-2">
          <p className="text-sm text-muted-foreground">Comienza creando tareas y hábitos</p>
          <p className="inline-flex items-center gap-2 text-base font-medium text-foreground">
            Ir a Checks <ArrowRight className="h-4 w-4" />
          </p>
        </div>
      )}
    </div>
  );
}
