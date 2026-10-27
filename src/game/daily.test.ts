import { describe, expect, it } from "vitest";
import { afterGuess, afterHint, currentTier, dailyDate, dailyScore, dailyTiers, isOver, startDaily, type DailyProgress } from "@/game/daily";

function play(...guesses: boolean[]): DailyProgress {
  return guesses.reduce(afterGuess, startDaily());
}

describe("dailyTiers", () => {
  it("go from the hardest Top 500 down to the easiest Top 5", () => {
    expect(dailyTiers).toEqual([500, 200, 100, 50, 20, 10, 5]);
  });
});

describe("Daily progress", () => {
  it("starts at the hardest Tier with no Guess used", () => {
    expect(currentTier(startDaily())).toBe(500);
    expect(isOver(startDaily())).toBe(false);
  });

  it("keeps the Tier after one failed Guess", () => {
    expect(currentTier(play(false))).toBe(500);
    expect(play(false).misses).toBe(1);
  });

  it("goes down one Tier after two failed Guesses", () => {
    const progress = play(false, false);
    expect(currentTier(progress)).toBe(200);
    expect(progress.misses).toBe(0);
  });

  it("is over once the Character is found", () => {
    const progress = play(false, false, false, true);
    expect(isOver(progress)).toBe(true);
    expect(currentTier(progress)).toBe(200);
  });

  it("is over once every Tier is failed", () => {
    const progress = play(...Array<boolean>(14).fill(false));
    expect(isOver(progress)).toBe(true);
    expect(currentTier(progress)).toBeUndefined();
  });

  it("ignores Guesses once over", () => {
    expect(afterGuess(play(true), false)).toEqual(play(true));
  });
});

describe("Hints in the Daily", () => {
  it("starts with no Hint used", () => {
    expect(startDaily()).toMatchObject({ hintsUsed: 0, tierHints: [] });
  });

  it("counts a Hint once on the current Tier", () => {
    const progress = afterHint(afterHint(play(false), "anime"), "anime");
    expect(progress).toMatchObject({ misses: 1, hintsUsed: 1, tierHints: ["anime"] });
  });

  it("keeps the Hints used on previous Tiers in the count only", () => {
    const progress = afterGuess(afterGuess(afterHint(startDaily(), "initials"), false), false);
    expect(progress).toMatchObject({ tier: 1, hintsUsed: 1, tierHints: [] });
  });

  it("ignores Hints once over", () => {
    expect(afterHint(play(true), "anime")).toEqual(play(true));
  });
});

describe("dailyScore", () => {
  it("is 7 when found at Top 500", () => {
    expect(dailyScore(play(true))).toBe(7);
  });

  it("is 5 when found at Top 100 on the second Guess", () => {
    expect(dailyScore(play(false, false, false, false, false, true))).toBe(5);
  });

  it("is 1 when found at Top 5", () => {
    expect(dailyScore(play(...Array<boolean>(12).fill(false), true))).toBe(1);
  });

  it("is 0 when every Tier is failed", () => {
    expect(dailyScore(play(...Array<boolean>(14).fill(false)))).toBe(0);
  });

  it("loses 1 per Hint used", () => {
    const hinted = afterHint(afterHint(afterGuess(afterGuess(afterHint(startDaily(), "anime"), false), false), "anime"), "initials");
    expect(dailyScore(afterGuess(hinted, true))).toBe(3);
  });

  it("is never below 0", () => {
    const failed = play(...Array<boolean>(12).fill(false));
    expect(dailyScore(afterGuess(afterHint(afterHint(failed, "anime"), "initials"), true))).toBe(0);
  });
});

describe("dailyDate", () => {
  it("is the same day from 12:00 UTC", () => {
    expect(dailyDate(new Date("2026-10-18T12:00:00Z"))).toBe("2026-10-18");
    expect(dailyDate(new Date("2026-10-18T23:59:59Z"))).toBe("2026-10-18");
  });

  it("is still the previous day before 12:00 UTC", () => {
    expect(dailyDate(new Date("2026-10-18T11:59:59Z"))).toBe("2026-10-17");
    expect(dailyDate(new Date("2026-10-19T11:59:59+02:00"))).toBe("2026-10-18");
  });
});
