import { describe, expect, it } from "vitest";
import { drawCharacter, type AnimeSource, type Character } from "@/game/draw";

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
  it("draws from the Top 100", async () => {
    const source = fakeSource({ 1: [character(10)] });
    await drawCharacter(source);
    expect(source.requestedLimits).toEqual([100]);
  });

  it("draws a main character of a randomly drawn anime", async () => {
    const source = fakeSource({
      1: [character(10)],
      2: [character(20, { role: "supporting" }), character(21), character(22)],
    });
    const drawn = await drawCharacter(source, sequence(0.99, 0.99));
    expect(drawn.anime).toEqual({ id: 2, title: "Anime 2" });
    expect(drawn.character.id).toBe(22);
  });

  it("skips characters without a picture", async () => {
    const source = fakeSource({ 1: [character(10, { picture: undefined }), character(11)] });
    const drawn = await drawCharacter(source, sequence(0, 0));
    expect(drawn.character.id).toBe(11);
  });

  it("draws another anime when one has no eligible character", async () => {
    const source = fakeSource({
      1: [character(10, { role: "supporting" })],
      2: [character(20)],
    });
    const drawn = await drawCharacter(source, sequence(0, 0, 0));
    expect(drawn.character.id).toBe(20);
  });

  it("draws another anime when the characters of one cannot be fetched", async () => {
    const source = fakeSource({ 1: [character(10)], 2: [character(20)] });
    const characters = source.characters;
    source.characters = async (animeId) => {
      if (animeId === 1) throw new Error("MAL is down");
      return characters(animeId);
    };
    const drawn = await drawCharacter(source, sequence(0, 0, 0));
    expect(drawn.character.id).toBe(20);
  });

  it("leaves the Top 100 of the source untouched", async () => {
    const top = [{ id: 1, title: "Anime 1" }, { id: 2, title: "Anime 2" }];
    const source: AnimeSource = {
      async topAnime() {
        return top;
      },
      async characters(animeId) {
        return animeId === 2 ? [character(20)] : [];
      },
    };
    await drawCharacter(source, sequence(0, 0, 0));
    expect(top).toHaveLength(2);
  });

  it("fails when no anime has an eligible character", async () => {
    const source = fakeSource({ 1: [], 2: [character(20, { role: "supporting" })] });
    await expect(drawCharacter(source)).rejects.toThrow();
  });
});
