import { useCallback, useEffect, useRef, useState } from "react";
import { loadFormDraft, saveFormDraft, clearFormDraft } from "@/lib/formDraft";

type Options<T> = {
  /** Stable per-form key, e.g. "new-experience". */
  formKey: string;
  userId: string | null;
  /** Live form state to persist. */
  data: T;
  /** Wizard step index, when the form has steps. */
  step?: number;
  /** Off for edit mode (the row is the source of truth) and while auth loads. */
  enabled: boolean;
  /** True when the user has actually typed something worth restoring. */
  isDirty: boolean;
};

/**
 * Auto-saves form state to localStorage (debounced) and surfaces a pending draft
 * so the page can ASK the user to resume rather than silently restoring or
 * silently discarding.
 */
export function useFormDraft<T>({ formKey, userId, data, step, enabled, isDirty }: Options<T>) {
  const [pending, setPending] = useState<{ data: T; step: number } | null>(null);
  /** Blocks writes until the resume question is answered, so an empty fresh
   *  form cannot overwrite the draft we are about to offer. */
  const [decided, setDecided] = useState(false);
  const checkedFor = useRef<string | null>(null);

  useEffect(() => {
    if (!enabled || !userId) return;
    if (checkedFor.current === userId) return;
    checkedFor.current = userId;
    const draft = loadFormDraft<T>(formKey, userId);
    if (draft) setPending({ data: draft.data, step: draft.step ?? 0 });
    else setDecided(true);
  }, [enabled, userId, formKey]);

  useEffect(() => {
    if (!enabled || !userId || !decided || !isDirty) return;
    const t = setTimeout(() => saveFormDraft(formKey, userId, data, step), 600);
    return () => clearTimeout(t);
  }, [enabled, userId, decided, isDirty, formKey, data, step]);

  /** Flush immediately — used on step change and on blur. */
  const flush = useCallback(() => {
    if (!enabled || !userId || !decided || !isDirty) return;
    saveFormDraft(formKey, userId, data, step);
  }, [enabled, userId, decided, isDirty, formKey, data, step]);

  const clear = useCallback(() => {
    clearFormDraft(formKey, userId);
  }, [formKey, userId]);

  const resume = useCallback(() => {
    const restored = pending;
    setPending(null);
    setDecided(true);
    return restored;
  }, [pending]);

  const startOver = useCallback(() => {
    clearFormDraft(formKey, userId);
    setPending(null);
    setDecided(true);
  }, [formKey, userId]);

  return { pendingDraft: pending, resume, startOver, flush, clear };
}
