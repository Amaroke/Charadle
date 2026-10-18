import { describe, expect, it } from "vitest";
import { isCorrectGuess } from "@/game/guess";

const luffy = { firstName: "Luffy", lastName: "Monkey D.", aliases: ["Straw Hat"] };

describe("isCorrectGuess", () => {
  it("accepts the first name", () => {
    expect(isCorrectGuess("Luffy", luffy)).toBe(true);
  });

  it("accepts the last name or a complete alias", () => {
    expect(isCorrectGuess("Monkey D.", luffy)).toBe(true);
    expect(isCorrectGuess("Straw Hat", luffy)).toBe(true);
  });

  it("rejects another name or a partial alias", () => {
    expect(isCorrectGuess("Zoro", luffy)).toBe(false);
    expect(isCorrectGuess("Straw", luffy)).toBe(false);
    expect(isCorrectGuess("", luffy)).toBe(false);
  });

  it("ignores case, accents and surrounding spaces", () => {
    expect(isCorrectGuess("  lUFFY ", luffy)).toBe(true);
    expect(isCorrectGuess("Hélène", { firstName: "Helene", lastName: "", aliases: [] })).toBe(true);
    expect(isCorrectGuess("Helene", { firstName: "Hélène", lastName: "", aliases: [] })).toBe(true);
    expect(isCorrectGuess("straw  hat", luffy)).toBe(true);
  });

  it("tolerates one typo on a name of five letters or more", () => {
    expect(isCorrectGuess("Lufy", luffy)).toBe(true);
    expect(isCorrectGuess("Luffi", luffy)).toBe(true);
    expect(isCorrectGuess("Lufffy", luffy)).toBe(true);
    expect(isCorrectGuess("Lfufy", luffy)).toBe(false);
  });

  it("tolerates no typo on a name shorter than five letters", () => {
    const zoro = { firstName: "Zoro", lastName: "Roronoa", aliases: [] };
    expect(isCorrectGuess("Zoro", zoro)).toBe(true);
    expect(isCorrectGuess("Zorr", zoro)).toBe(false);
    expect(isCorrectGuess("Zor", zoro)).toBe(false);
    expect(isCorrectGuess("Roronao", zoro)).toBe(false);
    expect(isCorrectGuess("Roronoo", zoro)).toBe(true);
  });

  it("tolerates a single typo across a multi-word alias", () => {
    expect(isCorrectGuess("Strau Hat", luffy)).toBe(true);
    expect(isCorrectGuess("Straw Hut", luffy)).toBe(false);
    expect(isCorrectGuess("Strau Hats", { firstName: "", lastName: "", aliases: ["Straw Hatss"] })).toBe(false);
  });

  it("accepts the full name in either order", () => {
    expect(isCorrectGuess("Luffy Monkey D.", luffy)).toBe(true);
    expect(isCorrectGuess("Monkey D. Luffy", luffy)).toBe(true);
  });

  it("ignores punctuation", () => {
    expect(isCorrectGuess("Monkey D", luffy)).toBe(true);
    expect(isCorrectGuess("jean pierre", { firstName: "Jean-Pierre", lastName: "", aliases: [] })).toBe(true);
    expect(isCorrectGuess("...", { firstName: "...", lastName: "", aliases: [] })).toBe(false);
  });

  it("ignores empty names", () => {
    expect(isCorrectGuess("a", { firstName: "", lastName: "", aliases: [] })).toBe(false);
  });
});
