import { describe, expect, it } from "bun:test";
import { pickRequiredKeys } from "../../src/utils/pick.js";

describe("pickRequiredKeys", () => {
  it("picks required keys from merged", () => {
    const merged = { a: 1, b: 2, c: 3, d: 4 };
    const required = ["a", "c"] as const;
    const { result, missingKeys } = pickRequiredKeys(merged, required, {});
    expect(result).toEqual({ a: 1, c: 3 });
    expect(missingKeys).toEqual([]);
  });

  it("reports missing keys", () => {
    const merged = { a: 1 };
    const required = ["a", "b", "c"] as const;
    const { result, missingKeys } = pickRequiredKeys(merged, required, {});
    expect(result).toEqual({ a: 1 });
    expect(missingKeys).toEqual(["b", "c"]);
  });

  it("applies defaults for missing keys", () => {
    const merged = { a: 1 };
    const required = ["a", "b"] as const;
    const defaults = { b: 99 };
    const { result, missingKeys } = pickRequiredKeys(
      merged,
      required,
      defaults
    );
    expect(result).toEqual({ a: 1, b: 99 });
    expect(missingKeys).toEqual([]);
  });

  it("overwrites null/undefined with default", () => {
    const merged = { a: 1, b: undefined as unknown as number };
    const required = ["a", "b"] as const;
    const defaults = { b: 128 };
    const { result, missingKeys } = pickRequiredKeys(
      merged,
      required,
      defaults
    );
    expect(result.a).toBe(1);
    expect(result.b).toBe(128);
    expect(missingKeys).toEqual([]);
  });

  it("preserves 0 as valid value", () => {
    const merged = { a: 0, b: 2 };
    const required = ["a", "b"] as const;
    const { result } = pickRequiredKeys(merged, required, {});
    expect(result.a).toBe(0);
    expect(result.b).toBe(2);
  });
});
