import { Bell, Moon, Sun } from "lucide-react";
import { useLoop } from "@/lib/loop-store";
import { Sheet } from "./Sheet";

const ACCENTS: { id: string; label: string; color: string }[] = [
  { id: "default", label: "Plata", color: "oklch(0.995 0 0)" },
  { id: "green", label: "Verde", color: "oklch(0.80 0.17 150)" },
  { id: "blue", label: "Azul", color: "oklch(0.72 0.18 250)" },
  { id: "amber", label: "Ámbar", color: "oklch(0.82 0.16 80)" },
  { id: "pink", label: "Rosa", color: "oklch(0.74 0.18 320)" },
  { id: "violet", label: "Violeta", color: "oklch(0.75 0.14 280)" },
];

interface Props {
  open: boolean;
  onClose: () => void;
  light: boolean;
  onToggleTheme: () => void;
}

export function SettingsSheet({ open, onClose, light, onToggleTheme }: Props) {
  const { data, update } = useLoop();

  const requestNotif = async () => {
    if (typeof Notification === "undefined") return;
    const perm = await Notification.requestPermission();
    update((d) => ({
      ...d,
      settings: { ...d.settings, notifications: perm === "granted" },
    }));
  };

  return (
    <Sheet open={open} onClose={onClose} title="Ajustes">
      <div className="space-y-5">
        <div>
          <p className="mb-2 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Tema</p>
          <button
            onClick={onToggleTheme}
            className="premium-card flex w-full items-center justify-between rounded-2xl p-4"
          >
            <span className="flex items-center gap-3 text-sm font-medium">
              {light ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              {light ? "Modo claro" : "Modo oscuro"}
            </span>
            <span className="text-xs text-muted-foreground">Cambiar</span>
          </button>
        </div>

        <div>
          <p className="mb-2 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            Color de acento
          </p>
          <div className="grid grid-cols-3 gap-2">
            {ACCENTS.map((a) => (
              <button
                key={a.id}
                onClick={() =>
                  update((d) => ({ ...d, settings: { ...d.settings, accent: a.id } }))
                }
                className={`premium-card flex flex-col items-center gap-2 rounded-2xl p-3 transition ${
                  data.settings.accent === a.id ? "ring-2 ring-foreground" : ""
                }`}
              >
                <span className="h-6 w-6 rounded-full" style={{ background: a.color }} />
                <span className="text-[11px] text-muted-foreground">{a.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-2 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            Notificaciones
          </p>
          <button
            onClick={requestNotif}
            className="premium-card flex w-full items-center justify-between rounded-2xl p-4"
          >
            <span className="flex items-center gap-3 text-sm font-medium">
              <Bell className="h-4 w-4" />
              Recordatorios
            </span>
            <span className="text-xs text-muted-foreground">
              {data.settings.notifications ? "Activadas" : "Activar"}
            </span>
          </button>
        </div>
      </div>
    </Sheet>
  );
}
