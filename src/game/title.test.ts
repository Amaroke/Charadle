import { describe, expect, it } from "vitest";
import { localizedTitle, withoutSeason } from "@/game/title";

const onePiece = { id: 21, title: "Wan Pīsu", englishTitle: "One Piece" };
const noEnglish = { id: 22, title: "Shingeki no Kyojin" };

function frenchTitles(titles: Record<number, string>) {
  const requested: number[] = [];
  return {
    requested,
    async frenchTitle(animeId: number) {
      requested.push(animeId);
      return titles[animeId];
    },
  };
}

describe("localizedTitle", () => {
  it("shows the French title in French when one is known", async () => {
    const source = frenchTitles({ 21: "One Piece (VF)" });
    expect(await localizedTitle(onePiece, "fr", source.frenchTitle)).toBe("One Piece (VF)");
  });

  it("falls back to the English title in French without a French title", async () => {
    const source = frenchTitles({});
    expect(await localizedTitle(onePiece, "fr", source.frenchTitle)).toBe("One Piece");
  });

  it("falls back to the romaji title without a French or English title", async () => {
    const source = frenchTitles({});
    expect(await localizedTitle(noEnglish, "fr", source.frenchTitle)).toBe("Shingeki no Kyojin");
  });

  it("falls back to the English title when the French titles cannot be fetched", async () => {
    const failing = async (): Promise<string | undefined> => {
      throw new Error("Wikidata is down");
    };
    expect(await localizedTitle(onePiece, "fr", failing)).toBe("One Piece");
  });

  it("shows the English title in English without looking for a French one", async () => {
    const source = frenchTitles({ 21: "One Piece (VF)" });
    expect(await localizedTitle(onePiece, "en", source.frenchTitle)).toBe("One Piece");
    expect(source.requested).toEqual([]);
  });

  it("shows the romaji title in English without an English title", async () => {
    const source = frenchTitles({});
    expect(await localizedTitle(noEnglish, "en", source.frenchTitle)).toBe("Shingeki no Kyojin");
  });
});

describe("withoutSeason", () => {
  it.each([
    ["saison 4 de L'Attaque des Titans", "L'Attaque des Titans"],
    ["Saison 2 de Jujutsu Kaisen", "Jujutsu Kaisen"],
    ["Jujutsu Kaisen 2nd Season", "Jujutsu Kaisen"],
    ["Attack on Titan Season 3 Part 2", "Attack on Titan"],
    ["Shingeki no Kyojin: The Final Season", "Shingeki no Kyojin"],
    ["Attack on Titan Final Season", "Attack on Titan"],
    ["My Hero Academia Season 2", "My Hero Academia"],
    ["Spy x Family Part 2", "Spy x Family"],
  ])("removes the season from %s", (title, expected) => {
    expect(withoutSeason(title)).toBe(expected);
  });

  it.each(["One Piece", "Mob Psycho 100", "Naruto: Shippūden", "Steins;Gate", "Kaiji: Ultimate Survivor"])(
    "keeps %s untouched",
    (title) => {
      expect(withoutSeason(title)).toBe(title);
    },
  );

  it("keeps the title when it is only a season", () => {
    expect(withoutSeason("Season 2")).toBe("Season 2");
  });
});

describe("localizedTitle without seasons", () => {
  it("removes the season from the French title", async () => {
    const source = frenchTitles({ 51009: "Saison 2 de Jujutsu Kaisen" });
    const anime = { id: 51009, title: "Jujutsu Kaisen 2nd Season", englishTitle: "Jujutsu Kaisen Season 2" };
    expect(await localizedTitle(anime, "fr", source.frenchTitle)).toBe("Jujutsu Kaisen");
  });

  it("removes the season from the English title", async () => {
    const source = frenchTitles({});
    const anime = { id: 40028, title: "Shingeki no Kyojin: The Final Season", englishTitle: "Attack on Titan Final Season" };
    expect(await localizedTitle(anime, "en", source.frenchTitle)).toBe("Attack on Titan");
  });
});
