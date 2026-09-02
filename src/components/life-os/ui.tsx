import type { ReactNode } from "react";

export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`min-w-0 rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)] ${className}`}
    >
      {children}
    </section>
  );
}

export function SectionHeader({ title, aside }: { title: string; aside?: ReactNode }) {
  return (
    <header className="mb-4 flex items-center justify-between gap-3">
      <h2 className="min-w-0 truncate text-[17px] font-semibold tracking-tight">{title}</h2>
      {aside ? (
        <div className="hidden shrink-0 text-xs text-subtle-foreground sm:block">{aside}</div>
      ) : null}
    </header>
  );
}

export function PageHeader({
  title,
  subtitle,
  aside,
}: {
  title: string;
  subtitle?: string;
  aside?: ReactNode;
}) {
  return (
    <header className="mb-7 flex flex-wrap items-end justify-between gap-5">
      <div>
        <h1 className="text-[28px] font-semibold tracking-tight">{title}</h1>
        {subtitle ? (
          <p className="mt-1.5 max-w-md text-sm text-muted-foreground">{subtitle}</p>
        ) : null}
      </div>
      {aside}
    </header>
  );
}
