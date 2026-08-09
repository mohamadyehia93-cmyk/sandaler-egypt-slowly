import { describe, it, expect } from "vitest";
import * as sampleData from "../sampleData";

/**
 * Guards against sparse arrays in the sample data.
 *
 * A stray trailing comma (`}, ,`) leaves a hole in the array, and holes read
 * back as `undefined`. `map`/`filter`/`forEach` skip holes, so the data looks
 * fine on listing pages — but `find` and `findIndex` visit them, so every
 * lookup that *misses* walks into `undefined.id` and throws. That crashed the
 * organization, person and cause detail pages whenever the id wasn't found,
 * showing the error boundary instead of the not-found view.
 */
const arrayExports = Object.entries(sampleData).filter(
  (entry): entry is [string, unknown[]] => Array.isArray(entry[1]),
);

describe("sampleData arrays", () => {
  it("exports arrays to check", () => {
    expect(arrayExports.length).toBeGreaterThan(0);
  });

  it.each(arrayExports)("%s has no holes or undefined entries", (_name, array) => {
    // Indexed loop, not map/filter: those skip holes, so a hole-hunting check
    // built from them silently passes. `i in array` is false only for a hole.
    const badIndices: number[] = [];
    for (let i = 0; i < array.length; i++) {
      if (!(i in array) || array[i] === undefined || array[i] === null) badIndices.push(i);
    }

    expect(badIndices).toEqual([]);
  });

  it.each(arrayExports)("%s survives a lookup that finds nothing", (_name, array) => {
    // The exact call that crashed, reproduced without optional chaining —
    // `?.` would swallow the hole and make this assertion vacuous.
    expect(() =>
      array.find((entry) => (entry as { id: string }).id === "__no_such_id__"),
    ).not.toThrow();
  });
});
