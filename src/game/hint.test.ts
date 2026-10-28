import { describe, expect, it } from "vitest";
import { initials } from "@/game/hint";

describe("initials", () => {
  it("keeps only the first letter of each word of the name", () => {
    expect(initials("Luffy Monkey D.")).toBe("L. M. D.");
  });

  it("works with a single name", () => {
    expect(initials("Nami")).toBe("N.");
  });

  it("uppercases and keeps accented letters", () => {
    expect(initials("élise  von brandt")).toBe("É. V. B.");
  });

  it("splits hyphenated names", () => {
    expect(initials("Jean-Pierre Polnareff")).toBe("J. P. P.");
  });

  it("skips words without a letter", () => {
    expect(initials("Zero Two (002)")).toBe("Z. T.");
  });
});
