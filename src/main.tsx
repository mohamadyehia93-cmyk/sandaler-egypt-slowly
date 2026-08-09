import type { ReactElement } from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import { initSentry } from '@/lib/monitoring/sentry';
import { initAnalytics } from '@/lib/analytics/posthog';
import { missingRequiredEnv } from '@/lib/config/env';
import "./i18n/config";
import "./index.css";

initSentry();
initAnalytics();

const rootEl = document.getElementById("root")!;

function mount(app: ReactElement) {
  // react-snap prerenders pages; use hydrateRoot when HTML is prerendered
  if (rootEl.hasChildNodes()) {
    hydrateRoot(rootEl, app);
  } else {
    createRoot(rootEl).render(app);
  }
}

/**
 * Last-resort UI for a failure that happens before React can mount. Written
 * with plain DOM on purpose: the app's module graph is what just failed, so
 * this must not depend on any of it. Replaces prerendered markup rather than
 * hydrating it.
 */
function renderBootError(detail: string) {
  console.error(`[boot] ${detail}`);
  rootEl.innerHTML = "";

  const wrap = document.createElement("div");
  wrap.setAttribute("data-testid", "boot-error");
  wrap.setAttribute("role", "alert");
  wrap.style.cssText =
    "min-height:100vh;display:flex;flex-direction:column;align-items:center;" +
    "justify-content:center;gap:12px;padding:24px;text-align:center;" +
    "font-family:Cairo,system-ui,sans-serif;color:#1f2937";

  const heading = document.createElement("h1");
  heading.textContent = "Sandal couldn’t start";
  heading.style.cssText = "margin:0;font-size:22px;font-weight:700";

  const message = document.createElement("p");
  message.textContent = detail;
  message.style.cssText = "margin:0;max-width:38rem;font-size:15px;line-height:1.6;color:#4b5563";

  wrap.append(heading, message);
  rootEl.appendChild(wrap);
}

const missing = missingRequiredEnv();

if (missing.length > 0) {
  renderBootError(
    `The app is missing required configuration: ${missing.join(", ")}. ` +
      `Set these environment variables at build time and redeploy.`,
  );
} else {
  import("./App.tsx")
    .then(({ default: App }) => {
      mount(
        <HelmetProvider>
          <App />
        </HelmetProvider>,
      );
    })
    .catch((error: unknown) => {
      renderBootError(
        `The app failed to load. ${error instanceof Error ? error.message : String(error)}`,
      );
    });
}
