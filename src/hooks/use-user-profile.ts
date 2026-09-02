import { useCallback, useEffect, useState } from "react";

const STORAGE_NAME_KEY = "life_os_user_name_v1";
const PROFILE_EVENT = "life_os_profile_change";
const DEFAULT_NAME = "User";

export function getUserName(): string {
  if (typeof window === "undefined") return DEFAULT_NAME;
  try {
    const saved = localStorage.getItem(STORAGE_NAME_KEY);
    return saved && saved.trim() ? saved.trim() : DEFAULT_NAME;
  } catch {
    return DEFAULT_NAME;
  }
}

export function useUserProfile() {
  const [userName, setUserNameState] = useState<string>(getUserName);

  useEffect(() => {
    const handleProfileChange = (e: CustomEvent<string>) => {
      setUserNameState(e.detail || DEFAULT_NAME);
    };

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_NAME_KEY) {
        setUserNameState(e.newValue || DEFAULT_NAME);
      }
    };

    window.addEventListener(PROFILE_EVENT as unknown as string, handleProfileChange as EventListener);
    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener(PROFILE_EVENT as unknown as string, handleProfileChange as EventListener);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  const updateUserName = useCallback((newName: string) => {
    const trimmed = newName.trim() || DEFAULT_NAME;
    setUserNameState(trimmed);
    try {
      localStorage.setItem(STORAGE_NAME_KEY, trimmed);
      window.dispatchEvent(new CustomEvent(PROFILE_EVENT, { detail: trimmed }));
    } catch (e) {
      console.error("Failed to save user name:", e);
    }
  }, []);

  return {
    userName,
    updateUserName,
    defaultName: DEFAULT_NAME,
  };
}
