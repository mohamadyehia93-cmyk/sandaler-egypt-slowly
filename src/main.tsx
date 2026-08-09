import { createRoot, hydrateRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import { initSentry } from '@/lib/monitoring/sentry';
import { initAnalytics } from '@/lib/analytics/posthog';
import { installDiagnostics } from '@/lib/diagnostics';
import { isSupabaseConfigured } from '@/lib/supabaseConfig';
import "./i18n/config";
import "./index.css";

const RECOVERY_KEY = "sandal-module-recovery";

const recoverFromStaleModule = () => {
  if (sessionStorage.getItem(RECOVERY_KEY)) return;
  sessionStorage.setItem(RECOVERY_KEY, "1");
  window.location.reload();
};

// Vite emits this when a browser still references a module from an older build.
window.addEventListener("vite:preloadError", recoverFromStaleModule);

installDiagnostics();
initSentry();
initAnalytics();

const rootEl = document.getElementById("root");
if (!rootEl) throw new Error("Application root element is missing");

const renderConfigError = () => {
  rootEl.innerHTML = `
    <div style="min-height:100vh;display:flex;align-items:center;justify-content:center;padding:24px;font-family:Cairo,sans-serif;background:#FAFAF8;color:#1A1A1A;text-align:center">
      <div style="max-width:420px">
        <h1 style="font-size:20px;font-weight:700;margin:0 0 8px">Backend configuration missing</h1>
        <p style="font-size:14px;line-height:1.6;margin:0 0 16px">
          This build is missing its backend URL or key, so the app cannot start.
          Re-publish the project to restore the configuration.
        </p>
        <button onclick="window.location.reload()" style="background:#2BBFB3;color:#fff;border:0;border-radius:12px;padding:10px 20px;font-size:14px;font-weight:600">Reload</button>
      </div>
    </div>`;
};

const mount = async () => {
  // Guard before App (and its Supabase client import) is evaluated.
  if (!isSupabaseConfigured()) {
    renderConfigError();
    return;
  }

  const { default: App } = await import("./App.tsx");
  const app = (
    <HelmetProvider>
      <App />
    </HelmetProvider>
  );

  // react-snap prerenders pages; use hydrateRoot when HTML is prerendered
  if (rootEl.hasChildNodes()) {
    hydrateRoot(rootEl, app);
  } else {
    createRoot(rootEl).render(app);
  }
};

void mount().catch((error) => {
  console.error("Failed to mount application", error);
  renderConfigError();
});

window.setTimeout(() => sessionStorage.removeItem(RECOVERY_KEY), 5_000);
