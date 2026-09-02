import { useCallback, useEffect, useState } from "react";

export type Theme = "light" | "dark";

export const THEME_STORAGE_KEY = "life-os-theme";
const THEME_EVENT = "life-os-theme-change";

export function getInitialTheme(): Theme {
  if (typeof window === "undefined") return "light";
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY) as Theme | null;
    if (stored === "dark" || stored === "light") return stored;
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  } catch {
    return "light";
  }
}

export function applyTheme(theme: Theme) {
  if (typeof document === "undefined") return;
  if (theme === "dark") {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }
}

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(getInitialTheme);

  useEffect(() => {
    // Ensure the document has the correct class on mount
    const current = getInitialTheme();
    setThemeState(current);
    applyTheme(current);

    const handleCustomChange = (e: CustomEvent<Theme>) => {
      setThemeState(e.detail);
      applyTheme(e.detail);
    };

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === THEME_STORAGE_KEY && (e.newValue === "light" || e.newValue === "dark")) {
        setThemeState(e.newValue);
        applyTheme(e.newValue);
      }
    };

    window.addEventListener(THEME_EVENT as unknown as string, handleCustomChange as EventListener);
    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener(THEME_EVENT as unknown as string, handleCustomChange as EventListener);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  const setTheme = useCallback((next: Theme) => {
    setThemeState(next);
    applyTheme(next);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next);
      window.dispatchEvent(new CustomEvent(THEME_EVENT, { detail: next }));
    } catch (e) {
      console.error("Failed to persist theme:", e);
    }
  }, []);

  return { theme, setTheme };
}
