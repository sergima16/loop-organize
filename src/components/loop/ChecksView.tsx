import { Plus, Trash2, Check, X } from "lucide-react";
import { useState } from "react";
import { useLoop, uid, todayKey, weekKeys, type Priority } from "@/lib/loop-store";

type MainTab = "tareas" | "habitos";
type TaskFilter = "hoy" | "todas";

const PRIORITIES: Priority[] = ["Baja", "Media", "Importante"];
const PRIORITY_TONE: Record<Priority, string> = {
  Baja: "bg-accent text-muted-foreground",
  Media: "bg-foreground/10 text-foreground",
  Importante: "bg-danger/20 text-danger",
};

const DAY_LETTERS = ["L", "M", "X", "J", "V", "S", "D"];

export function ChecksView() {
  const { data, update } = useLoop();
  const [tab, setTab] = useState<MainTab>("tareas");
  const [filter, setFilter] = useState<TaskFilter>("hoy");
  const [open, setOpen] = useState(false);

  const today = todayKey();
  const tasks = data.tasks
    .filter((t) => (filter === "hoy" ? t.date === today : true))
    .sort((a, b) => a.date.localeCompare(b.date));

  const week = weekKeys();
  const weekDone = data.habits.reduce(
    (acc, h) => acc + week.filter((k) => h.log[k] === true).length,
    0
  );
  const weekPct = data.habits.length
    ? Math.round((weekDone / (data.habits.length * 7)) * 100)
    : 0;

  return (
    <div className="space-y-4 px-5 pb-4">
      <div className="flex items-center justify-end">
        <button
          onClick={() => setOpen(true)}
          className="grid h-10 w-10 place-items-center rounded-2xl bg-foreground text-background transition hover:scale-105"
        >
          <Plus className="h-5 w-5" />
        </button>
      </div>


      <div className="grid grid-cols-2 rounded-full bg-card p-1">
        {(["tareas", "habitos"] as MainTab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-full py-2 text-sm font-medium transition ${
              tab === t ? "bg-card-2 text-foreground" : "text-muted-foreground"
            }`}
          >
            {t === "tareas" ? "Tareas" : "Hábitos"}
          </button>
        ))}
      </div>

      {tab === "tareas" ? (
        <>
          <div className="flex gap-2">
            {(["hoy", "todas"] as TaskFilter[]).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`rounded-full px-4 py-1.5 text-xs font-medium transition ${
                  filter === f
                    ? "bg-foreground text-background"
                    : "bg-card text-muted-foreground hover:text-foreground"
                }`}
              >
                {f === "hoy" ? "Hoy" : "Todas"}
              </button>
            ))}
          </div>

          {tasks.length === 0 ? (
            <p className="py-16 text-center text-sm text-muted-foreground">
              No hay tareas. Crea una nueva ✨
            </p>
          ) : (
            <ul className="space-y-2">
              {tasks.map((t) => (
                <li
                  key={t.id}
                  className="flex items-center gap-3 premium-card rounded-2xl px-4 py-3"
                >
                  <button
                    onClick={() =>
                      update((d) => ({
                        ...d,
                        tasks: d.tasks.map((x) =>
                          x.id === t.id ? { ...x, done: !x.done } : x
                        ),
                      }))
                    }
                    className={`grid h-6 w-6 place-items-center rounded-full border-2 transition ${
                      t.done
                        ? "border-success bg-success text-success-foreground"
                        : "border-muted-foreground/40 hover:border-foreground"
                    }`}
                  >
                    {t.done && <Check className="h-3.5 w-3.5" />}
                  </button>
                  <div className="flex-1">
                    <p className={`font-medium ${t.done ? "line-through text-muted-foreground" : ""}`}>
                      {t.title}
                    </p>
                    <span
                      className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] ${PRIORITY_TONE[t.priority]}`}
                    >
                      {t.priority}
                    </span>
                  </div>
                  <button
                    onClick={() =>
                      update((d) => ({ ...d, tasks: d.tasks.filter((x) => x.id !== t.id) }))
                    }
                    className="text-muted-foreground hover:text-danger"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </>
      ) : (
        <>
          <p className="text-sm text-muted-foreground">{weekPct}% esta semana</p>
          {data.habits.length === 0 ? (
            <p className="py-16 text-center text-sm text-muted-foreground">
              Sin hábitos. Crea uno nuevo ✨
            </p>
          ) : (
            <ul className="space-y-3">
              {data.habits.map((h) => {
                const doneCount = week.filter((k) => h.log[k] === true).length;
                return (
                  <li key={h.id} className="premium-card rounded-2xl p-4">
                    <div className="mb-3 flex items-center gap-3">
                      <span className="text-xl">{h.emoji}</span>
                      <span className="flex-1 font-medium">{h.name}</span>
                      <span className="text-xs text-muted-foreground">{doneCount}/7</span>
                      <button
                        onClick={() =>
                          update((d) => ({
                            ...d,
                            habits: d.habits.filter((x) => x.id !== h.id),
                          }))
                        }
                        className="text-muted-foreground hover:text-danger"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="grid grid-cols-7 gap-1">
                      {week.map((k, i) => {
                        const v = h.log[k];
                        const isFuture = k > todayKey();
                        return (
                          <div key={k} className="flex flex-col items-center gap-1">
                            <span className="text-[10px] text-muted-foreground">
                              {DAY_LETTERS[i]}
                            </span>
                            <button
                              disabled={isFuture}
                              onClick={() =>
                                update((d) => ({
                                  ...d,
                                  habits: d.habits.map((x) =>
                                    x.id === h.id
                                      ? {
                                          ...x,
                                          log: {
                                            ...x.log,
                                            [k]: !(x.log[k] === true),
                                          },
                                        }
                                      : x
                                  ),
                                }))
                              }
                              className={`grid h-8 w-8 place-items-center rounded-full transition ${
                                isFuture
                                  ? "bg-accent/40 text-muted-foreground/30"
                                  : v === true
                                    ? "bg-success text-success-foreground"
                                    : "bg-danger/20 text-danger"
                              }`}
                            >
                              {v === true ? (
                                <Check className="h-3.5 w-3.5" />
                              ) : isFuture ? null : (
                                <X className="h-3.5 w-3.5" />
                              )}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </>
      )}

      {open && <CreateModal kind={tab} onClose={() => setOpen(false)} />}
    </div>
  );
}

function CreateModal({ kind, onClose }: { kind: MainTab; onClose: () => void }) {
  const { update } = useLoop();
  const [title, setTitle] = useState("");
  const [emoji, setEmoji] = useState("✨");
  const [priority, setPriority] = useState<Priority>("Media");
  const [date, setDate] = useState(todayKey());

  const submit = () => {
    if (!title.trim()) return;
    if (kind === "tareas") {
      update((d) => ({
        ...d,
        tasks: [...d.tasks, { id: uid(), title: title.trim(), priority, date, done: false }],
      }));
    } else {
      update((d) => ({
        ...d,
        habits: [...d.habits, { id: uid(), emoji, name: title.trim(), log: {} }],
      }));
    }
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm sm:items-center"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md space-y-4 rounded-t-3xl bg-card p-5 sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto h-1 w-10 rounded-full bg-border sm:hidden" />
        <h2 className="font-display text-xl font-semibold">
          {kind === "tareas" ? "Nueva tarea" : "Nuevo hábito"}
        </h2>

        {kind === "habitos" && (
          <div>
            <label className="text-[11px] uppercase tracking-wider text-muted-foreground">
              Emoji
            </label>
            <input
              value={emoji}
              onChange={(e) => setEmoji(e.target.value)}
              maxLength={2}
              className="mt-1 w-16 rounded-xl bg-card-2 px-3 py-2 text-center text-lg outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        )}

        <div>
          <label className="text-[11px] uppercase tracking-wider text-muted-foreground">
            Nombre
          </label>
          <input
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={kind === "tareas" ? "Ej. Estudiar" : "Ej. Meditar"}
            className="mt-1 w-full rounded-xl bg-card-2 px-3 py-2.5 outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        {kind === "tareas" && (
          <>
            <div>
              <label className="text-[11px] uppercase tracking-wider text-muted-foreground">
                Fecha
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="mt-1 w-full rounded-xl bg-card-2 px-3 py-2.5 outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label className="text-[11px] uppercase tracking-wider text-muted-foreground">
                Prioridad
              </label>
              <div className="mt-2 flex gap-2">
                {PRIORITIES.map((p) => (
                  <button
                    key={p}
                    onClick={() => setPriority(p)}
                    className={`flex-1 rounded-full py-2 text-xs font-medium transition ${
                      priority === p
                        ? "bg-foreground text-background"
                        : "bg-card-2 text-muted-foreground"
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        <div className="flex gap-2 pt-2">
          <button
            onClick={onClose}
            className="flex-1 rounded-full bg-card-2 py-3 text-sm font-medium text-muted-foreground"
          >
            Cancelar
          </button>
          <button
            onClick={submit}
            className="flex-1 rounded-full bg-foreground py-3 text-sm font-medium text-background"
          >
            Crear
          </button>
        </div>
      </div>
    </div>
  );
}
