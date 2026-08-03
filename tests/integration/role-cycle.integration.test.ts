import { describe, it, expect } from "vitest";
import {
  ROLES,
  BUCKETS,
  runRoleCycle,
  runStorageCycle,
  runInteractionCycle,
  runAnonymousReadCycle,
  // @ts-expect-error - plain ESM harness without type declarations
} from "../role-cycle/roleCycle.mjs";

/**
 * Backend end-to-end tests. They create real accounts and rows in the
 * project's backend, so they only run when RUN_BACKEND_E2E=1
 * (`npm run test:roles`). `npm test` stays fast and offline.
 */
const enabled = process.env.RUN_BACKEND_E2E === "1";
const d = enabled ? describe : describe.skip;

d("role cycle (backend e2e)", () => {
  it.each(ROLES as string[])(
    "%s completes sign-up -> onboarding -> create -> edit -> list -> delete",
    async (role) => {
      const report = await runRoleCycle(role);
      expect(report.steps).toEqual({
        auth: true,
        onboarding: true,
        create: true,
        edit: true,
        list: true,
        delete: true,
      });
    },
    120_000
  );

  it(
    "uploads and public downloads work for every storage bucket",
    async () => {
      const results = await runStorageCycle();
      expect(Object.keys(results).sort()).toEqual([...(BUCKETS as string[])].sort());
      expect(Object.values(results).every(Boolean)).toBe(true);
    },
    120_000
  );

  it(
    "interactions stay accessible (follows, comments, statuses, itineraries, messaging)",
    async () => {
      const results = await runInteractionCycle();
      expect(results).toEqual({
        follows: true,
        comments: true,
        commentsVisible: true,
        statuses: true,
        savedItineraries: true,
        messaging: true,
        spoofBlocked: true,
      });
    },
    120_000
  );

  it(
    "signed-out visitors can still browse published content",
    async () => {
      const results = await runAnonymousReadCycle();
      expect(Object.values(results).every(Boolean)).toBe(true);
    },
    60_000
  );
});
