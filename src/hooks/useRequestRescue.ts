import { useCallback, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { saveFormDraft, loadFormDraft, clearFormDraft } from "@/lib/formDraft";

/**
 * Keeps a visitor's typed request alive across the sign-in wall.
 *
 * WHY: every request form in the app — session requests, commissions, volunteer
 * sign-ups, gifts, donations, event tickets — checked for an account only when
 * the person pressed Send. They were pushed to /login, often with no way back to
 * the page they were on, and everything they had typed was gone. Most people do
 * not type it all again.
 *
 * So: the form's own values are written to localStorage just before the redirect,
 * restored once when the page mounts again, and deleted as soon as the request is
 * actually sent. The draft is keyed to the device rather than to an account
 * because it is created while nobody is signed in and has to survive signing in.
 * It holds only what the person typed into a form they were about to submit.
 */
export function useRequestRescue<T>(key: string, restore: (data: T) => void) {
  const navigate = useNavigate();
  const storageKey = `request:${key}`;
  const restoreRef = useRef(restore);
  restoreRef.current = restore;
  const restoredOnce = useRef(false);

  useEffect(() => {
    if (restoredOnce.current) return;
    restoredOnce.current = true;
    const draft = loadFormDraft<T>(storageKey, "guest");
    if (draft) restoreRef.current(draft.data);
  }, [storageKey]);

  /** Save what they typed, then send them to sign in and back to this page. */
  const signInToContinue = useCallback(
    (data: T) => {
      saveFormDraft<T>(storageKey, "guest", data);
      const back = window.location.pathname + window.location.search;
      navigate(`/login?return=${encodeURIComponent(back)}`);
    },
    [storageKey, navigate],
  );

  const clearRescue = useCallback(() => clearFormDraft(storageKey, "guest"), [storageKey]);

  return { signInToContinue, clearRescue };
}
