# Loop 2.0 — Plan de implementación

Mantengo la identidad visual actual (fondo degradado, `premium-card`, tipografía Inter, iconos Lucide, nav inferior con 3 pestañas) y añado las funciones nuevas sin romper la filosofía "menos es más". Todo sigue en `localStorage` vía `loop-store` para no cambiar la arquitectura.

## Navegación

Mantengo las 3 pestañas actuales (`calendar`, `home`, `checks`). Las nuevas secciones se integran así, sin añadir tabs:

- **Objetivos y Proyectos**: accesibles desde Home como dos tarjetas horizontales scrollables ("Objetivos" / "Proyectos") justo debajo del hero. Al pulsar una tarjeta se abre una vista completa (sheet a pantalla completa) para gestionarlas.
- **Estadísticas**: botón sutil (icono chart) en el `TopBar` junto al toggle de tema → abre sheet de estadísticas.
- **Personalización**: botón de ajustes (icono sliders) también en `TopBar` → sheet con tema + colores de acento.
- **Recordatorios**: se configuran inline en el modal de crear/editar tarea o hábito (campo hora opcional).
- **Calendario**: se amplía la vista actual añadiendo toggle Semana/Mes y drag-and-drop de tareas entre días.

## Cambios en el store (`src/lib/loop-store.ts`)

Añadir a `LoopData` (con migración por defecto para usuarios v1):

- `goals: Goal[]` — `{ id, title, description, deadline, horizon: "corto"|"medio"|"largo", taskIds, habitIds }`
- `projects: Project[]` — `{ id, name, color, taskIds }`
- `settings: { accent: string, reminderPermission: boolean }`
- Añadir campos opcionales a `Task`: `projectId?`, `goalId?`, `reminder?` (HH:MM)
- Añadir a `Habit`: `goalId?`, `reminder?`

Progreso auto: se calcula (no se persiste) como `done/total` de tareas + hábitos vinculados en la semana actual.

## Nuevos componentes

```
src/components/loop/
  GoalsSheet.tsx        — lista, crear, editar objetivos con barra de progreso
  ProjectsSheet.tsx     — lista, crear proyectos con color
  StatsSheet.tsx        — semanal/mensual, rachas, día más productivo
  SettingsSheet.tsx     — tema, acento, notificaciones
  Sheet.tsx             — wrapper reutilizable (bottom sheet full-height)
  WeekCalendar.tsx      — vista semanal (7 columnas)
  HomeGoalsStrip.tsx    — carrusel horizontal en Home
```

Todos usan `premium-card`, mismos radios, mismos tokens de color.

## Cambios en pantallas existentes

- **HomeView**: añadir sección "Objetivos" y "Proyectos" (carruseles horizontales, sólo si existen; si no, un CTA discreto tipo "Añade tu primer objetivo"). No toco el hero ni las 2 tarjetas de stats.
- **CalendarView**: toggle Semana/Mes arriba del calendario; en modo semana, columnas con tareas draggables (HTML5 drag para mover `task.date`).
- **ChecksView**: al crear tarea/hábito, campos opcionales `Proyecto`, `Objetivo`, `Recordatorio`.
- **Shell/TopBar**: añadir 2 iconos pequeños (stats, settings) a la izquierda del toggle tema.

## Recordatorios

Notificaciones locales del navegador (`Notification API`) programadas al cargar la app para tareas/hábitos con `reminder` hoy. Sin backend, sin push.

## Personalización

Acento como variable CSS `--accent-user` con 5-6 presets (blanco/plata actual + verde, azul, ámbar, rosa, morado). Se aplica a la rueda de progreso y a los estados activos del nav. Modo claro/oscuro ya existe: se mueve el toggle al `SettingsSheet` pero se mantiene también el botón rápido.

## Estadísticas

Cálculo en cliente sobre `tasks` y `habits.log`:
- Rachas por hábito (días consecutivos con `log[k]===true`)
- % semanal/mensual completado
- Día de la semana con más completados (histograma simple)
- Total días activos ("tiempo de constancia")

Visualización: barras minimalistas en SVG puro con los mismos tokens.

## Orden de entrega (1 respuesta, cambios en paralelo)

1. Extender `loop-store.ts` (tipos + defaults + migración).
2. Crear `Sheet.tsx`.
3. Crear `GoalsSheet`, `ProjectsSheet`, `StatsSheet`, `SettingsSheet`.
4. Crear `WeekCalendar.tsx` + drag-drop en `CalendarView`.
5. Actualizar `HomeView` (strips), `ChecksView` (campos opcionales), `Shell` (iconos topbar).
6. Añadir presets de acento en `styles.css`.

## Fuera de alcance

- Sync en la nube / cuentas de usuario.
- Portadas de proyecto con imagen (sólo color, para no cargar la UI).
- Notificaciones push reales (sólo Notification API del navegador).

¿Procedo con la implementación tal cual, o quieres ajustar algo (por ejemplo: dejar Objetivos/Proyectos fuera de Home y meterlos sólo en un menú de ajustes)?
