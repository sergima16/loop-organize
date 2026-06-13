import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { TopBar, BottomNav, type LoopTab } from "@/components/loop/Shell";
import { HomeView } from "@/components/loop/HomeView";
import { CalendarView } from "@/components/loop/CalendarView";
import { ChecksView } from "@/components/loop/ChecksView";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "loop — organiza tus tareas y hábitos" },
      {
        name: "description",
        content:
          "loop es una app móvil para organizar tareas y hábitos diarios con seguimiento visual de tu progreso.",
      },
      { property: "og:title", content: "loop — organiza tus tareas y hábitos" },
      {
        property: "og:description",
        content:
          "Una app móvil minimalista para organizar tareas y hábitos diarios.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  const [tab, setTab] = useState<LoopTab>("home");

  return (
    <div className="loop-app-bg min-h-screen text-foreground">
      <div className="mx-auto flex min-h-screen max-w-md flex-col">
        <TopBar />
        <main className="flex-1 pb-24 pt-2">
          {tab === "home" && <HomeView />}
          {tab === "calendar" && <CalendarView />}
          {tab === "checks" && <ChecksView />}
        </main>
        <BottomNav tab={tab} onChange={setTab} />
      </div>
    </div>
  );
}
