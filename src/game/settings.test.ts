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
});

describe("settingsParams", () => {
  it("writes settings that read back the same", () => {
    const params = settingsParams({ pool: 20, difficulty: "normal" });
    expect(params.toString()).toBe("pool=20&difficulty=normal");
    expect(parseSettings(params)).toEqual({ pool: 20, difficulty: "normal" });
  });
});
