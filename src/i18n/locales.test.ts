import { describe, expect, it } from "vitest";
import { hasLocale, localizedPath, pickLocale } from "@/i18n/locales";

describe("pickLocale", () => {
  it("defaults to English without any preference", () => {
    expect(pickLocale({})).toBe("en");
  });

  it("follows the browser language", () => {
    expect(pickLocale({ acceptLanguage: "fr-FR,fr;q=0.9,en;q=0.8" })).toBe("fr");
  });

  it("respects quality weights", () => {
    expect(pickLocale({ acceptLanguage: "en;q=0.5,fr;q=0.9" })).toBe("fr");
  });

  it("skips unsupported languages", () => {
    expect(pickLocale({ acceptLanguage: "de-DE,fr;q=0.7" })).toBe("fr");
  });

  it("falls back to English for unsupported languages only", () => {
    expect(pickLocale({ acceptLanguage: "de-DE,ja;q=0.7" })).toBe("en");
  });

  it("ignores languages refused with a zero weight", () => {
    expect(pickLocale({ acceptLanguage: "fr;q=0" })).toBe("en");
  });

  it("prefers the saved choice over the browser language", () => {
    expect(pickLocale({ saved: "fr", acceptLanguage: "en-US" })).toBe("fr");
  });

  it("ignores an unsupported saved choice", () => {
    expect(pickLocale({ saved: "de", acceptLanguage: "fr" })).toBe("fr");
  });
});

describe("hasLocale", () => {
  it("accepts supported locales only", () => {
    expect(hasLocale("en")).toBe(true);
    expect(hasLocale("fr")).toBe(true);
    expect(hasLocale("de")).toBe(false);
  });
});

describe("localizedPath", () => {
  it("swaps the locale of the current page", () => {
    expect(localizedPath("/en/daily", "fr")).toBe("/fr/daily");
  });

  it("handles the locale home page", () => {
    expect(localizedPath("/fr", "en")).toBe("/en");
  });

  it("prefixes a path without locale", () => {
    expect(localizedPath("/daily", "fr")).toBe("/fr/daily");
    expect(localizedPath("/", "fr")).toBe("/fr");
  });

  it("does not mistake a segment starting like a locale", () => {
    expect(localizedPath("/english", "fr")).toBe("/fr/english");
  });
});
