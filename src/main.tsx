import { createRoot, hydrateRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import { initSentry } from '@/lib/monitoring/sentry';
import { initAnalytics } from '@/lib/analytics/posthog';
import { installDiagnostics } from '@/lib/diagnostics';
import "./i18n/config";
import App from "./App.tsx";
import "./index.css";

const RECOVERY_KEY = "sandal-module-recovery";

const recoverFromStaleModule = () => {
  if (sessionStorage.getItem(RECOVERY_KEY)) return;
  sessionStorage.setItem(RECOVERY_KEY, "1");
  window.location.reload();
};

// Vite emits this when a browser still references a module from an older build.
window.addEventListener("vite:preloadError", recoverFromStaleModule);
window.addEventListener("pageshow", () => sessionStorage.removeItem(RECOVERY_KEY), { once: true });

installDiagnostics();
initSentry();
initAnalytics();

const rootEl = document.getElementById("root");
if (!rootEl) throw new Error("Application root element is missing");
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
