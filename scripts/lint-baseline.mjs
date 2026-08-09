#!/usr/bin/env node
/**
 * Lint ratchet.
 *
 * `npm run lint` currently reports 231 errors, accumulated because linting was
 * never wired into CI. Failing the build on all of them would mean fixing 231
 * issues before anything else can merge; ignoring them lets the count keep
 * growing. So this records a per-file baseline and fails only when a file gets
 * *worse* than it already was — existing debt is frozen, new debt is blocked.
 *
 *   node scripts/lint-baseline.mjs            # check (used by CI)
 *   node scripts/lint-baseline.mjs --update   # re-record after fixing things
 *
 * Per-file rather than a single total, so that fixing one file can't silently
 * pay for a regression somewhere else.
 */
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { relative, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(fileURLToPath(import.meta.url), "..", "..");
const BASELINE_PATH = join(ROOT, ".eslint-baseline.json");
const UPDATE = process.argv.includes("--update");

function runEslint() {
  let stdout;
  try {
    stdout = execFileSync("npx", ["eslint", ".", "-f", "json"], {
      cwd: ROOT,
      encoding: "utf8",
      maxBuffer: 64 * 1024 * 1024,
    });
  } catch (error) {
    // eslint exits non-zero whenever it reports errors, which is the normal
    // case here — the JSON report still arrives on stdout.
    if (!error.stdout) throw error;
    stdout = error.stdout;
  }
  return JSON.parse(stdout);
}

/** @returns {Record<string, number>} repo-relative path -> error count */
function collectErrors(results) {
  const counts = {};
  for (const result of results) {
    if (result.errorCount > 0) {
      counts[relative(ROOT, result.filePath).split("\\").join("/")] = result.errorCount;
    }
  }
  return counts;
}

const current = collectErrors(runEslint());
const currentTotal = Object.values(current).reduce((a, b) => a + b, 0);

if (UPDATE) {
  const baseline = {
    _comment:
      "Per-file eslint error counts. Frozen debt — a file may not exceed its " +
      "recorded count. Regenerate with `npm run lint:baseline:update` after " +
      "fixing lint errors, so the ratchet tightens.",
    total: currentTotal,
    files: Object.fromEntries(Object.entries(current).sort(([a], [b]) => a.localeCompare(b))),
  };
  writeFileSync(BASELINE_PATH, JSON.stringify(baseline, null, 2) + "\n");
  console.log(`Wrote baseline: ${currentTotal} errors across ${Object.keys(current).length} files.`);
  process.exit(0);
}

if (!existsSync(BASELINE_PATH)) {
  console.error(
    `No baseline at ${relative(ROOT, BASELINE_PATH)}. Create one with: npm run lint:baseline:update`,
  );
  process.exit(1);
}

const baseline = JSON.parse(readFileSync(BASELINE_PATH, "utf8"));
const allowed = baseline.files ?? {};

const regressions = [];
for (const [file, count] of Object.entries(current)) {
  const limit = allowed[file] ?? 0;
  if (count > limit) regressions.push({ file, count, limit });
}

const improvements = [];
for (const [file, limit] of Object.entries(allowed)) {
  const count = current[file] ?? 0;
  if (count < limit) improvements.push({ file, count, limit });
}

if (regressions.length > 0) {
  console.error("New lint errors introduced:\n");
  for (const { file, count, limit } of regressions) {
    console.error(`  ${file}: ${count} errors (baseline allows ${limit})`);
  }
  console.error(
    `\nFix them, or run \`npm run lint:baseline:update\` if the increase is ` +
      `genuinely intended.\nSee the full report with \`npm run lint\`.`,
  );
  process.exit(1);
}

console.log(`No new lint errors. ${currentTotal} known errors (baseline ${baseline.total ?? "?"}).`);

if (improvements.length > 0) {
  const fixed = improvements.reduce((sum, i) => sum + (i.limit - i.count), 0);
  console.log(
    `\n${fixed} error(s) fixed since the baseline was recorded, in ${improvements.length} file(s).\n` +
      `Run \`npm run lint:baseline:update\` to lock the improvement in:`,
  );
  for (const { file, count, limit } of improvements.slice(0, 10)) {
    console.log(`  ${file}: ${limit} -> ${count}`);
  }
}
