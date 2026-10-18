import { describe, expect, it } from "vitest";
import { parseSettings, settingsParams } from "@/game/settings";

describe("parseSettings", () => {
  it("reads an Anime pool and a Difficulty", () => {
    expect(parseSettings(new URLSearchParams("pool=500&difficulty=expert"))).toEqual({ pool: 500, difficulty: "expert" });
  });

  it("rejects an Anime pool that is not a Tier", () => {
    expect(parseSettings(new URLSearchParams("pool=30&difficulty=normal"))).toBeUndefined();
  });

  it("rejects an unknown Difficulty", () => {
    expect(parseSettings(new URLSearchParams("pool=5&difficulty=hard"))).toBeUndefined();
  });

  it("rejects missing settings", () => {
    expect(parseSettings(new URLSearchParams(""))).toBeUndefined();
  });

  it("reads a MAL list with its watch statuses and minimum rating", () => {
    expect(parseSettings(new URLSearchParams("pool=mal&user=Luffy_Fan-1&status=completed,on_hold&score=7&difficulty=expert"))).toEqual({
      pool: { username: "Luffy_Fan-1", statuses: ["completed", "on_hold"], minScore: 7 },
      difficulty: "expert",
    });
  });

  it("rejects a MAL list without a valid username", () => {
    for (const user of ["", "a", "seventeen_letters", "luffy fan", "luffy/fan"]) {
      expect(parseSettings(new URLSearchParams(`pool=mal&user=${encodeURIComponent(user)}&status=completed&score=0&difficulty=normal`))).toBeUndefined();
    }
  });

  it("rejects a MAL list without a known watch status", () => {
    expect(parseSettings(new URLSearchParams("pool=mal&user=luffy&status=&score=0&difficulty=normal"))).toBeUndefined();
    expect(parseSettings(new URLSearchParams("pool=mal&user=luffy&status=completed,rewatching&score=0&difficulty=normal"))).toBeUndefined();
  });

  it("rejects a minimum rating outside 0 to 10", () => {
    for (const score of ["-1", "11", "7.5", ""]) {
      expect(parseSettings(new URLSearchParams(`pool=mal&user=luffy&status=completed&score=${score}&difficulty=normal`))).toBeUndefined();
    }
  });

  it("reads each watch status once", () => {
    const settings = parseSettings(new URLSearchParams("pool=mal&user=luffy&status=dropped,dropped&score=0&difficulty=normal"));
    expect(settings?.pool).toEqual({ username: "luffy", statuses: ["dropped"], minScore: 0 });
  });
});

describe("settingsParams", () => {
  it("writes settings that read back the same", () => {
    const params = settingsParams({ pool: 20, difficulty: "normal" });
    expect(params.toString()).toBe("pool=20&difficulty=normal");
    expect(parseSettings(params)).toEqual({ pool: 20, difficulty: "normal" });
  });

  it("writes a MAL list that reads back the same", () => {
    const settings = { pool: { username: "luffy", statuses: ["completed", "watching"], minScore: 8 }, difficulty: "normal" } as const;
    const params = settingsParams({ ...settings, pool: { ...settings.pool, statuses: [...settings.pool.statuses] } });
    expect(params.get("pool")).toBe("mal");
    expect(parseSettings(params)).toEqual(settings);
  });
});
