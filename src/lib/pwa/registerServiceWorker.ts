/**
 * Single, guarded entry point for service-worker registration.
 * Never registers in dev, Lovable preview, iframes, or when `?sw=off` is present.
 */
const SW_URL = "/sw.js";

const isRefusedContext = () => {
  if (!import.meta.env.PROD) return true;
  if (typeof window === "undefined") return true;
  if (window.self !== window.top) return true;

  const { hostname, search } = window.location;
  if (new URLSearchParams(search).has("sw") && new URLSearchParams(search).get("sw") === "off") {
    return true;
  }
  if (hostname.startsWith("id-preview--") || hostname.startsWith("preview--")) return true;

  const blockedHosts = [
    "lovableproject.com",
    "lovableproject-dev.com",
    "beta.lovable.dev",
  ];
  return blockedHosts.some((host) => hostname === host || hostname.endsWith(`.${host}`));
};

const unregisterAppWorkers = async () => {
  if (!("serviceWorker" in navigator)) return;
  const registrations = await navigator.serviceWorker.getRegistrations();
  await Promise.allSettled(
    registrations
      .filter((registration) => (registration.active?.scriptURL ?? "").endsWith(SW_URL))
      .map((registration) => registration.unregister()),
  );
};

/** Minimal, on-brand "new version available" prompt. */
const showReloadPrompt = (reload: () => void) => {
  if (document.getElementById("sandal-sw-update")) return;

  const bar = document.createElement("div");
  bar.id = "sandal-sw-update";
  bar.setAttribute("role", "status");
  bar.style.cssText =
    "position:fixed;left:16px;right:16px;bottom:88px;z-index:9999;display:flex;align-items:center;" +
    "justify-content:space-between;gap:12px;background:#1A7A74;color:#fff;border-radius:12px;" +
    "padding:12px 14px;font-family:Cairo,sans-serif;font-size:13px;font-weight:600;" +
    "box-shadow:0 8px 24px rgba(0,0,0,.18)";

  const label = document.createElement("span");
  label.textContent = "New version available · نسخة جديدة متوفرة";

  const button = document.createElement("button");
  button.type = "button";
  button.textContent = "Reload";
  button.style.cssText =
    "background:#2BBFB3;color:#fff;border:0;border-radius:8px;padding:8px 14px;" +
    "font:inherit;cursor:pointer;flex-shrink:0";
  button.onclick = () => {
    bar.remove();
    reload();
  };

  bar.append(label, button);
  document.body.appendChild(bar);
};

export const registerServiceWorker = async () => {
  if (isRefusedContext()) {
    await unregisterAppWorkers();
    return;
  }

  const { registerSW } = await import("virtual:pwa-register");
  const updateSW = registerSW({
    immediate: true,
    onNeedRefresh() {
      showReloadPrompt(() => void updateSW(true));
    },
  });
};
