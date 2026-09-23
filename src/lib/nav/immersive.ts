import { useEffect, useSyncExternalStore } from "react";

/**
 * Some focused views are not their own route (an open chat conversation lives
 * inside /inbox). They flag themselves immersive so the one navigation bar can
 * hide, without scattering per-page nav logic.
 */
let count = 0;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

export const useIsImmersive = () => useSyncExternalStore(subscribe, () => count > 0, () => false);

/** Mark the current view immersive for as long as the component is mounted. */
export const useImmersiveView = (active = true) => {
  useEffect(() => {
    if (!active) return;
    count += 1;
    emit();
    return () => {
      count -= 1;
      emit();
    };
  }, [active]);
};
