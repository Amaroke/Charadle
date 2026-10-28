import { describe, expect, it } from "vitest";
import { dailyNumber, shareText } from "@/game/share";

const missed = (tier: 500 | 200) => ({ tier, found: false, character: "Luffy", anime: "One Piece" });

describe("dailyNumber", () => {
  it("numbers the Dailies from the first one", () => {
    expect(dailyNumber("2026-10-18")).toBe(1);
    expect(dailyNumber("2026-11-28")).toBe(42);
  });
});

describe("shareText", () => {
  it("shows the ended Tiers and the Daily score", () => {
    const text = shareText("2026-11-28", {
      status: "over",
      score: 5,
      hintsUsed: 0,
      revealed: [missed(500), missed(200), { tier: 100, found: true, character: "Naruto Uzumaki", anime: "Naruto" }],
    });
    expect(text).toBe("Charadle #42 🟥🟥🟩 5/7");
  });

  it("tells the Hints used", () => {
    const text = shareText("2026-10-18", {
      status: "over",
      score: 5,
      hintsUsed: 2,
      revealed: [{ tier: 500, found: true, character: "Luffy", anime: "One Piece" }],
    });
    expect(text).toBe("Charadle #1 🟩 💡2 5/7");
  });

  it("reveals neither Character nor Anime", () => {
    const text = shareText("2026-10-18", { status: "over", score: 0, hintsUsed: 0, revealed: [missed(500)] });
    expect(text).not.toMatch(/Luffy|One Piece/);
  });
});
