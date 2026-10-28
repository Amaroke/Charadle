// @vitest-environment node
import { beforeEach, describe, expect, it } from "vitest";
import { memoryDatabase } from "@/db/client";
import { progressStore, recordGuess, recordHint, type ProgressStore } from "@/db/progress";
import { startDaily, type DailyProgress } from "@/game/daily";

const guest = "guest-1";
const date = "2026-10-18";

function at(progress: Partial<DailyProgress>): DailyProgress {
  return { ...startDaily(), ...progress };
}

describe("progressStore", () => {
  let store: ProgressStore;

  beforeEach(async () => {
    store = progressStore(await memoryDatabase());
  });

  it("starts the Daily of a Guest who never guessed", async () => {
    expect(await store.find(guest, date)).toEqual(startDaily());
  });

  it("finds the progress saved for a Guest and a day", async () => {
    expect(await store.advance(guest, date, startDaily(), at({ tier: 0, misses: 1, found: false }))).toBe(true);
    expect(await store.find(guest, date)).toEqual(at({ tier: 0, misses: 1, found: false }));
    expect(await store.find("guest-2", date)).toEqual(startDaily());
  });

  it("ignores the progress of a previous Daily", async () => {
    await store.advance(guest, date, startDaily(), at({ tier: 3, misses: 0, found: true }));
    expect(await store.find(guest, "2026-10-19")).toEqual(startDaily());
  });

  it("refuses to advance from a progress that is no longer the saved one", async () => {
    await store.advance(guest, date, startDaily(), at({ tier: 0, misses: 1, found: false }));
    expect(await store.advance(guest, date, startDaily(), at({ tier: 0, misses: 1, found: false }))).toBe(false);
    expect(await store.find(guest, date)).toEqual(at({ tier: 0, misses: 1, found: false }));
  });

  it("forgets the progress of the days before a Daily", async () => {
    await store.advance(guest, "2026-10-17", startDaily(), at({ tier: 0, misses: 1, found: false }));
    await store.advance(guest, date, startDaily(), at({ tier: 1, misses: 0, found: false }));
    await store.forgetBefore(date);
    expect(await store.find(guest, date)).toEqual(at({ tier: 1, misses: 0, found: false }));
    expect(await store.advance(guest, "2026-10-17", startDaily(), at({ tier: 0, misses: 1, found: false }))).toBe(true);
  });
});

describe("recordHint", () => {
  let store: ProgressStore;

  beforeEach(async () => {
    store = progressStore(await memoryDatabase());
  });

  it("saves the Hints used on the current Tier", async () => {
    await recordHint(store, guest, date, "anime");
    expect(await recordHint(store, guest, date, "initials")).toEqual(at({ hintsUsed: 2, tierHints: ["anime", "initials"] }));
    expect(await store.find(guest, date)).toEqual(at({ hintsUsed: 2, tierHints: ["anime", "initials"] }));
  });

  it("keeps the Hints count when the Tier changes", async () => {
    await recordHint(store, guest, date, "initials");
    await recordGuess(store, guest, date, () => false);
    await recordGuess(store, guest, date, () => false);
    expect(await store.find(guest, date)).toEqual(at({ tier: 1, hintsUsed: 1 }));
  });

  it("never counts the same Hint twice when it is asked in parallel", async () => {
    await Promise.all([1, 2, 3].map(() => recordHint(store, guest, date, "anime")));
    expect(await store.find(guest, date)).toEqual(at({ hintsUsed: 1, tierHints: ["anime"] }));
  });
});

describe("recordGuess", () => {
  let store: ProgressStore;

  beforeEach(async () => {
    store = progressStore(await memoryDatabase());
  });

  it("counts a failed Guess on the current Tier", async () => {
    expect(await recordGuess(store, guest, date, () => false)).toEqual({
      correct: false,
      progress: at({ tier: 0, misses: 1, found: false }),
    });
  });

  it("judges the Guess against the saved Tier", async () => {
    await store.advance(guest, date, startDaily(), at({ tier: 2, misses: 0, found: false }));
    expect(await recordGuess(store, guest, date, (progress) => progress.tier === 2)).toEqual({
      correct: true,
      progress: at({ tier: 2, misses: 0, found: true }),
    });
  });

  it("never counts more than two Guesses on a Tier when they are sent in parallel", async () => {
    const results = await Promise.all([1, 2, 3, 4, 5].map((n) => recordGuess(store, guest, date, () => n === 5)));
    const progress = await store.find(guest, date);
    expect(progress.tier * 2 + progress.misses + Number(progress.found)).toBeLessThanOrEqual(2);
    expect(results.map((result) => result.progress)).toEqual(results.map(() => progress));
    expect(results.filter((result) => result.correct).length).toBe(Number(progress.found));
  });

  it("counts a Guess only once when a correct and a failed Guess race", async () => {
    const [found, missed] = await Promise.all([
      recordGuess(store, guest, date, () => true),
      recordGuess(store, guest, date, () => false),
    ]);
    const progress = await store.find(guest, date);
    expect(progress).toEqual(found.correct ? at({ tier: 0, misses: 0, found: true }) : at({ tier: 0, misses: 1, found: false }));
    expect(missed.progress).toEqual(progress);
  });

  it("does not count a Guess once the Daily is over", async () => {
    await store.advance(guest, date, startDaily(), at({ tier: 0, misses: 0, found: true }));
    expect(await recordGuess(store, guest, date, () => false)).toEqual({
      correct: false,
      progress: at({ tier: 0, misses: 0, found: true }),
    });
  });
});
