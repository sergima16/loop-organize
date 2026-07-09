import { Plus, Trash2, Target } from "lucide-react";
import { useState } from "react";
import { useLoop, uid, goalProgress, type Horizon } from "@/lib/loop-store";
import { Sheet } from "./Sheet";

const HORIZONS: { id: Horizon; label: string }[] = [
  { id: "corto", label: "Corto" },
  { id: "medio", label: "Medio" },
  { id: "largo", label: "Largo" },
];

export function GoalsSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { data, update } = useLoop();
  const [creating, setCreating] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState("");
  const [horizon, setHorizon] = useState<Horizon>("corto");
  const [editing, setEditing] = useState<string | null>(null);

  const reset = () => {
    setCreating(false);
    setTitle("");
    setDescription("");
    setDeadline("");
    setHorizon("corto");
  };

  const submit = () => {
    if (!title.trim()) return;
    update((d) => ({
      ...d,
      goals: [
        ...d.goals,
        {
          id: uid(),
          title: title.trim(),
          description: description.trim() || undefined,
          deadline: deadline || undefined,
          horizon,
          taskIds: [],
          habitIds: [],
        },
      ],
    }));
    reset();
  };

  const editingGoal = data.goals.find((g) => g.id === editing);

  return (
    <Sheet open={open} onClose={onClose} title="Objetivos">
      {creating ? (
        <div className="space-y-3">
          <Field label="Título">
            <input
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej. Correr una maratón"
              className="w-full rounded-xl bg-card-2 px-3 py-2.5 outline-none focus:ring-2 focus:ring-ring"
            />
          </Field>
          <Field label="Descripción">
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full resize-none rounded-xl bg-card-2 px-3 py-2.5 outline-none focus:ring-2 focus:ring-ring"
            />
          </Field>
          <Field label="Fecha límite">
            <input
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="w-full rounded-xl bg-card-2 px-3 py-2.5 outline-none focus:ring-2 focus:ring-ring"
            />
          </Field>
          <Field label="Horizonte">
            <div className="flex gap-2">
              {HORIZONS.map((h) => (
                <button
                  key={h.id}
                  onClick={() => setHorizon(h.id)}
                  className={`flex-1 rounded-full py-2 text-xs font-medium ${
                    horizon === h.id
                      ? "bg-foreground text-background"
                      : "bg-card-2 text-muted-foreground"
                  }`}
                >
                  {h.label}
                </button>
              ))}
            </div>
          </Field>
          <div className="flex gap-2 pt-2">
            <button
              onClick={reset}
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
      ) : editingGoal ? (
        <div className="space-y-3">
          <button
            onClick={() => setEditing(null)}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            ← Volver
          </button>
          <p className="font-display text-lg font-semibold">{editingGoal.title}</p>
          {editingGoal.description && (
            <p className="text-sm text-muted-foreground">{editingGoal.description}</p>
          )}
          <div className="premium-card rounded-2xl p-4">
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Progreso</p>
            <p className="mt-2 font-display text-3xl font-bold">
              {goalProgress(editingGoal, data.tasks, data.habits)}%
            </p>
          </div>
          <div>
            <p className="mb-2 text-[11px] uppercase tracking-wider text-muted-foreground">
              Tareas vinculadas
            </p>
            <div className="max-h-40 space-y-1 overflow-y-auto">
              {data.tasks.map((t) => {
                const on = editingGoal.taskIds.includes(t.id);
                return (
                  <label
                    key={t.id}
                    className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-card-2"
                  >
                    <input
                      type="checkbox"
                      checked={on}
                      onChange={() =>
                        update((d) => ({
                          ...d,
                          goals: d.goals.map((g) =>
                            g.id === editingGoal.id
                              ? {
                                  ...g,
                                  taskIds: on
                                    ? g.taskIds.filter((x) => x !== t.id)
                                    : [...g.taskIds, t.id],
                                }
                              : g,
                          ),
                        }))
                      }
                    />
                    <span className="text-sm">{t.title}</span>
                  </label>
                );
              })}
              {data.tasks.length === 0 && (
                <p className="text-xs text-muted-foreground">Sin tareas todavía.</p>
              )}
            </div>
          </div>
          <div>
            <p className="mb-2 text-[11px] uppercase tracking-wider text-muted-foreground">
              Hábitos vinculados
            </p>
            <div className="space-y-1">
              {data.habits.map((h) => {
                const on = editingGoal.habitIds.includes(h.id);
                return (
                  <label
                    key={h.id}
                    className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-card-2"
                  >
                    <input
                      type="checkbox"
                      checked={on}
                      onChange={() =>
                        update((d) => ({
                          ...d,
                          goals: d.goals.map((g) =>
                            g.id === editingGoal.id
                              ? {
                                  ...g,
                                  habitIds: on
                                    ? g.habitIds.filter((x) => x !== h.id)
                                    : [...g.habitIds, h.id],
                                }
                              : g,
                          ),
                        }))
                      }
                    />
                    <span className="text-sm">
                      {h.emoji} {h.name}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>
          <button
            onClick={() => {
              update((d) => ({ ...d, goals: d.goals.filter((g) => g.id !== editingGoal.id) }));
              setEditing(null);
            }}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-card-2 py-2.5 text-xs text-danger"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Eliminar objetivo
          </button>
        </div>
      ) : (
        <>
          {data.goals.length === 0 ? (
            <div className="py-10 text-center">
              <Target className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Aún no tienes objetivos.</p>
            </div>
          ) : (
            <ul className="space-y-2">
              {data.goals.map((g) => {
                const pct = goalProgress(g, data.tasks, data.habits);
                return (
                  <li key={g.id}>
                    <button
                      onClick={() => setEditing(g.id)}
                      className="premium-card w-full rounded-2xl p-4 text-left"
                    >
                      <div className="flex items-center justify-between">
                        <p className="font-medium">{g.title}</p>
                        <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                          {g.horizon}
                        </span>
                      </div>
                      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[var(--progress-track)]">
                        <div
                          className="h-full bg-foreground transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
                        <span>{pct}%</span>
                        {g.deadline && <span>{g.deadline}</span>}
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
          <button
            onClick={() => setCreating(true)}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-foreground py-3 text-sm font-medium text-background"
          >
            <Plus className="h-4 w-4" />
            Nuevo objetivo
          </button>
        </>
      )}
    </Sheet>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</label>
      <div className="mt-1">{children}</div>
    </div>
  );
}
