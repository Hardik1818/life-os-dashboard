/**
 * Google Apps Script Client for Life OS
 * Communicates with the Google Apps Script Web App backend.
 */

const APPSCRIPT_STORAGE_KEY = "life_os_appscript_url";

export function getAppsScriptUrl(): string {
  if (typeof window === "undefined") return "";
  const stored = localStorage.getItem(APPSCRIPT_STORAGE_KEY);
  if (stored) return stored;
  return import.meta.env["VITE_APPSCRIPT_URL"] || "";
}

export function setAppsScriptUrl(url: string): void {
  if (typeof window === "undefined") return;
  if (!url) {
    localStorage.removeItem(APPSCRIPT_STORAGE_KEY);
  } else {
    localStorage.setItem(APPSCRIPT_STORAGE_KEY, url.trim());
  }
}

export type AppsScriptResponse<T = unknown> = {
  success: boolean;
  data?: T | undefined;
  error?: string | undefined;
  events?: T | undefined;
};

export async function callAppsScript<T = unknown>(
  action: string,
  payload: Record<string, unknown> = {},
): Promise<AppsScriptResponse<T>> {
  const url = getAppsScriptUrl();
  if (!url) {
    return { success: false, error: "Google Apps Script URL is not configured." };
  }

  try {
    const response = await fetch(url, {
      method: "POST",
      // Using text/plain prevents CORS preflight OPTIONS failures on Google Apps Script
      headers: {
        "Content-Type": "text/plain;charset=utf-8",
      },
      body: JSON.stringify({
        action,
        ...payload,
      }),
      redirect: "follow",
    });

    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}: ${response.statusText}`);
    }

    const json = (await response.json()) as AppsScriptResponse<T>;
    return json;
  } catch (err: unknown) {
    console.error(`[AppsScript Error on ${action}]:`, err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to communicate with Apps Script",
    };
  }
}

export async function fetchAllFromAppsScript(): Promise<AppsScriptResponse<Record<string, unknown>>> {
  const url = getAppsScriptUrl();
  if (!url) {
    return { success: false, error: "Google Apps Script URL is not configured." };
  }

  try {
    const response = await fetch(`${url}?action=syncAll`, {
      method: "GET",
      redirect: "follow",
    });

    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }

    const json = (await response.json()) as AppsScriptResponse<Record<string, unknown>>;
    return json;
  } catch (err: unknown) {
    console.error("[AppsScript FetchAll Error]:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to fetch from Apps Script",
    };
  }
}
