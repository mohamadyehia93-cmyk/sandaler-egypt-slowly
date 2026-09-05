/**
 * Resumable draft persistence for the provider create/edit forms.
 *
 * WHY: every New* form kept its entire state in component `useState`. A phone
 * call, a screen lock that killed the tab, an accidental back gesture or a
 * dropped connection unmounted the page and threw away everything typed — the
 * ten-step New Experience wizard restarted from step 1. On mobile data that is
 * enough for a real provider to give up.
 *
 * Drafts are written to localStorage under a versioned, per-user, per-form key,
 * expire after 7 days, and are discarded when a different account is signed in
 * (shared phones are common). Files are never serialised: the wizard uploads
 * photos as they are chosen and stores their public URLs instead.
 */

const PREFIX = "sandal-draft-v1";
const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

export type FormDraft<T> = {
  v: 1;
  savedAt: string;
  /** Auth user the draft belongs to; drafts are never shown to another account. */
  forUserId: string;
  /** Wizard step index, for multi-step forms. */
  step?: number;
  data: T;
};

export function draftKey(formKey: string, userId: string): string {
  return `${PREFIX}:${formKey}:${userId}`;
}

export function saveFormDraft<T>(formKey: string, userId: string, data: T, step?: number): void {
  if (!userId) return;
  try {
    const payload: FormDraft<T> = { v: 1, savedAt: new Date().toISOString(), forUserId: userId, step, data };
    localStorage.setItem(draftKey(formKey, userId), JSON.stringify(payload));
  } catch {
    // Quota exceeded or private mode: losing the draft is no worse than before.
  }
}

/** Read a draft, discarding stale ones and drafts belonging to another account. */
export function loadFormDraft<T>(formKey: string, userId: string | null): FormDraft<T> | null {
  if (!userId) return null;
  try {
    const raw = localStorage.getItem(draftKey(formKey, userId));
    if (!raw) return null;
    const draft = JSON.parse(raw) as FormDraft<T>;
    if (draft?.v !== 1 || !draft.data) {
      clearFormDraft(formKey, userId);
      return null;
    }
    if (draft.forUserId !== userId) {
      clearFormDraft(formKey, userId);
      return null;
    }
    const age = Date.now() - new Date(draft.savedAt).getTime();
    if (!Number.isFinite(age) || age > MAX_AGE_MS) {
      clearFormDraft(formKey, userId);
      return null;
    }
    return draft;
  } catch {
    return null;
  }
}

export function clearFormDraft(formKey: string, userId: string | null): void {
  if (!userId) return;
  try {
    localStorage.removeItem(draftKey(formKey, userId));
  } catch {
    // ignore
  }
}
