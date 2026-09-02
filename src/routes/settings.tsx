import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import {
  Bell,
  Check,
  Copy,
  Database,
  Download,
  FileSpreadsheet,
  KeyRound,
  Lock,
  Moon,
  RefreshCw,
  RotateCcw,
  ShieldCheck,
  Sun,
  Upload,
  User,
} from "lucide-react";

import { AppShell } from "@/components/life-os/AppShell";
import { Card, SectionHeader, PageHeader } from "@/components/life-os/ui";
import { useTheme } from "@/hooks/use-theme";
import { useLockAuth } from "@/hooks/use-lock-auth";
import { useUserProfile } from "@/hooks/use-user-profile";
import {
  getAppsScriptUrl,
  setAppsScriptUrl,
} from "@/integrations/appscript/client";
import { useSyncAppsScript } from "@/lib/life-os-queries";
import { useQueryClient } from "@tanstack/react-query";

const title = "Settings — Life OS";
const description = "Google Apps Script sync, security passcode, profile name, JSON backup/restore, appearance, and privacy.";

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

const STORAGE_KEYS = [
  "life_os_tasks_v1",
  "life_os_habits_v1",
  "life_os_habit_logs_v1",
  "life_os_journal_v1",
  "life_os_calendar_v1",
  "life_os_health_v1",
  "life_os_saved_articles_v1",
];

