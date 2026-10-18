import { describe, expect, it } from "vitest";
import { localizedTitle } from "@/game/title";

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
