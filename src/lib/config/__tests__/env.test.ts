import { describe, it, expect } from "vitest";
import { missingRequiredEnv, REQUIRED_ENV_VARS } from "../env";

const complete = {
  VITE_SUPABASE_URL: "https://example.supabase.co",
  VITE_SUPABASE_PUBLISHABLE_KEY: "anon-key",
};

describe("missingRequiredEnv", () => {
  it("reports nothing when every required var is set", () => {
    expect(missingRequiredEnv(complete)).toEqual([]);
  });

  it("reports a var that is absent", () => {
    const { VITE_SUPABASE_URL: _omitted, ...rest } = complete;
    expect(missingRequiredEnv(rest)).toEqual(["VITE_SUPABASE_URL"]);
  });

  it("treats blank and whitespace-only values as missing", () => {
    expect(missingRequiredEnv({ ...complete, VITE_SUPABASE_PUBLISHABLE_KEY: "" })).toEqual([
      "VITE_SUPABASE_PUBLISHABLE_KEY",
    ]);
    expect(missingRequiredEnv({ ...complete, VITE_SUPABASE_PUBLISHABLE_KEY: "   " })).toEqual([
      "VITE_SUPABASE_PUBLISHABLE_KEY",
    ]);
  });

  it("treats non-string values as missing", () => {
    expect(missingRequiredEnv({ ...complete, VITE_SUPABASE_URL: undefined })).toEqual([
      "VITE_SUPABASE_URL",
    ]);
  });

  it("reports every missing var, not just the first", () => {
    expect(missingRequiredEnv({})).toEqual([...REQUIRED_ENV_VARS]);
  });
});
