interface ProgressRingProps {
  value: number; // 0-100
  size?: number;
  stroke?: number;
  color?: string;
  label?: string;
  sublabel?: string;
}

export function ProgressRing({
  value,
  size = 124,
  stroke = 10,
  color,
  label,
  sublabel = "hoy",
}: ProgressRingProps) {
  const v = Math.max(0, Math.min(100, value));
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (v / 100) * c;
  const ringColor = color ?? (v >= 60 ? "var(--success)" : v > 0 ? "var(--danger)" : "var(--muted-foreground)");
  const text = label ?? `${Math.round(v)}`;

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke="var(--accent)"
          strokeWidth={stroke}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={ringColor}
          strokeWidth={stroke}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={c}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 700ms cubic-bezier(.2,.8,.2,1)" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="font-display text-[28px] font-bold leading-none tracking-[-0.03em]" style={{ color: ringColor }}>
          {text}<span className="text-lg font-semibold opacity-80">%</span>
        </span>
        <span className="mt-1 text-[11px] font-medium text-muted-foreground">{sublabel}</span>
      </div>
    </div>
  );
}
