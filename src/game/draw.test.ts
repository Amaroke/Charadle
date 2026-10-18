import { describe, expect, it } from "vitest";
import { drawCharacter, drawChoices, PoolError, type AnimeSource, type Character, type DrawnCharacter, type ListedAnime } from "@/game/draw";
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

function fakeSource(
  catalog: Record<number, Character[]>,
  list: ListedAnime[] = [],
): AnimeSource & { requestedLimits: number[]; requestedUsers: string[] } {
  const requestedLimits: number[] = [];
  const requestedUsers: string[] = [];
  return {
    requestedLimits,
    requestedUsers,
    async malList(username) {
      requestedUsers.push(username);
      return list;
    },
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
      async malList() {
        return [];
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

describe("drawCharacter from a MAL list", () => {
  function listed(id: number, status: ListedAnime["status"], score: number): ListedAnime {
    return { id, title: `Anime ${id}`, status, score };
  }

  const catalog = { 1: [character(10)], 2: [character(20)], 3: [character(30)], 4: [character(40, { role: "supporting" })] };
  const list = [listed(1, "completed", 9), listed(2, "watching", 6), listed(3, "completed", 0), listed(4, "dropped", 3)];

  it("draws from the MAL list of the username", async () => {
    const source = fakeSource(catalog, list);
    await drawCharacter(source, { pool: { username: "luffy", statuses: ["completed"], minScore: 0 }, difficulty: "normal" });
    expect(source.requestedUsers).toEqual(["luffy"]);
    expect(source.requestedLimits).toEqual([]);
  });

  it("draws only anime with a chosen watch status", async () => {
    const source = fakeSource(catalog, list);
    const drawn = await drawCharacter(
      source,
      { pool: { username: "luffy", statuses: ["watching"], minScore: 0 }, difficulty: "normal" },
      sequence(0.99, 0),
    );
    expect(drawn.anime).toEqual({ id: 2, title: "Anime 2" });
  });

  it("draws only anime rated at least the minimum rating", async () => {
    const source = fakeSource(catalog, list);
    const drawn = await drawCharacter(
      source,
      { pool: { username: "luffy", statuses: ["completed", "watching"], minScore: 7 }, difficulty: "normal" },
      sequence(0.99, 0),
    );
    expect(drawn.anime.id).toBe(1);
  });

  it("keeps unrated anime when there is no minimum rating", async () => {
    const source = fakeSource(catalog, list);
    const drawn = await drawCharacter(
      source,
      { pool: { username: "luffy", statuses: ["completed"], minScore: 0 }, difficulty: "normal" },
      sequence(0.99, 0),
    );
    expect(drawn.anime.id).toBe(3);
  });

  it("applies the Difficulty to the MAL list", async () => {
    const pool = { username: "luffy", statuses: ["dropped" as const], minScore: 0 };
    await expect(drawCharacter(fakeSource(catalog, list), { pool, difficulty: "normal" })).rejects.toThrow();
    const drawn = await drawCharacter(fakeSource(catalog, list), { pool, difficulty: "expert" }, sequence(0, 0));
    expect(drawn.character.id).toBe(40);
  });

  it("fails with an empty pool when no anime of the MAL list has an eligible character", async () => {
    const source = fakeSource(catalog, list);
    const drawing = drawCharacter(source, { pool: { username: "luffy", statuses: ["dropped"], minScore: 0 }, difficulty: "normal" });
    await expect(drawing).rejects.toEqual(new PoolError("empty-pool"));
  });

  it("fails with an empty pool when the filters leave no anime", async () => {
    const source = fakeSource(catalog, list);
    const drawing = drawCharacter(source, { pool: { username: "luffy", statuses: ["completed"], minScore: 10 }, difficulty: "normal" });
    await expect(drawing).rejects.toEqual(new PoolError("empty-pool"));
  });
});

describe("drawChoices", () => {
  const normal: Settings = { pool: 100, difficulty: "normal" };

  function drawnFrom(animeId: number, drawnCharacter: Character): DrawnCharacter {
    return { anime: { id: animeId, title: `Anime ${animeId}` }, character: { ...drawnCharacter, picture: "https://cdn.example/x.jpg" } };
  }

  it("offers four Characters of the same Anime including the drawn one", async () => {
    const characters = [character(10), character(11), character(12), character(13), character(14)];
    const source = fakeSource({ 1: characters, 2: [character(20)] });
    const choices = await drawChoices(source, normal, drawnFrom(1, characters[0]));
    expect(choices).toHaveLength(4);
    expect(choices).toContain("First10 Last10");
    expect(choices.every((name) => /^First1\d Last1\d$/.test(name))).toBe(true);
    expect(new Set(choices).size).toBe(4);
  });

  it("prefers main characters of the same Anime in Normal", async () => {
    const characters = [
      character(10),
      character(11, { role: "supporting" }),
      character(12),
      character(13),
      character(14),
    ];
    const source = fakeSource({ 1: characters });
    const choices = await drawChoices(source, normal, drawnFrom(1, characters[0]));
    expect(choices).not.toContain("First11 Last11");
  });

  it("completes with other characters of the same Anime before other Anime", async () => {
    const characters = [character(10), character(11, { role: "supporting" }), character(12, { picture: undefined })];
    const source = fakeSource({ 1: characters, 2: [character(20), character(21)] });
    const choices = await drawChoices(source, normal, drawnFrom(1, characters[0]), sequence(0));
    expect(choices).toHaveLength(4);
    expect(choices).toEqual(expect.arrayContaining(["First10 Last10", "First11 Last11", "First12 Last12"]));
    expect(choices.filter((name) => name.startsWith("First2"))).toHaveLength(1);
  });

  it("completes with Characters of other Anime of the pool", async () => {
    const characters = [character(10)];
    const source = fakeSource({ 1: characters, 2: [character(20)], 3: [character(30), character(31)] });
    const choices = await drawChoices(source, normal, drawnFrom(1, characters[0]));
    expect(choices).toHaveLength(4);
    expect(choices).toContain("First10 Last10");
  });

  it("completes from the MAL list when the pool is a MAL list", async () => {
    const characters = [character(10)];
    const list: ListedAnime[] = [
      { id: 1, title: "Anime 1", status: "completed", score: 8 },
      { id: 2, title: "Anime 2", status: "completed", score: 8 },
    ];
    const source = fakeSource({ 1: characters, 2: [character(20), character(21), character(22)], 3: [character(30)] }, list);
    const choices = await drawChoices(
      source,
      { pool: { username: "luffy", statuses: ["completed"], minScore: 0 }, difficulty: "normal" },
      drawnFrom(1, characters[0]),
    );
    expect([...choices].sort()).toEqual(["First10 Last10", "First20 Last20", "First21 Last21", "First22 Last22"]);
  });

  it("never offers the same name twice", async () => {
    const characters = [character(10), character(11, { firstName: "First10", lastName: "Last10" }), character(12)];
    const source = fakeSource({ 1: characters });
    const choices = await drawChoices(source, normal, drawnFrom(1, characters[0]));
    expect([...choices].sort()).toEqual(["First10 Last10", "First12 Last12"]);
  });

  it("never offers a name that would be accepted as the drawn Character", async () => {
    const characters = [character(10), character(11, { firstName: "first10", lastName: "LÄST10" }), character(12)];
    const source = fakeSource({ 1: characters });
    const choices = await drawChoices(source, normal, drawnFrom(1, characters[0]));
    expect([...choices].sort()).toEqual(["First10 Last10", "First12 Last12"]);
  });

  it("keeps the choices it has when the Anime pool cannot be fetched", async () => {
    const characters = [character(10), character(11)];
    const source = fakeSource({ 1: characters });
    source.topAnime = async () => {
      throw new Error("MAL is down");
    };
    const choices = await drawChoices(source, normal, drawnFrom(1, characters[0]));
    expect([...choices].sort()).toEqual(["First10 Last10", "First11 Last11"]);
  });

  it("does not always put the drawn Character at the same place", async () => {
    const characters = [character(10), character(11), character(12), character(13)];
    const source = fakeSource({ 1: characters });
    const places = new Set<number>();
    for (const value of [0, 0.3, 0.6, 0.99]) {
      const choices = await drawChoices(source, normal, drawnFrom(1, characters[0]), () => value);
      places.add(choices.indexOf("First10 Last10"));
    }
    expect(places.size).toBeGreaterThan(1);
  });
});
