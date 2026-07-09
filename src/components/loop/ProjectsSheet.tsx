import { Plus, Trash2, FolderOpen } from "lucide-react";
import { useState } from "react";
import { useLoop, uid, projectProgress } from "@/lib/loop-store";
import { Sheet } from "./Sheet";

const COLORS = [
  "oklch(0.80 0.17 150)", // green
  "oklch(0.72 0.18 250)", // blue
  "oklch(0.82 0.16 80)",  // amber
  "oklch(0.72 0.20 20)",  // red
  "oklch(0.74 0.18 320)", // pink
  "oklch(0.75 0.14 280)", // violet
];

export function ProjectsSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { data, update } = useLoop();
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");
  const [color, setColor] = useState(COLORS[0]);

  const submit = () => {
    if (!name.trim()) return;
    update((d) => ({
      ...d,
      projects: [...d.projects, { id: uid(), name: name.trim(), color }],
    }));
    setCreating(false);
    setName("");
    setColor(COLORS[0]);
  };

  return (
    <Sheet open={open} onClose={onClose} title="Proyectos">
      {creating ? (
        <div className="space-y-3">
          <div>
            <label className="text-[11px] uppercase tracking-wider text-muted-foreground">
              Nombre
            </label>
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej. Portfolio"
              className="mt-1 w-full rounded-xl bg-card-2 px-3 py-2.5 outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div>
            <label className="text-[11px] uppercase tracking-wider text-muted-foreground">
              Color
            </label>
            <div className="mt-2 flex flex-wrap gap-2">
              {COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className={`h-9 w-9 rounded-full transition ${
                    color === c ? "ring-2 ring-foreground ring-offset-2 ring-offset-card" : ""
                  }`}
                  style={{ background: c }}
                />
              ))}
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            <button
              onClick={() => setCreating(false)}
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
      ) : (
        <>
          {data.projects.length === 0 ? (
            <div className="py-10 text-center">
              <FolderOpen className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Aún no tienes proyectos.</p>
            </div>
          ) : (
            <ul className="space-y-2">
              {data.projects.map((p) => {
                const pct = projectProgress(p, data.tasks);
                const count = data.tasks.filter((t) => t.projectId === p.id).length;
                return (
                  <li key={p.id} className="premium-card rounded-2xl p-4">
                    <div className="flex items-center gap-3">
                      <span
                        className="h-3 w-3 shrink-0 rounded-full"
                        style={{ background: p.color }}
                      />
                      <div className="flex-1">
                        <p className="font-medium">{p.name}</p>
                        <p className="text-[11px] text-muted-foreground">{count} tareas · {pct}%</p>
                      </div>
                      <button
                        onClick={() =>
                          update((d) => ({
                            ...d,
                            projects: d.projects.filter((x) => x.id !== p.id),
                            tasks: d.tasks.map((t) =>
                              t.projectId === p.id ? { ...t, projectId: undefined } : t,
                            ),
                          }))
                        }
                        className="text-muted-foreground hover:text-danger"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[var(--progress-track)]">
                      <div
                        className="h-full transition-all"
                        style={{ width: `${pct}%`, background: p.color }}
                      />
                    </div>
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
            Nuevo proyecto
          </button>
        </>
      )}
    </Sheet>
  );
}
