/**
 * Lightweight in-app diagnostics buffer.
 * Captures route history and frontend errors so they can be inspected at /diagnostics.
 */

export type DiagEntry = {
  id: string;
  time: string;
  kind: "error" | "unhandledrejection" | "console.error" | "route";
  message: string;
  detail?: string;
};

const MAX_ENTRIES = 100;

type Listener = () => void;

const state = {
  entries: [] as DiagEntry[],
  routes: [] as { path: string; time: string }[],
  listeners: new Set<Listener>(),
  installed: false,
};

const notify = () => state.listeners.forEach((l) => l());

const uid = () => Math.random().toString(36).slice(2, 10);

export function record(kind: DiagEntry["kind"], message: string, detail?: string) {
  state.entries = [
    { id: uid(), time: new Date().toISOString(), kind, message, detail },
    ...state.entries,
  ].slice(0, MAX_ENTRIES);
  notify();
}

export function recordRoute(path: string) {
  const last = state.routes[0];
  if (last?.path === path) return;
  state.routes = [{ path, time: new Date().toISOString() }, ...state.routes].slice(0, 30);
  notify();
}

export function getSnapshot() {
  return { entries: state.entries, routes: state.routes };
}

export function clearDiagnostics() {
  state.entries = [];
  notify();
}

export function subscribe(listener: Listener) {
  state.listeners.add(listener);
  return () => state.listeners.delete(listener);
}

export function installDiagnostics() {
  if (state.installed || typeof window === "undefined") return;
  state.installed = true;

  window.addEventListener("error", (e) => {
    const err = (e as ErrorEvent).error;
    record(
      "error",
      (e as ErrorEvent).message || String(err) || "Unknown error",
      err?.stack ?? `${(e as ErrorEvent).filename}:${(e as ErrorEvent).lineno}`,
    );
  });

  window.addEventListener("unhandledrejection", (e) => {
    const reason = (e as PromiseRejectionEvent).reason;
    record(
      "unhandledrejection",
      reason?.message ?? String(reason),
      reason?.stack,
    );
  });

  const originalError = console.error.bind(console);
  console.error = (...args: unknown[]) => {
    try {
      record(
        "console.error",
        args
          .map((a) => (a instanceof Error ? a.message : typeof a === "string" ? a : JSON.stringify(a)))
          .join(" ")
          .slice(0, 500),
      );
    } catch {
      /* never break logging */
    }
    originalError(...args);
  };
}
