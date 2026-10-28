// @vitest-environment node
import { beforeEach, describe, expect, it } from "vitest";
import { memoryDatabase } from "@/db/client";
import { playerDailyStore, type PlayerDailyStore } from "@/db/player-dailies";
import { playerStore } from "@/db/players";

describe("playerDailyStore", () => {
  let store: PlayerDailyStore;

  beforeEach(async () => {
    const database = await memoryDatabase();
    await playerStore(database).signIn({ malId: 42, name: "luffyfan" });
    await playerStore(database).signIn({ malId: 7, name: "zorofan" });
    store = playerDailyStore(database);
  });

  it("finds the Daily scores of a Player by date", async () => {
    await store.record(42, "2026-10-18", 5);
    await store.record(42, "2026-10-19", 0);
    await store.record(7, "2026-10-18", 3);
    expect(await store.scores(42)).toEqual({ "2026-10-18": 5, "2026-10-19": 0 });
  });

  it("keeps the first Daily score of a day", async () => {
    await store.record(42, "2026-10-18", 5);
    await store.record(42, "2026-10-18", 7);
    expect(await store.scores(42)).toEqual({ "2026-10-18": 5 });
  });

  it("merges the Guest stats without replacing the Dailies played signed in", async () => {
    await store.record(42, "2026-10-18", 5);
    await store.merge(42, { "2026-10-18": 1, "2026-10-17": 6 });
    expect(await store.scores(42)).toEqual({ "2026-10-18": 5, "2026-10-17": 6 });
  });

  it("replaces a merged Daily by the same Daily played signed in", async () => {
    await store.merge(42, { "2026-10-18": 2 });
    await store.record(42, "2026-10-18", 6);
    expect(await store.leaderboardScores(42)).toEqual({ "2026-10-18": 6 });
  });

  it("marks the merged Dailies as excluded from the Leaderboard", async () => {
    await store.record(42, "2026-10-18", 5);
    await store.merge(42, { "2026-10-17": 6 });
    await store.merge(42, { "2026-10-17": 2 });
    expect(await store.leaderboardScores(42)).toEqual({ "2026-10-18": 5 });
    expect(await store.scores(42)).toEqual({ "2026-10-18": 5, "2026-10-17": 6 });
  });

  it("lists the Players of the Leaderboard without their merged Dailies", async () => {
    await store.record(42, "2026-10-18", 5);
    await store.merge(42, { "2026-10-17": 6 });
    await store.record(7, "2026-10-18", 3);
    await store.merge(7, { "2026-10-16": 2 });
    const players = await store.leaderboardPlayers();
    expect(players).toHaveLength(2);
    expect(players).toEqual(
      expect.arrayContaining([
        { name: "luffyfan", scores: { "2026-10-18": 5 } },
        { name: "zorofan", scores: { "2026-10-18": 3 } },
      ]),
    );
  });

  it("leaves out of the Leaderboard a Player with only merged Dailies", async () => {
    await store.merge(42, { "2026-10-17": 6 });
    expect(await store.leaderboardPlayers()).toEqual([]);
  });

  it("merges nothing from empty Guest stats", async () => {
    await store.merge(42, {});
    expect(await store.scores(42)).toEqual({});
  });
});
