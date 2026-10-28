import { describe, expect, it } from "vitest";
import { distribution, parseGuestStats, summarize, withDaily } from "@/game/guest-stats";

describe("parseGuestStats", () => {
  it("reads the Daily scores saved by date", () => {
    expect(parseGuestStats('{"2026-10-18":5,"2026-10-19":0}')).toEqual({ "2026-10-18": 5, "2026-10-19": 0 });
  });

  it("starts empty from nothing or anything unreadable", () => {
    expect(parseGuestStats(null)).toEqual({});
    expect(parseGuestStats("not json")).toEqual({});
    expect(parseGuestStats("[1,2]")).toEqual({});
  });

  it("drops the entries that are not a Daily score", () => {
    expect(parseGuestStats('{"2026-10-18":5,"2026-10-19":"7","yesterday":3,"2026-10-20":9}')).toEqual({ "2026-10-18": 5 });
  });
});

describe("withDaily", () => {
  it("adds the Daily score of a day", () => {
    expect(withDaily({ "2026-10-18": 5 }, "2026-10-19", 0)).toEqual({ "2026-10-18": 5, "2026-10-19": 0 });
  });

  it("keeps the first Daily score of a day", () => {
    const stats = { "2026-10-18": 5 };
    expect(withDaily(stats, "2026-10-18", 7)).toBe(stats);
  });
});

describe("summarize", () => {
  it("counts the Dailies played and won and averages their scores", () => {
    expect(summarize({ "2026-10-18": 5, "2026-10-19": 0, "2026-10-20": 7 })).toEqual({ played: 3, won: 2, average: 4 });
  });

  it("averages to 0 before any Daily", () => {
    expect(summarize({})).toEqual({ played: 0, won: 0, average: 0 });
  });
});

describe("distribution", () => {
  it("counts the Dailies played for each Daily score", () => {
    expect(distribution({ "2026-10-18": 5, "2026-10-19": 0, "2026-10-20": 5 })).toEqual([1, 0, 0, 0, 0, 2, 0, 0]);
  });
});

describe("parseGuestStats dates", () => {
  it("drops the dates that do not exist", () => {
    expect(parseGuestStats('{"2026-10-18":5,"2026-13-45":3,"2026-02-30":2}')).toEqual({ "2026-10-18": 5 });
  });
});
