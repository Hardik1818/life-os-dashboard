import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Bell, Database, Moon, ShieldCheck, Sun, User } from "lucide-react";

import { AppShell } from "@/components/life-os/AppShell";
import { Card, SectionHeader, PageHeader } from "@/components/life-os/ui";
import { useTheme } from "@/hooks/use-theme";

const title = "Settings — Life OS";
const description = "Profile, appearance, notifications and data preferences for Life OS.";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
  }),
  component: SettingsPage,
});

function Toggle({
  label,
  hint,
  on,
  onChange,
}: {
  label: string;
  hint: string;
  on: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={() => onChange(!on)}
      className="flex min-h-11 w-full items-center justify-between gap-4 rounded-xl px-2 py-2.5 text-left transition-colors hover:bg-muted"
    >
      <span className="min-w-0">
        <span className="block truncate text-sm font-medium">{label}</span>
        <span className="mt-0.5 block truncate text-xs text-subtle-foreground">{hint}</span>
      </span>
      <span
        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
          on ? "bg-primary" : "bg-muted"
        }`}
      >
        <span
          className={`absolute top-0.5 size-5 rounded-full bg-card shadow transition-transform ${
            on ? "translate-x-[22px]" : "translate-x-0.5"
          }`}
        />
      </span>
    </button>
  );
}

function SettingsPage() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [notify, setNotify] = useState({ deadlines: true, habits: true, social: false });
  const [privacy, setPrivacy] = useState({ analytics: false, shareStreaks: true });

  return (
    <AppShell>
      <PageHeader title="Settings" subtitle="Everything stays on your device for now." />

      <div className="grid min-w-0 gap-5 lg:grid-cols-2">
        <Card>
          <SectionHeader title="Profile" />
          <div className="flex items-center gap-4">
            <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-primary text-lg font-semibold text-primary-foreground">
              <User className="size-6" />
            </span>
            <div className="min-w-0">
              <p className="truncate text-[15px] font-medium">Hardik</p>
              <p className="truncate text-xs text-muted-foreground">
                Single-user workspace · local-first
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <SectionHeader title="Appearance" />
          <div className="grid grid-cols-2 gap-2">
            {(
              [
                { id: "light", label: "Light", icon: Sun },
                { id: "dark", label: "Dark", icon: Moon },
              ] as const
            ).map((t) => (
              <button
                key={t.id}
                type="button"
                aria-pressed={theme === t.id}
                onClick={() => setTheme(t.id)}
                className={`flex min-h-11 items-center justify-center gap-2 rounded-xl border text-sm font-medium transition-colors ${
                  theme === t.id
                    ? "border-primary bg-primary-soft text-accent-foreground"
                    : "border-border bg-card text-muted-foreground hover:bg-muted"
                }`}
              >
                <t.icon className="size-4" /> {t.label}
              </button>
            ))}
          </div>
          <p className="mt-3 text-xs text-subtle-foreground">
            Dark mode tokens are defined; the toggle will apply once theme switching is wired up.
          </p>
        </Card>

        <Card>
          <SectionHeader title="Notifications" aside={<Bell className="size-3.5" />} />
          <div className="flex flex-col">
            <Toggle
              label="Deadline reminders"
              hint="Nudge me 24 h before deadlines"
              on={notify.deadlines}
              onChange={(v) => setNotify((n) => ({ ...n, deadlines: v }))}
            />
            <Toggle
              label="Habit reminders"
              hint="Gentle evening prompt for unlogged habits"
              on={notify.habits}
              onChange={(v) => setNotify((n) => ({ ...n, habits: v }))}
            />
            <Toggle
              label="Social activity"
              hint="When someone in your circle shares a win"
              on={notify.social}
              onChange={(v) => setNotify((n) => ({ ...n, social: v }))}
            />
          </div>
        </Card>

        <Card>
          <SectionHeader title="Privacy & data" aside={<ShieldCheck className="size-3.5" />} />
          <div className="flex flex-col">
            <Toggle
              label="Anonymous usage analytics"
              hint="Off by default — your data is yours"
              on={privacy.analytics}
              onChange={(v) => setPrivacy((p) => ({ ...p, analytics: v }))}
            />
            <Toggle
              label="Share streaks with my circle"
              hint="Only people you explicitly invited"
              on={privacy.shareStreaks}
              onChange={(v) => setPrivacy((p) => ({ ...p, shareStreaks: v }))}
            />
          </div>
          <div className="mt-4 flex items-center gap-2.5 rounded-xl bg-muted/60 px-3.5 py-3 text-xs text-muted-foreground">
            <Database className="size-4 shrink-0" />
            Data is stored locally in this browser. Cloud sync arrives with the backend phase.
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
