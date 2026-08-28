/**
 * Onboarding draft persistence.
 *
 * A local picking a provider role while signed out is bounced to /signup. Before
 * this module only the role survived that redirect, so on return the app created
 * a provider row with NO name, bio, city or photo — and it looked like success.
 *
 * Everything the onboarding collected is now written to localStorage under a
 * versioned key before the redirect, and rehydrated afterwards so the person
 * confirms and submits their own details.
 *
 * THE AVATAR: it is stored as a downscaled data URL, not pre-uploaded. Uploading
 * before the redirect is impossible — the storage bucket paths are scoped under
 * `${userId}/` and guarded by RLS, so there is no authenticated identity to
 * upload as while the user is still signed out. Downscaling to max 640px JPEG
 * keeps it inside the localStorage quota and means the bytes are sent over
 * mobile data exactly once, after sign-in.
 */

const KEY = "sandal-onboarding-draft-v1";

export type OnboardingDraft = {
  v: 1;
  savedAt: string;
  /** The auth user the draft was created for, or null if created signed out. */
  forUserId: string | null;
  role: string;
  lang: "en" | "ar";
  name: string;
  nameAr: string;
  bio: string;
  region: string | null;
  cities: string[];
  interests: string[];
  travelStyle: string | null;
  budget: string | null;
  roleAnswers: Record<number, string[]>;
  /** Downscaled JPEG data URL of the chosen avatar, if any. */
  avatarDataUrl: string | null;
};

/** Downscale an image file to a compact JPEG data URL (max 640px, q0.7). */
export async function fileToCompactDataUrl(file: File, max = 640): Promise<string | null> {
  try {
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });

    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error("decode failed"));
      el.src = dataUrl;
    });

    const scale = Math.min(1, max / Math.max(img.width, img.height));
    const w = Math.max(1, Math.round(img.width * scale));
    const h = Math.max(1, Math.round(img.height * scale));
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return dataUrl;
    ctx.drawImage(img, 0, 0, w, h);
    return canvas.toDataURL("image/jpeg", 0.7);
  } catch {
    return null;
  }
}

/** Turn a stored data URL back into a File so the picker and uploader can use it. */
export function dataUrlToFile(dataUrl: string, name = "avatar.jpg"): File | null {
  try {
    const [head, body] = dataUrl.split(",");
    const mime = head.match(/data:(.*?);/)?.[1] || "image/jpeg";
    const bin = atob(body);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return new File([bytes], name, { type: mime });
  } catch {
    return null;
  }
}

export function saveOnboardingDraft(draft: Omit<OnboardingDraft, "v" | "savedAt">): void {
  try {
    const payload: OnboardingDraft = { ...draft, v: 1, savedAt: new Date().toISOString() };
    localStorage.setItem(KEY, JSON.stringify(payload));
  } catch {
    // Quota exceeded (usually the avatar): keep the text, drop the photo.
    try {
      localStorage.setItem(
        KEY,
        JSON.stringify({ ...draft, avatarDataUrl: null, v: 1, savedAt: new Date().toISOString() })
      );
    } catch {
      // localStorage unavailable (private mode): nothing more we can do.
    }
  }
}

/**
 * Read the stored draft. Discards it when it belongs to a different account
 * (shared phone, second signup) or when it is older than 7 days.
 */
export function loadOnboardingDraft(currentUserId: string | null): OnboardingDraft | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const draft = JSON.parse(raw) as OnboardingDraft;
    if (draft?.v !== 1 || !draft.role) {
      clearOnboardingDraft();
      return null;
    }
    if (draft.forUserId && currentUserId && draft.forUserId !== currentUserId) {
      clearOnboardingDraft();
      return null;
    }
    const age = Date.now() - new Date(draft.savedAt).getTime();
    if (!Number.isFinite(age) || age > 7 * 24 * 60 * 60 * 1000) {
      clearOnboardingDraft();
      return null;
    }
    return draft;
  } catch {
    clearOnboardingDraft();
    return null;
  }
}

export function clearOnboardingDraft(): void {
  try {
    localStorage.removeItem(KEY);
  } catch {
    // ignore
  }
}
