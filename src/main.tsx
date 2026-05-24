import { createRoot, hydrateRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import { initSentry } from '@/lib/monitoring/sentry';
import { initAnalytics } from '@/lib/analytics/posthog';
import "./i18n/config";
import App from "./App.tsx";
import "./index.css";

initSentry();
initAnalytics();

const rootEl = document.getElementById("root")!;
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
