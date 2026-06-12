import { Calendar, Circle, CheckSquare, Sun, Moon } from "lucide-react";
import { useEffect, useState } from "react";
import loopLogo from "@/assets/loop-logo.png";

export type LoopTab = "home" | "calendar" | "checks";

export function LoopLogo({ className = "" }: { className?: string }) {
  return (
    <img
      src={loopLogo}
      alt="loop"
      className={`h-16 w-auto select-none loop-logo-img ${className}`}
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
    <header className="flex items-center justify-between px-5 pt-5 pb-2">
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
    <nav className="sticky bottom-0 z-10 px-5 pb-5 pt-3">
      <div className="flex items-center justify-around rounded-2xl border border-white/[0.07] bg-card/70 px-3 py-2 backdrop-blur-2xl shadow-[0_20px_50px_-20px_rgba(0,0,0,0.9),0_0_0_1px_rgba(255,255,255,0.03)_inset]">
        {items.map(({ id, icon: Icon }) => {
          const active = tab === id;
          return (
            <button
              key={id}
              onClick={() => onChange(id)}
              className={`relative grid h-11 w-11 place-items-center rounded-xl transition ${
                active ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"
              }`}
              aria-label={id}
            >
              <Icon className="h-[18px] w-[18px]" strokeWidth={active ? 2.4 : 1.9} />
            </button>
          );
        })}
      </div>
    </nav>
  );
}
