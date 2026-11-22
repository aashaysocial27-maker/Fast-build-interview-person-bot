// Local persistence. Everything is stored in this browser only, namespaced per user.
import { useCallback, useEffect, useState } from "react";

const PREFIX = "preppilot";

export function readJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export function writeJSON(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage full or blocked — app still works for this session */
  }
}

export const userKey = (user, name) => `${PREFIX}:${(user || "guest").toLowerCase()}:${name}`;

/** useState that persists to localStorage under `key`. */
export function usePersistentState(key, initial) {
  const [state, setState] = useState(() => ({ key, value: readJSON(key, initial) }));
  let current = state;
  if (state.key !== key) {
    // Key changed (e.g. a different user): load that user's data instead.
    current = { key, value: readJSON(key, initial) };
    setState(current);
  }
  useEffect(() => {
    writeJSON(current.key, current.value);
  }, [current]);
  const setValue = useCallback(
    (updater) => setState((s) => ({ key: s.key, value: typeof updater === "function" ? updater(s.value) : updater })),
    []
  );
  return [current.value, setValue];
}

// ---- session (who is logged in + their keys) ----
// Keys are kept in localStorage only if the user ticks "remember me", otherwise in sessionStorage.

const SESSION_KEY = `${PREFIX}:session`;

export function loadSession() {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY) || localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveSession(session) {
  const raw = JSON.stringify(session);
  try {
    if (session.remember) {
      localStorage.setItem(SESSION_KEY, raw);
      sessionStorage.removeItem(SESSION_KEY);
    } else {
      sessionStorage.setItem(SESSION_KEY, raw);
      localStorage.removeItem(SESSION_KEY);
    }
  } catch {
    /* ignore */
  }
}

export function clearSession() {
  try {
    sessionStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(SESSION_KEY);
  } catch {
    /* ignore */
  }
}

export const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
