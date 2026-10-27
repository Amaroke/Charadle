import { describe, expect, it } from "vitest";
import { afterGuess, afterHint, startDaily, type DailyProgress } from "@/game/daily";
import { dailyView } from "@/game/daily-view";
import type { Anime, DrawnCharacter } from "@/game/draw";

const names = ["Luffy", "Naruto", "Edward", "Light", "Eren", "Goku", "Tanjiro"];

const tiers: DrawnCharacter[] = names.map((name, index) => ({
  anime: { id: index, title: `${name} Anime` },
  character: { id: index * 10, firstName: name, lastName: "", aliases: [], picture: `https://cdn.example/${index}.jpg`, role: "main" },
}));

const title = async (anime: Anime) => anime.title;

function play(...guesses: boolean[]): DailyProgress {
  return guesses.reduce(afterGuess, startDaily());
}

describe("dailyView", () => {
  it("shows only the picture of the current Tier", async () => {
    const view = await dailyView(tiers, play(false, false, false), title);
    expect(view).toEqual({ status: "playing", tier: 200, picture: "https://cdn.example/1.jpg", guessesLeft: 1, hints: {}, revealed: [
      { tier: 500, found: false, character: "Luffy", anime: "Luffy Anime" },
    ] });
  });

  it("holds no answer of the current or later Tiers", async () => {
    const view = JSON.stringify(await dailyView(tiers, play(false, false), title));
    for (const name of names.slice(1)) expect(view).not.toContain(name);
  });

  it("reveals the Character found and the Daily score once over", async () => {
    const view = await dailyView(tiers, play(false, false, true), title);
    expect(view).toEqual({ status: "over", score: 6, hintsUsed: 0, revealed: [
      { tier: 500, found: false, character: "Luffy", anime: "Luffy Anime" },
      { tier: 200, found: true, character: "Naruto", anime: "Naruto Anime" },
    ] });
  });

  it("shows only the Hints used on the current Tier", async () => {
    const progress = afterHint(afterGuess(afterGuess(afterHint(startDaily(), "initials"), false), false), "anime");
    const view = await dailyView(tiers, progress, title);
    expect(view.status === "playing" && view.hints).toEqual({ anime: "Naruto Anime" });
    expect(JSON.stringify(await dailyView(tiers, afterHint(progress, "initials"), title))).toContain('"initials":"N."');
  });

  it("holds no Hint before it is used", async () => {
    const view = JSON.stringify(await dailyView(tiers, afterGuess(afterGuess(afterHint(startDaily(), "anime"), false), false), title));
    expect(view).not.toContain("Naruto");
    expect(view).not.toContain("N.");
  });

  it("tells the Hints used once over", async () => {
    const view = await dailyView(tiers, afterGuess(afterHint(startDaily(), "anime"), true), title);
    expect(view).toMatchObject({ status: "over", score: 6, hintsUsed: 1 });
  });

  it("reveals every Character when every Tier is failed", async () => {
    const view = await dailyView(tiers, play(...Array<boolean>(14).fill(false)), title);
    expect(view.status === "over" && view.score).toBe(0);
    expect(view.revealed.map(({ character }) => character)).toEqual(names);
  });
});
