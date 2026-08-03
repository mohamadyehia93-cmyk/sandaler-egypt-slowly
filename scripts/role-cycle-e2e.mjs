#!/usr/bin/env node
/**
 * CLI runner for the backend role-cycle e2e harness.
 *   node scripts/role-cycle-e2e.mjs            # all roles + shared checks
 *   node scripts/role-cycle-e2e.mjs narrator   # a single role
 */
import {
  ROLES,
  runRoleCycle,
  runStorageCycle,
  runInteractionCycle,
  runAnonymousReadCycle,
} from "../tests/role-cycle/roleCycle.mjs";

const only = process.argv.slice(2).filter((a) => !a.startsWith("-"));
const roles = only.length ? only : ROLES;
let failures = 0;

const report = (name, ok, detail) => {
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? ` — ${detail}` : ""}`);
  if (!ok) failures += 1;
};

for (const role of roles) {
  try {
    const result = await runRoleCycle(role);
    report(`role ${role}`, true, `${result.table}: create/edit/list/delete`);
  } catch (error) {
    report(`role ${role}`, false, error.message);
  }
}

for (const [name, fn] of [
  ["storage uploads + downloads", runStorageCycle],
  ["interactions", runInteractionCycle],
  ["anonymous reads", runAnonymousReadCycle],
]) {
  try {
    await fn();
    report(name, true);
  } catch (error) {
    report(name, false, error.message);
  }
}

console.log(`\n${roles.length + 3 - failures}/${roles.length + 3} checks passed`);
process.exit(failures ? 1 : 0);
