import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { VitePWA } from "vite-plugin-pwa";
import { mcpPlugin } from "@lovable.dev/mcp-js/stacks/supabase/vite";

// Public backend values (protected by RLS). Used as build-time fallbacks so a build
// running without the VITE_SUPABASE_* env vars still produces a working bundle
// instead of a blank page.
const FALLBACK_SUPABASE_PROJECT_ID = "meacccbwpzrrcoanlojw";
const FALLBACK_SUPABASE_URL = `https://${FALLBACK_SUPABASE_PROJECT_ID}.supabase.co`;
const FALLBACK_SUPABASE_PUBLISHABLE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1lYWNjY2J3cHpycmNvYW5sb2p3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU0MjI1OTIsImV4cCI6MjA5MDk5ODU5Mn0.0tiOl8gFP5JEwp8apSWNSDLHHCI-4P1EOQeuAxljV-w";

const pick = (value: string | undefined, fallback: string) =>
  value && value.trim() !== "" && value !== "undefined" ? value : fallback;

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  return {
  define: {
    "import.meta.env.VITE_SUPABASE_URL": JSON.stringify(
      pick(env.VITE_SUPABASE_URL, FALLBACK_SUPABASE_URL),
    ),
    "import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY": JSON.stringify(
      pick(env.VITE_SUPABASE_PUBLISHABLE_KEY, FALLBACK_SUPABASE_PUBLISHABLE_KEY),
    ),
    "import.meta.env.VITE_SUPABASE_PROJECT_ID": JSON.stringify(
      pick(env.VITE_SUPABASE_PROJECT_ID, FALLBACK_SUPABASE_PROJECT_ID),
    ),
  },
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [
    react(),
    mcpPlugin(),

    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.ico", "robots.txt", "apple-touch-icon.png"],
      manifest: {
        name: "Sandal — Discover Egypt Slowly",
        short_name: "Sandal",
        description:
          "Egypt's slow rural tourism platform. Discover overlooked villages, book local experiences, explore the Nile Delta.",
        theme_color: "#2BBFB3",
        background_color: "#FAFAF8",
        display: "standalone",
        orientation: "portrait",
        start_url: "/",
        scope: "/",
        lang: "en",
        dir: "ltr",
        icons: [
          { src: "pwa-192x192.png", sizes: "192x192", type: "image/png" },
          { src: "pwa-512x512.png", sizes: "512x512", type: "image/png" },
          {
            src: "pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable",
          },
        ],
        categories: ["travel", "lifestyle", "culture"],
      },
      workbox: {
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "google-fonts-cache",
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
            },
          },
          {
            urlPattern: /^https:\/\/.*\.supabase\.co\/storage\/.*/i,
            handler: "StaleWhileRevalidate",
            options: {
              cacheName: "supabase-images-cache",
              expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 30 },
            },
          },
          {
            urlPattern: /\.(?:mp3|wav|ogg)$/i,
            handler: "CacheFirst",
            options: {
              cacheName: "audio-tour-cache",
              expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 * 90 },
            },
          },
        ],
      },
      devOptions: { enabled: false },
    }),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: ["react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime"],
  },
  };
});
