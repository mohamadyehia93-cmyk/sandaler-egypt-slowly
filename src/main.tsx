import { createRoot } from "react-dom/client";
import { initSentry } from '@/lib/monitoring/sentry';
import "./i18n/config";
import App from "./App.tsx";
import "./index.css";

initSentry();
createRoot(document.getElementById("root")!).render(<App />);
