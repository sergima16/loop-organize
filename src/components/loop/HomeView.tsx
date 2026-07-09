import { ChevronLeft, ChevronRight, Target, FolderOpen, Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { useLoop, todayKey, weekKeys, goalProgress, projectProgress } from "@/lib/loop-store";
import { ProgressRing } from "./ProgressRing";
import { GoalsSheet } from "./GoalsSheet";
import { ProjectsSheet } from "./ProjectsSheet";

const DAYS = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
const MONTHS = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

export function HomeView() {
  const { data } = useLoop();
  const [offset, setOffset] = useState(0);
  const [goalsOpen, setGoalsOpen] = useState(false);
  const [projectsOpen, setProjectsOpen] = useState(false);

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
      <div className="flex items-center justify-between text-muted-foreground pt-1">
        <button onClick={() => setOffset((o) => o - 1)} className="grid h-9 w-9 place-items-center rounded-full hover:text-foreground transition">
          <ChevronLeft className="h-5 w-5" />
        </button>
        <span className="text-[15px] font-medium tracking-tight text-foreground/90">{dateLabel}</span>
        <button onClick={() => setOffset((o) => o + 1)} className="grid h-9 w-9 place-items-center rounded-full hover:text-foreground transition">
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

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

      {/* Objetivos */}
      <section>
        <div className="mb-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="h-3.5 w-3.5 text-muted-foreground" />
            <p className="text-[10px] font-semibold tracking-[0.22em] text-muted-foreground">
              OBJETIVOS
            </p>
          </div>
          <button
            onClick={() => setGoalsOpen(true)}
            className="text-[11px] text-muted-foreground hover:text-foreground"
          >
            Ver todos
          </button>
        </div>
        {data.goals.length === 0 ? (
          <button
            onClick={() => setGoalsOpen(true)}
            className="premium-card flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-sm text-muted-foreground hover:text-foreground"
          >
            <Plus className="h-4 w-4" /> Añade tu primer objetivo
          </button>
        ) : (
          <div className="-mx-5 flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 pb-1">
            {data.goals.map((g) => {
              const pct = goalProgress(g, data.tasks, data.habits);
              return (
                <button
                  key={g.id}
                  onClick={() => setGoalsOpen(true)}
                  className="premium-card w-52 shrink-0 snap-start rounded-2xl p-4 text-left"
                >
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    {g.horizon}
                  </p>
                  <p className="mt-1.5 line-clamp-2 text-sm font-medium">{g.title}</p>
                  <div className="mt-3 h-1 overflow-hidden rounded-full bg-[var(--progress-track)]">
                    <div
                      className="h-full bg-foreground transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <p className="mt-2 text-[11px] text-muted-foreground">{pct}%</p>
                </button>
              );
            })}
          </div>
        )}
      </section>

      {/* Proyectos */}
      <section>
        <div className="mb-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FolderOpen className="h-3.5 w-3.5 text-muted-foreground" />
            <p className="text-[10px] font-semibold tracking-[0.22em] text-muted-foreground">
              PROYECTOS
            </p>
          </div>
          <button
            onClick={() => setProjectsOpen(true)}
            className="text-[11px] text-muted-foreground hover:text-foreground"
          >
            Ver todos
          </button>
        </div>
        {data.projects.length === 0 ? (
          <button
            onClick={() => setProjectsOpen(true)}
            className="premium-card flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-sm text-muted-foreground hover:text-foreground"
          >
            <Plus className="h-4 w-4" /> Añade tu primer proyecto
          </button>
        ) : (
          <div className="-mx-5 flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 pb-1">
            {data.projects.map((p) => {
              const pct = projectProgress(p, data.tasks);
              const count = data.tasks.filter((t) => t.projectId === p.id).length;
              return (
                <button
                  key={p.id}
                  onClick={() => setProjectsOpen(true)}
                  className="premium-card w-52 shrink-0 snap-start rounded-2xl p-4 text-left"
                >
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: p.color }} />
                    <p className="line-clamp-1 text-sm font-medium">{p.name}</p>
                  </div>
                  <div className="mt-3 h-1 overflow-hidden rounded-full bg-[var(--progress-track)]">
                    <div
                      className="h-full transition-all"
                      style={{ width: `${pct}%`, background: p.color }}
                    />
                  </div>
                  <p className="mt-2 text-[11px] text-muted-foreground">
                    {count} tareas · {pct}%
                  </p>
                </button>
              );
            })}
          </div>
        )}
      </section>

      <GoalsSheet open={goalsOpen} onClose={() => setGoalsOpen(false)} />
      <ProjectsSheet open={projectsOpen} onClose={() => setProjectsOpen(false)} />
    </div>
  );
}
