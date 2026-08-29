export function ProgressRing({
  value,
  size = 92,
  stroke = 9,
  label,
}: {
  value: number;
  size?: number;
  stroke?: number;
  label?: string;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;

  return (
    <div className="relative grid place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={stroke}
          className="stroke-muted"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c - (c * Math.min(Math.max(value, 0), 100)) / 100}
          className="stroke-primary transition-[stroke-dashoffset] duration-500 ease-out"
        />
      </svg>
      <div className="absolute text-center">
        <div className="tabular text-xl font-semibold leading-none">{Math.round(value)}%</div>
        {label ? (
          <div className="mt-1 text-[11px] text-subtle-foreground">{label}</div>
        ) : null}
      </div>
    </div>
  );
}
