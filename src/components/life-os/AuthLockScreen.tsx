import { useState } from "react";
import { Eye, EyeOff, KeyRound, Lock, ShieldCheck, Sparkles } from "lucide-react";
import { useLockAuth } from "@/hooks/use-lock-auth";

export function AuthLockScreen() {
  const { unlock, hasPasscode, loading } = useLockAuth();

  const [passcode, setPasscode] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isShaking, setIsShaking] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passcode.trim()) {
      setError("Please enter your master passcode.");
      return;
    }

    const success = await unlock(passcode, rememberMe);
    if (!success) {
      setError("Incorrect passcode. Try again.");
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 600);
    } else {
      setError(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background px-4">
      {/* Background glow effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute left-1/2 top-1/3 -translate-x-1/2 -translate-y-1/2 size-[450px] rounded-full bg-primary/10 blur-[100px]" />
      </div>

      <div
        className={`relative w-full max-w-md rounded-3xl border border-border bg-card p-8 shadow-2xl transition-all ${
          isShaking ? "animate-bounce" : ""
        }`}
      >
        <div className="flex flex-col items-center text-center">
          {/* Glowing LO Icon Badge */}
          <div className="relative mb-4">
            <span className="grid size-16 place-items-center rounded-2xl bg-primary text-2xl font-bold text-primary-foreground shadow-lg shadow-primary/25">
              LO
            </span>
            <span className="absolute -bottom-1 -right-1 grid size-6 place-items-center rounded-full bg-card border border-border text-primary shadow-sm">
              <Lock className="size-3.5" />
            </span>
          </div>

          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Life OS
          </h1>
          <p className="mt-1.5 text-xs text-muted-foreground">
            Private Dashboard & Personal Operating System
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-foreground flex items-center justify-between">
              <span>Master Passcode</span>
              {!hasPasscode ? (
                <span className="text-[11px] text-primary flex items-center gap-1 font-normal">
                  <Sparkles className="size-3" /> Default: <code className="font-mono bg-muted px-1 rounded">lifeos</code>
                </span>
              ) : null}
            </label>
            <div className="relative">
              <KeyRound className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-subtle-foreground" />
              <input
                type={showPassword ? "text" : "password"}
                value={passcode}
                onChange={(e) => {
                  setPasscode(e.target.value);
                  if (error) setError(null);
                }}
                placeholder={hasPasscode ? "Enter your passcode…" : "Enter lifeos or 1234…"}
                autoFocus
                className="min-h-11 w-full rounded-xl border border-border bg-background pl-10 pr-10 text-sm font-medium outline-none focus:border-primary transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-subtle-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </div>

          {error ? (
            <p className="text-xs font-medium text-destructive text-center animate-in fade-in">
              {error}
            </p>
          ) : null}

          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="size-4 rounded border-border text-primary focus:ring-primary accent-primary"
              />
              <span>Remember this browser</span>
            </label>
            <span className="text-[11px] text-subtle-foreground">Encrypted SHA-256</span>
          </div>

          <button
            type="submit"
            disabled={loading || !passcode.trim()}
            className="mt-2 flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary text-sm font-semibold text-primary-foreground shadow-sm transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            <ShieldCheck className="size-4" />
            <span>{loading ? "Verifying…" : "Unlock Life OS"}</span>
          </button>
        </form>

        <div className="mt-6 border-t border-border pt-4 text-center">
          <p className="text-[11px] text-subtle-foreground">
            Single-user zero-knowledge security. Data stays local and private.
          </p>
        </div>
      </div>
    </div>
  );
}
