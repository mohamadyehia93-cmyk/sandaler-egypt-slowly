#!/usr/bin/env node
/**
 * Optional prerender step.
 *
 * react-snap needs a working Puppeteer/Chromium download, which is not
 * available in every build environment (hosted publish builds in particular).
 * When it isn't, react-snap either crashes or hangs and takes the whole
 * deployment down with it. The SPA works fine without prerendering, so the
 * step is opt-in: set PRERENDER=1 (or run `npm run prerender`) to use it.
 */
import { spawnSync } from "node:child_process";

if (process.env.PRERENDER !== "1") {
  console.log("[prerender] skipped (set PRERENDER=1 to enable)");
  process.exit(0);
}

const res = spawnSync("react-snap", { stdio: "inherit", shell: true });
if (res.status !== 0) {
  console.log("[prerender] react-snap failed — continuing without prerendered HTML");
}
process.exit(0);
