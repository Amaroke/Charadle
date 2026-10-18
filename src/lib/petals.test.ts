import { describe, expect, it } from "vitest";
import { createPetals } from "@/lib/petals";

describe("createPetals", () => {
  it("creates the requested number of petals", () => {
    expect(createPetals(24, 1)).toHaveLength(24);
  });

  it("returns the same petals for the same seed", () => {
    expect(createPetals(10, 42)).toEqual(createPetals(10, 42));
  });

  it("returns different petals for different seeds", () => {
    expect(createPetals(10, 1)).not.toEqual(createPetals(10, 2));
  });

  it("keeps every petal within the screen and the animation cycle", () => {
    for (const petal of createPetals(200, 7)) {
      expect([1, 2, 3]).toContain(petal.variant);
      expect(petal.left).toBeGreaterThanOrEqual(0);
      expect(petal.left).toBeLessThan(95);
      expect(petal.delay).toBeGreaterThanOrEqual(0);
      expect(petal.delay).toBeLessThan(10);
    }
  });

  it("uses every petal variant", () => {
    const variants = new Set(createPetals(50, 3).map((petal) => petal.variant));
    expect(variants).toEqual(new Set([1, 2, 3]));
  });
});
