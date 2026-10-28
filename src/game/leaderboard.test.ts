import { describe, expect, it } from "vitest";
import { currentStreak, leaderboard } from "@/game/leaderboard";

const noon = (date: string) => new Date(`${date}T12:00:00Z`);

describe("currentStreak", () => {
  it("counts the consecutive Dailies won up to today", () => {
    expect(currentStreak({ "2026-10-16": 3, "2026-10-17": 1, "2026-10-18": 7 }, noon("2026-10-18"))).toBe(3);
  });

  it("keeps the Streak while today's Daily is not played yet", () => {
    expect(currentStreak({ "2026-10-16": 3, "2026-10-17": 1 }, noon("2026-10-18"))).toBe(2);
  });

  it("breaks on a missed day", () => {
    expect(currentStreak({ "2026-10-15": 3, "2026-10-17": 1, "2026-10-18": 2 }, noon("2026-10-18"))).toBe(2);
    expect(currentStreak({ "2026-10-15": 3, "2026-10-16": 4 }, noon("2026-10-18"))).toBe(0);
  });

  it("breaks on a Daily score of 0", () => {
    expect(currentStreak({ "2026-10-16": 3, "2026-10-17": 0, "2026-10-18": 2 }, noon("2026-10-18"))).toBe(1);
    expect(currentStreak({ "2026-10-17": 4, "2026-10-18": 0 }, noon("2026-10-18"))).toBe(0);
  });

  it("follows the Daily renewed at 12:00 UTC", () => {
    const scores = { "2026-10-16": 3, "2026-10-17": 5 };
    expect(currentStreak(scores, new Date("2026-10-18T11:59:59Z"))).toBe(2);
    expect(currentStreak(scores, new Date("2026-10-18T12:00:00Z"))).toBe(2);
    expect(currentStreak(scores, new Date("2026-10-19T11:59:59Z"))).toBe(2);
    expect(currentStreak(scores, new Date("2026-10-19T12:00:00Z"))).toBe(0);
  });

  it("crosses month and year boundaries", () => {
    expect(currentStreak({ "2026-12-31": 2, "2027-01-01": 3 }, noon("2027-01-01"))).toBe(2);
    expect(currentStreak({ "2026-02-28": 2, "2026-03-01": 3 }, noon("2026-03-01"))).toBe(2);
  });

  it("is 0 without any Daily", () => {
    expect(currentStreak({}, noon("2026-10-18"))).toBe(0);
  });
});

describe("leaderboard", () => {
  const week = (score: number, last = "2026-10-18") =>
    Object.fromEntries(
      Array.from({ length: 7 }, (_, day) => [
        new Date(Date.parse(`${last}T00:00:00Z`) - day * 86_400_000).toISOString().slice(0, 10),
        score,
      ]),
    );

  it("ranks the Players on today's Daily score", () => {
    const board = leaderboard(
      [
        { name: "zorofan", scores: { "2026-10-18": 3 } },
        { name: "luffyfan", scores: { "2026-10-18": 6 } },
        { name: "namifan", scores: { "2026-10-17": 7 } },
        { name: "sanjifan", scores: { "2026-10-18": 0 } },
      ],
      noon("2026-10-18"),
    );
    expect(board.today).toEqual([
      { name: "luffyfan", value: 6 },
      { name: "zorofan", value: 3 },
      { name: "sanjifan", value: 0 },
    ]);
  });

  it("ranks on the average Daily score only the Players with seven Dailies or more", () => {
    const board = leaderboard(
      [
        { name: "zorofan", scores: week(4) },
        { name: "luffyfan", scores: { ...week(6), "2026-10-01": 1 } },
        { name: "namifan", scores: { "2026-10-12": 7, "2026-10-13": 7, "2026-10-14": 7 } },
      ],
      noon("2026-10-18"),
    );
    expect(board.average).toEqual([
      { name: "luffyfan", value: 5.4 },
      { name: "zorofan", value: 4 },
    ]);
  });

  it("ranks the Players on their current Streak", () => {
    const board = leaderboard(
      [
        { name: "zorofan", scores: { "2026-10-17": 2 } },
        { name: "luffyfan", scores: week(5) },
        { name: "namifan", scores: { "2026-10-10": 7 } },
      ],
      noon("2026-10-18"),
    );
    expect(board.streak).toEqual([
      { name: "luffyfan", value: 7 },
      { name: "zorofan", value: 1 },
    ]);
  });

  it("ranks on the exact average before rounding it", () => {
    const board = leaderboard(
      [
        { name: "a", scores: { ...week(5), "2026-10-01": 7, "2026-10-02": 7, "2026-10-03": 7, "2026-10-04": 3 } },
        { name: "b", scores: { ...week(5), "2026-10-01": 7, "2026-10-02": 7 } },
      ],
      noon("2026-10-18"),
    );
    expect(board.average).toEqual([
      { name: "b", value: 5.4 },
      { name: "a", value: 5.4 },
    ]);
  });

  it("breaks ties by name and keeps the top of each ranking", () => {
    const players = ["d", "b", "c", "a"].map((name) => ({ name, scores: { "2026-10-18": 5 } }));
    expect(leaderboard(players, noon("2026-10-18"), 3).today.map(({ name }) => name)).toEqual(["a", "b", "c"]);
  });
});
