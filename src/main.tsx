import { createRoot } from "react-dom/client";
import { initSentry } from '@/lib/monitoring/sentry';
import { initAnalytics } from '@/lib/analytics/posthog';
import "./i18n/config";
import App from "./App.tsx";
import "./index.css";

initSentry();
initAnalytics();
createRoot(document.getElementById("root")!).render(<App />);
