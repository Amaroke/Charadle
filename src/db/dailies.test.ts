// @vitest-environment node
import { beforeEach, describe, expect, it } from "vitest";
import { DailyPending, dailyStore, ensureDaily, type DailyStore } from "@/db/dailies";
import { memoryDatabase } from "@/db/client";
import type { DrawnCharacter } from "@/game/draw";

function tier(id: number): DrawnCharacter {
  return {
    anime: { id, title: `Anime ${id}` },
    character: { id: id * 10, firstName: `First${id}`, lastName: "", aliases: [], picture: `https://cdn.example/${id}.jpg`, role: "main" },
  };
}

const tiers = [1, 2, 3, 4, 5, 6, 7].map(tier);
const now = new Date("2026-10-18T12:00:00Z");

function minutesLater(minutes: number): Date {
  return new Date(now.getTime() + minutes * 60 * 1000);
}

describe("dailyStore", () => {
  let store: DailyStore;

  beforeEach(async () => {
    store = dailyStore(await memoryDatabase());
  });

  it("finds no Daily for a day that was not drawn", async () => {
    expect(await store.find("2026-10-18")).toBeUndefined();
  });

  it("finds the Tiers saved for a day", async () => {
    await store.save("2026-10-18", tiers);
    expect(await store.find("2026-10-18")).toEqual(tiers);
    expect(await store.find("2026-10-19")).toBeUndefined();
  });

  it("keeps the first Daily saved for a day", async () => {
    await store.save("2026-10-18", tiers);
    await store.save("2026-10-18", [8, 9, 10, 11, 12, 13, 14].map(tier));
    expect(await store.find("2026-10-18")).toEqual(tiers);
  });
});

describe("ensureDaily", () => {
  it("draws the Daily of a day only once", async () => {
    const store = dailyStore(await memoryDatabase());
    let draws = 0;
    const draw = async () => {
      draws++;
      return tiers;
    };
    expect(await ensureDaily(store, "2026-10-18", draw, { now })).toEqual(tiers);
    expect(await ensureDaily(store, "2026-10-18", draw, { now })).toEqual(tiers);
    expect(draws).toBe(1);
  });

  it("keeps the Daily saved first when two forced draws race", async () => {
    const store = dailyStore(await memoryDatabase());
    const other = [8, 9, 10, 11, 12, 13, 14].map(tier);
    const [first, second] = await Promise.all([
      ensureDaily(store, "2026-10-18", async () => tiers, { now, force: true }),
      ensureDaily(store, "2026-10-18", async () => other, { now, force: true }),
    ]);
    expect(second).toEqual(first);
  });

  it("runs a single draw at a time on demand, the others waiting for it", async () => {
    const store = dailyStore(await memoryDatabase());
    let draws = 0;
    const draw = async () => {
      draws++;
      await new Promise((resolve) => setTimeout(resolve, 300));
      return tiers;
    };
    const results = await Promise.all([
      ensureDaily(store, "2026-10-18", draw, { now }),
      ensureDaily(store, "2026-10-18", draw, { now }),
    ]);
    expect(draws).toBe(1);
    expect(results).toEqual([tiers, tiers]);
  });

  it("is pending when the draw running elsewhere takes too long", async () => {
    const store = dailyStore(await memoryDatabase());
    void ensureDaily(store, "2026-10-18", () => new Promise<DrawnCharacter[]>(() => {}), { now });
    await new Promise((resolve) => setTimeout(resolve, 100));
    await expect(ensureDaily(store, "2026-10-18", async () => tiers, { now, patience: 300 })).rejects.toBeInstanceOf(DailyPending);
  });

  it("is pending when the draw fails", async () => {
    const store = dailyStore(await memoryDatabase());
    const outage = new Error("MAL is down");
    const failure = ensureDaily(store, "2026-10-18", async () => {
      throw outage;
    }, { now });
    await expect(failure).rejects.toBeInstanceOf(DailyPending);
    await expect(failure).rejects.toHaveProperty("cause", outage);
  });

  it("does not draw again on demand shortly after a failed draw", async () => {
    const store = dailyStore(await memoryDatabase());
    let draws = 0;
    const failing = async (): Promise<DrawnCharacter[]> => {
      draws++;
      throw new Error("MAL is down");
    };
    await expect(ensureDaily(store, "2026-10-18", failing, { now })).rejects.toBeInstanceOf(DailyPending);
    const started = Date.now();
    await expect(ensureDaily(store, "2026-10-18", failing, { now: minutesLater(5) })).rejects.toBeInstanceOf(DailyPending);
    expect(Date.now() - started).toBeLessThan(1000);
    expect(draws).toBe(1);
  });

  it("draws on demand again once the delay after a failed draw is over", async () => {
    const store = dailyStore(await memoryDatabase());
    await expect(ensureDaily(store, "2026-10-18", async () => {
      throw new Error("MAL is down");
    }, { now })).rejects.toBeInstanceOf(DailyPending);
    expect(await ensureDaily(store, "2026-10-18", async () => tiers, { now: minutesLater(11) })).toEqual(tiers);
  });

  it("succeeds at the next scheduled attempt after a failed draw", async () => {
    const store = dailyStore(await memoryDatabase());
    await expect(ensureDaily(store, "2026-10-18", async () => {
      throw new Error("MAL is down");
    }, { now, force: true })).rejects.toHaveProperty("cause.message", "MAL is down");
    expect(await ensureDaily(store, "2026-10-18", async () => tiers, { now: minutesLater(60), force: true })).toEqual(tiers);
    expect(await store.find("2026-10-18")).toEqual(tiers);
  });

  it("does not draw a second Daily at a scheduled attempt once it exists", async () => {
    const store = dailyStore(await memoryDatabase());
    await ensureDaily(store, "2026-10-18", async () => tiers, { now, force: true });
    const other = [8, 9, 10, 11, 12, 13, 14].map(tier);
    expect(await ensureDaily(store, "2026-10-18", async () => other, { now: minutesLater(60), force: true })).toEqual(tiers);
  });
});
