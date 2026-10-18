import type { CharacterNames } from "@/game/guess";

export type Anime = {
  id: number;
  title: string;
  englishTitle?: string;
};

export type Character = CharacterNames & {
  id: number;
  picture?: string;
  role: "main" | "supporting";
};

export type AnimeSource = {
  topAnime(limit: number): Promise<Anime[]>;
  characters(animeId: number): Promise<Character[]>;
};

export type DrawnCharacter = {
  anime: Anime;
  character: Character & { picture: string };
};

const topLimit = 100;
const maxAttempts = 5;

function pick<T>(items: T[], random: () => number): T {
  return items[Math.min(Math.floor(random() * items.length), items.length - 1)];
}

function isEligible(character: Character): character is Character & { picture: string } {
  return character.role === "main" && Boolean(character.picture);
}

export async function drawCharacter(
  source: AnimeSource,
  random: () => number = Math.random,
): Promise<DrawnCharacter> {
  const remaining = [...(await source.topAnime(topLimit))];
  for (let attempt = 0; attempt < maxAttempts && remaining.length > 0; attempt++) {
    const anime = pick(remaining, random);
    const characters = await source.characters(anime.id).catch((): Character[] => []);
    const eligible = characters.filter(isEligible);
    if (eligible.length > 0) return { anime, character: pick(eligible, random) };
    remaining.splice(remaining.indexOf(anime), 1);
  }
  throw new Error("No main character with a picture could be drawn");
}
