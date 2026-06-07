import { Calendar, Circle, CheckSquare, Sun, Moon } from "lucide-react";
import { useEffect, useState } from "react";
import loopLogo from "@/assets/loop-logo.png.asset.json";

export type LoopTab = "home" | "calendar" | "checks";

export function LoopLogo({ className = "" }: { className?: string }) {
  return (
    <img
      src={loopLogo.url}
      alt="loop"
      className={`h-9 w-auto select-none ${className}`}
      draggable={false}
    />
  );
}

export function TopBar() {
  const [light, setLight] = useState(false);
  useEffect(() => {
    document.documentElement.classList.toggle("light", light);
  }, [light]);

  return (
    <header className="flex items-center justify-between px-5 pt-5 pb-3">
      <LoopLogo />
      <button
        onClick={() => setLight((v) => !v)}
        className="grid h-10 w-10 place-items-center rounded-full bg-foreground text-background transition hover:scale-105"
        aria-label="Toggle theme"
      >
        {light ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
      </button>
    </header>
  );
}


interface BottomNavProps {
  tab: LoopTab;
  onChange: (t: LoopTab) => void;
}

export function BottomNav({ tab, onChange }: BottomNavProps) {
  const items: { id: LoopTab; icon: typeof Calendar }[] = [
    { id: "calendar", icon: Calendar },
    { id: "home", icon: Circle },
    { id: "checks", icon: CheckSquare },
  ];
  return (
    <nav className="sticky bottom-0 z-10 flex items-center justify-around bg-gradient-to-t from-background via-background to-transparent px-6 pb-6 pt-4">
      {items.map(({ id, icon: Icon }) => {
        const active = tab === id;
        return (
          <button
            key={id}
            onClick={() => onChange(id)}
            className="relative flex flex-col items-center gap-1.5 px-4 py-1 transition"
            aria-label={id}
          >
            <Icon
              className={`h-5 w-5 transition ${active ? "text-foreground" : "text-muted-foreground"}`}
              strokeWidth={active ? 2.4 : 1.8}
            />
            {active && <span className="h-1 w-1 rounded-full bg-foreground" />}
          </button>
        );
      })}
    </nav>
  );
}
