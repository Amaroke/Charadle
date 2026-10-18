import { describe, expect, it } from "vitest";
import en from "@/i18n/dictionaries/en.json";
import fr from "@/i18n/dictionaries/fr.json";

function keys(value: unknown, prefix = ""): string[] {
  if (typeof value !== "object" || value === null) return [prefix];
  return Object.entries(value).flatMap(([key, child]) => keys(child, prefix ? `${prefix}.${key}` : key));
}

describe("dictionaries", () => {
  it("translate the same keys in every language", () => {
    expect(keys(fr).sort()).toEqual(keys(en).sort());
  });

  it("have no empty translation", () => {
    const values = [en, fr].flatMap((dictionary) => JSON.stringify(dictionary).match(/:""/g) ?? []);
    expect(values).toEqual([]);
  });
});
