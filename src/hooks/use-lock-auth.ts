import { useCallback, useEffect, useState } from "react";

const STORAGE_PASSCODE_HASH = "life_os_passcode_hash_v1";
const STORAGE_SESSION_UNLOCKED = "life_os_session_unlocked_v1";
const AUTH_EVENT = "life_os_auth_state_change";

// Simple SHA-256 hash using Web Crypto API
async function sha256(message: string): Promise<string> {
  if (typeof window === "undefined" || !window.crypto || !window.crypto.subtle) {
    return btoa(message);
  }
  const msgUint8 = new TextEncoder().encode(message + "_life_os_salt_2026");
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

export function useLockAuth() {
  const [isUnlocked, setIsUnlocked] = useState<boolean>(() => {
    if (typeof window === "undefined") return true;
    return sessionStorage.getItem(STORAGE_SESSION_UNLOCKED) === "true" ||
      localStorage.getItem(STORAGE_SESSION_UNLOCKED) === "true";
  });

  const [hasPasscode, setHasPasscode] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return !!localStorage.getItem(STORAGE_PASSCODE_HASH);
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handleAuthChange = () => {
      const unlocked =
        sessionStorage.getItem(STORAGE_SESSION_UNLOCKED) === "true" ||
        localStorage.getItem(STORAGE_SESSION_UNLOCKED) === "true";
      setIsUnlocked(unlocked);
      setHasPasscode(!!localStorage.getItem(STORAGE_PASSCODE_HASH));
    };

    window.addEventListener(AUTH_EVENT, handleAuthChange);
    return () => window.removeEventListener(AUTH_EVENT, handleAuthChange);
  }, []);

  // Unlock with passcode
  const unlock = useCallback(async (passcode: string, remember30Days = false): Promise<boolean> => {
    setLoading(true);
    try {
      const enteredHash = await sha256(passcode.trim());
      const storedHash = localStorage.getItem(STORAGE_PASSCODE_HASH);

      // Default master passcode if not set is "lifeos" or "1234"
      let isValid = false;
      if (!storedHash) {
        const defaultHash1 = await sha256("lifeos");
        const defaultHash2 = await sha256("1234");
        isValid = enteredHash === defaultHash1 || enteredHash === defaultHash2;
      } else {
        isValid = enteredHash === storedHash;
      }

      if (isValid) {
        sessionStorage.setItem(STORAGE_SESSION_UNLOCKED, "true");
        if (remember30Days) {
          localStorage.setItem(STORAGE_SESSION_UNLOCKED, "true");
        }
        setIsUnlocked(true);
        window.dispatchEvent(new Event(AUTH_EVENT));
        setLoading(false);
        return true;
      }

      setLoading(false);
      return false;
    } catch {
      setLoading(false);
      return false;
    }
  }, []);

  // Set new Master Passcode
  const changePasscode = useCallback(async (newPasscode: string): Promise<void> => {
    const hash = await sha256(newPasscode.trim());
    localStorage.setItem(STORAGE_PASSCODE_HASH, hash);
    sessionStorage.setItem(STORAGE_SESSION_UNLOCKED, "true");
    setIsUnlocked(true);
    setHasPasscode(true);
    window.dispatchEvent(new Event(AUTH_EVENT));
  }, []);

  // Lock the app
  const lock = useCallback(() => {
    sessionStorage.removeItem(STORAGE_SESSION_UNLOCKED);
    localStorage.removeItem(STORAGE_SESSION_UNLOCKED);
    setIsUnlocked(false);
    window.dispatchEvent(new Event(AUTH_EVENT));
  }, []);

  return {
    isUnlocked,
    hasPasscode,
    loading,
    unlock,
    changePasscode,
    lock,
  };
}