function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { changePasscode, lock } = useLockAuth();
  const { userName, updateUserName } = useUserProfile();
  const syncMutation = useSyncAppsScript();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [scriptUrl, setScriptUrlInput] = useState(getAppsScriptUrl());
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [backupStatus, setBackupStatus] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  // Profile Name state
  const [nameInput, setNameInput] = useState(userName);
  const [nameStatus, setNameStatus] = useState<string | null>(null);

  // Security passcode state
  const [newPasscode, setNewPasscode] = useState("");
  const [passcodeStatus, setPasscodeStatus] = useState<string | null>(null);

  const [notify, setNotify] = useState({ deadlines: true, habits: true, social: false });
  const [privacy, setPrivacy] = useState({ analytics: false, shareStreaks: true });

  const isConnected = !!scriptUrl.trim();

  const handleSaveName = (e: React.FormEvent) => {
    e.preventDefault();
    updateUserName(nameInput);
    setNameStatus("Name updated!");
    setTimeout(() => setNameStatus(null), 2500);
  };

  const handleSaveUrl = (e: React.FormEvent) => {
    e.preventDefault();
    setAppsScriptUrl(scriptUrl);
    setSaveStatus("Google Apps Script URL saved!");
    setTimeout(() => setSaveStatus(null), 3000);
  };

  const handleManualSync = async () => {
    try {
      await syncMutation.mutateAsync();
      setSaveStatus("Synced with Google Sheets & Calendar!");
      setTimeout(() => setSaveStatus(null), 4000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Sync error";
      setSaveStatus(`Sync error: ${msg}`);
    }
  };

  const handleCopyInstructions = () => {
    const text = `// See apps_script_backend.js in the project repository for full Code.gs script!`;
    navigator.clipboard.writeText(text);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  // Change master passcode
  const handleChangePasscode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPasscode.trim()) return;
    await changePasscode(newPasscode.trim());
    setPasscodeStatus("Master passcode updated successfully!");
    setNewPasscode("");
    setTimeout(() => setPasscodeStatus(null), 3500);
  };

  // Export JSON Database
  const handleExportJson = () => {
    const backup: Record<string, unknown> = {
      exported_at: new Date().toISOString(),
      app: "Life OS",
      version: "1.0",
    };

    for (const key of STORAGE_KEYS) {
      try {
        const val = localStorage.getItem(key);
        if (val) backup[key] = JSON.parse(val);
      } catch (e) {
        console.error(`Failed exporting ${key}:`, e);
      }
    }

    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `life_os_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setBackupStatus("Backup downloaded successfully!");
    setTimeout(() => setBackupStatus(null), 3500);
  };

  // Import JSON Database
  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content) as Record<string, unknown>;

        for (const key of STORAGE_KEYS) {
          if (parsed[key]) {
            localStorage.setItem(key, JSON.stringify(parsed[key]));
          }
        }

        queryClient.invalidateQueries();
        setBackupStatus("Data imported and restored successfully!");
        setTimeout(() => setBackupStatus(null), 4000);
      } catch {
        setBackupStatus("Failed to parse JSON backup file.");
      }
    };
    reader.readAsText(file);
  };

  // Reset to default
  const handleResetData = () => {
    if (window.confirm("Are you sure you want to reset all data to default seed data?")) {
      for (const key of STORAGE_KEYS) {
        localStorage.removeItem(key);
      }
      queryClient.invalidateQueries();
      setBackupStatus("Reset to default sample data.");
      setTimeout(() => setBackupStatus(null), 3000);
    }
  };

  const userInitials = userName.slice(0, 2).toUpperCase() || "U";

  return (
    <AppShell>
      <PageHeader
        title="Settings"
        subtitle="Manage your profile name, Google Apps Script backend, security passcode, and database backups."
      />

      <div className="grid min-w-0 gap-5 lg:grid-cols-2">
        {/* Profile Card */}
        <Card>
          <SectionHeader title="Profile & Display Name" />
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-primary text-base font-bold text-primary-foreground shadow-sm">
                {userInitials}
              </span>
              <div className="min-w-0">
                <p className="truncate text-[15px] font-semibold">{userName}</p>
                <p className="truncate text-xs text-muted-foreground">
                  Personal Life OS · Master Security Protected
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveName} className="flex flex-col gap-2">
              <label className="text-xs font-medium text-foreground">Change Display Name</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  placeholder="Enter your name (default: User)…"
                  className="min-h-10 w-full rounded-xl border border-border bg-background px-3 text-xs outline-none focus:border-primary"
                />
                <button
                  type="submit"
                  disabled={!nameInput.trim() || nameInput.trim() === userName}
                  className="min-h-10 shrink-0 rounded-xl bg-primary px-4 text-xs font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
                >
                  Save
                </button>
              </div>
              {nameStatus ? (
                <p className="text-xs font-medium text-clear">{nameStatus}</p>
              ) : (
                <p className="text-[11px] text-subtle-foreground">
                  Shown on your dashboard greeting and daily command center.
                </p>
              )}
            </form>
          </div>
        </Card>

        {/* Appearance Card */}
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
            Applies instantly and is remembered on this device across refreshes.
          </p>
        </Card>

        {/* Security & Access Lock Card */}
        <Card className="lg:col-span-2">
          <SectionHeader
            title="Security & Access Control"
            aside="SHA-256 Protected · Single User"
          />
          <div className="grid min-w-0 gap-5 lg:grid-cols-2">
            <form onSubmit={handleChangePasscode} className="flex flex-col gap-3">
              <label className="text-xs font-medium text-foreground">
                Set or Change Master Passcode
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <KeyRound className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-subtle-foreground" />
                  <input
                    type="password"
                    value={newPasscode}
                    onChange={(e) => setNewPasscode(e.target.value)}
                    placeholder="Enter new master passcode…"
                    className="min-h-10 w-full rounded-xl border border-border bg-background pl-8 pr-3 text-xs outline-none focus:border-primary"
                  />
                </div>
                <button
                  type="submit"
                  disabled={!newPasscode.trim()}
                  className="min-h-10 rounded-xl bg-primary px-4 text-xs font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
                >
                  Save Passcode
                </button>
              </div>
              {passcodeStatus ? (
                <p className="text-xs font-medium text-clear">{passcodeStatus}</p>
              ) : (
                <p className="text-[11px] text-subtle-foreground">
                  Default passcode is <code className="bg-muted px-1 rounded font-mono">lifeos</code> or <code className="bg-muted px-1 rounded font-mono">1234</code> until changed.
                </p>
              )}
            </form>

            <div className="flex flex-col justify-between rounded-xl border border-border bg-card p-4 text-xs text-muted-foreground">
              <div>
                <p className="font-semibold text-foreground">Lock Dashboard</p>
                <p className="mt-1 leading-relaxed">
                  Lock Life OS immediately so unauthorized users cannot access your schedule, habits, journal, or private health data.
                </p>
              </div>
              <div className="mt-3 flex justify-end">
                <button
                  type="button"
                  onClick={lock}
                  className="flex items-center gap-1.5 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-2 text-xs font-semibold text-destructive transition-colors hover:bg-destructive/20"
                >
                  <Lock className="size-3.5" />
                  <span>Lock Dashboard Now</span>
                </button>
              </div>
            </div>
          </div>
        </Card>

        {/* Google Apps Script Backend Card */}
        <Card className="lg:col-span-2">
          <SectionHeader
            title="Google Apps Script & Sheets Backend"
            aside={isConnected ? "Google Cloud Connected" : "Local Storage Mode"}
          />
          <div className="grid min-w-0 gap-5 lg:grid-cols-2">
            <div className="flex flex-col gap-3.5">
              <div className="flex items-center gap-3 rounded-xl bg-muted/60 p-3.5">
                <FileSpreadsheet className="size-6 shrink-0 text-primary" />
                <div className="text-xs text-muted-foreground">
                  <p className="font-medium text-foreground">
                    {isConnected ? "Google Sheets Sync Active" : "Local Storage Mode"}
                  </p>
                  <p className="mt-0.5 leading-relaxed">
                    {isConnected
                      ? "Your tasks, habits, journals, health logs, and Google Calendar sync with your Google Sheet."
                      : "Data is currently stored safely on this device. Connect Google Apps Script to sync to Google Sheets."}
                  </p>
                </div>
              </div>

              <form onSubmit={handleSaveUrl} className="flex flex-col gap-2.5">
                <label className="text-xs font-medium text-foreground">Google Apps Script Web App URL</label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={scriptUrl}
                    onChange={(e) => setScriptUrlInput(e.target.value)}
                    placeholder="https://script.google.com/macros/s/.../exec"
                    className="min-h-10 min-w-0 flex-1 rounded-xl border border-border bg-background px-3 text-xs outline-none focus:border-primary"
                  />
                  <button
                    type="submit"
                    className="min-h-10 rounded-xl bg-primary px-4 text-xs font-medium text-primary-foreground transition-opacity hover:opacity-90"
                  >
                    Save URL
                  </button>
                </div>

                {saveStatus ? (
                  <p className="text-xs font-medium text-clear">{saveStatus}</p>
                ) : null}

                {isConnected ? (
                  <div className="mt-1 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleManualSync}
                      disabled={syncMutation.isPending}
                      className="flex min-h-9 items-center gap-1.5 rounded-xl border border-border bg-card px-3.5 text-xs font-medium text-foreground transition-colors hover:bg-muted disabled:opacity-50"
                    >
                      <RefreshCw className={`size-3.5 ${syncMutation.isPending ? "animate-spin" : ""}`} />
                      {syncMutation.isPending ? "Syncing…" : "Sync with Google Sheets Now"}
                    </button>
                  </div>
                ) : null}
              </form>
            </div>

            <div className="flex flex-col justify-between rounded-xl border border-border bg-card p-4 text-xs text-muted-foreground">
              <div>
                <p className="font-semibold text-foreground">How to setup Google Apps Script (5 min):</p>
                <ol className="mt-2 flex flex-col gap-1.5 list-decimal pl-4">
                  <li>Go to <span className="text-primary font-medium">script.google.com</span> and create a new project.</li>
                  <li>Copy all code from <code className="rounded bg-muted px-1.5 py-0.5 text-[11px] font-mono text-foreground">apps_script_backend.js</code> in this repo and paste into <code className="rounded bg-muted px-1.5 py-0.5 text-[11px] font-mono text-foreground">Code.gs</code>.</li>
                  <li>Click <strong>Deploy &gt; New deployment &gt; Web app</strong>.</li>
                  <li>Set <em>Execute as: Me</em> and <em>Who has access: Anyone</em>.</li>
                  <li>Paste your Web App URL on the left!</li>
                </ol>
              </div>
              <div className="mt-3 flex justify-end">
                <button
                  type="button"
                  onClick={handleCopyInstructions}
                  className="flex items-center gap-1 rounded-lg bg-muted px-3 py-1.5 text-[11px] font-medium text-foreground transition-colors hover:bg-muted/80"
                >
                  {copiedCode ? <Check className="size-3 text-clear" /> : <Copy className="size-3" />}
                  {copiedCode ? "Copied!" : "File: apps_script_backend.js"}
                </button>
              </div>
            </div>
          </div>
        </Card>

        {/* Data Backup & Portability Card */}
        <Card className="lg:col-span-2">
          <SectionHeader
            title="Data Backup & Portability"
            aside="Zero vendor lock-in · Full JSON snapshot"
          />
          <div className="grid min-w-0 gap-4 sm:grid-cols-3">
            <button
              type="button"
              onClick={handleExportJson}
              className="flex min-h-12 items-center justify-center gap-2 rounded-xl border border-border bg-card p-3 text-xs font-semibold text-foreground transition-colors hover:bg-muted"
            >
              <Download className="size-4 text-primary" />
              <span>Export Database (JSON)</span>
            </button>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex min-h-12 items-center justify-center gap-2 rounded-xl border border-border bg-card p-3 text-xs font-semibold text-foreground transition-colors hover:bg-muted"
            >
              <Upload className="size-4 text-primary" />
              <span>Import Database (JSON)</span>
            </button>

            <button
              type="button"
              onClick={handleResetData}
              className="flex min-h-12 items-center justify-center gap-2 rounded-xl border border-border bg-card p-3 text-xs font-semibold text-destructive transition-colors hover:bg-destructive/10"
            >
              <RotateCcw className="size-4" />
              <span>Reset to Sample Data</span>
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleImportJson}
              className="hidden"
            />
          </div>

          {backupStatus ? (
            <p className="mt-3 text-xs font-medium text-clear">{backupStatus}</p>
          ) : null}
        </Card>

        {/* Notifications Card */}
        <Card>
          <SectionHeader title="Notifications & Digests" aside={<Bell className="size-3.5" />} />
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
              label="Morning Gmail digest"
              hint="Google Apps Script sends daily 08:00 digest email"
              on={notify.social}
              onChange={(v) => setNotify((n) => ({ ...n, social: v }))}
            />
          </div>
        </Card>

        {/* Privacy & Data Card */}
        <Card>
          <SectionHeader title="Privacy & Data" aside={<ShieldCheck className="size-3.5" />} />
          <div className="flex flex-col">
            <Toggle
              label="Anonymous usage analytics"
              hint="Off by default — your data is yours"
              on={privacy.analytics}
              onChange={(v) => setPrivacy((p) => ({ ...p, analytics: v }))}
            />
            <Toggle
              label="Show streaks on Today"
              hint="Display habit streak counts on the dashboard"
              on={privacy.shareStreaks}
              onChange={(v) => setPrivacy((p) => ({ ...p, shareStreaks: v }))}
            />
          </div>
          <div className="mt-4 flex items-center gap-2.5 rounded-xl bg-muted/60 px-3.5 py-3 text-xs text-muted-foreground">
            <Database className="size-4 shrink-0" />
            Zero external tracking. Stored securely in your private Google Sheet.
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
