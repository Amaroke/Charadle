// @vitest-environment node
import { beforeEach, describe, expect, it } from "vitest";
import { dailyStore, ensureDaily, type DailyStore } from "@/db/dailies";
import { memoryDatabase } from "@/db/client";
import type { DrawnCharacter } from "@/game/draw";

function tier(id: number): DrawnCharacter {
  return {
    anime: { id, title: `Anime ${id}` },
    character: { id: id * 10, firstName: `First${id}`, lastName: "", aliases: [], picture: `https://cdn.example/${id}.jpg`, role: "main" },
  };
}

const tiers = [1, 2, 3, 4, 5, 6, 7].map(tier);

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
    expect(await ensureDaily(store, "2026-10-18", draw)).toEqual(tiers);
    expect(await ensureDaily(store, "2026-10-18", draw)).toEqual(tiers);
    expect(draws).toBe(1);
  });

  it("keeps the Daily saved first when two draws race", async () => {
    const store = dailyStore(await memoryDatabase());
    const other = [8, 9, 10, 11, 12, 13, 14].map(tier);
    const [first, second] = await Promise.all([
      ensureDaily(store, "2026-10-18", async () => tiers),
      ensureDaily(store, "2026-10-18", async () => other),
    ]);
    expect(second).toEqual(first);
  });
});
