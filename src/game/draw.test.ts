import { describe, expect, it } from "vitest";
import { drawCharacter, type AnimeSource, type Character } from "@/game/draw";
import type { Settings } from "@/game/settings";

function character(id: number, overrides: Partial<Character> = {}): Character {
  return {
    id,
    firstName: `First${id}`,
    lastName: `Last${id}`,
    aliases: [],
    picture: `https://cdn.example/${id}.jpg`,
    role: "main",
    ...overrides,
  };
}

function fakeSource(catalog: Record<number, Character[]>): AnimeSource & { requestedLimits: number[] } {
  const requestedLimits: number[] = [];
  return {
    requestedLimits,
    async topAnime(limit) {
      requestedLimits.push(limit);
      return Object.keys(catalog).map((id) => ({ id: Number(id), title: `Anime ${id}` }));
    },
    async characters(animeId) {
      return catalog[animeId] ?? [];
    },
  };
}

function sequence(...values: number[]): () => number {
  return () => values.shift() ?? 0;
}

describe("drawCharacter", () => {
  const normal: Settings = { pool: 100, difficulty: "normal" };

  it("draws from the Top N of the Anime pool", async () => {
    const source = fakeSource({ 1: [character(10)] });
    await drawCharacter(source, { pool: 500, difficulty: "normal" });
    expect(source.requestedLimits).toEqual([500]);
  });

  it("draws a main character of a randomly drawn anime", async () => {
    const source = fakeSource({
      1: [character(10)],
      2: [character(20, { role: "supporting" }), character(21), character(22)],
    });
    const drawn = await drawCharacter(source, normal, sequence(0.99, 0.99));
    expect(drawn.anime).toEqual({ id: 2, title: "Anime 2" });
    expect(drawn.character.id).toBe(22);
  });

  it("draws any character of the anime in Expert", async () => {
    const source = fakeSource({ 1: [character(10), character(11, { role: "supporting" })] });
    const drawn = await drawCharacter(source, { pool: 100, difficulty: "expert" }, sequence(0, 0.99));
    expect(drawn.character.id).toBe(11);
  });

  it("draws a supporting character in Expert when the anime has no main one", async () => {
    const source = fakeSource({ 1: [character(10, { role: "supporting" })] });
    const drawn = await drawCharacter(source, { pool: 100, difficulty: "expert" }, sequence(0, 0));
    expect(drawn.character.id).toBe(10);
  });

  it("skips characters without a picture", async () => {
    const source = fakeSource({ 1: [character(10, { picture: undefined }), character(11)] });
    const drawn = await drawCharacter(source, normal, sequence(0, 0));
    expect(drawn.character.id).toBe(11);
  });

  it("draws another anime when one has no eligible character", async () => {
    const source = fakeSource({
      1: [character(10, { role: "supporting" })],
      2: [character(20)],
    });
    const drawn = await drawCharacter(source, normal, sequence(0, 0, 0));
    expect(drawn.character.id).toBe(20);
  });

  it("draws another anime when the characters of one cannot be fetched", async () => {
    const source = fakeSource({ 1: [character(10)], 2: [character(20)] });
    const characters = source.characters;
    source.characters = async (animeId) => {
      if (animeId === 1) throw new Error("MAL is down");
      return characters(animeId);
    };
    const drawn = await drawCharacter(source, normal, sequence(0, 0, 0));
    expect(drawn.character.id).toBe(20);
  });

  it("leaves the Top N of the source untouched", async () => {
    const top = [{ id: 1, title: "Anime 1" }, { id: 2, title: "Anime 2" }];
    const source: AnimeSource = {
      async topAnime() {
        return top;
      },
      async characters(animeId) {
        return animeId === 2 ? [character(20)] : [];
      },
    };
    await drawCharacter(source, normal, sequence(0, 0, 0));
    expect(top).toHaveLength(2);
  });

  it("fails when no anime has an eligible character", async () => {
    const source = fakeSource({ 1: [], 2: [character(20, { role: "supporting" })] });
    await expect(drawCharacter(source, normal)).rejects.toThrow();
  });
});
