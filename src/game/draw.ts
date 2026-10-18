import type { CharacterNames } from "@/game/guess";
import type { Difficulty, Settings } from "@/game/settings";

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

const maxAttempts = 5;

function pick<T>(items: T[], random: () => number): T {
  return items[Math.min(Math.floor(random() * items.length), items.length - 1)];
}

function isEligible(
  character: Character,
  difficulty: Difficulty,
): character is Character & { picture: string } {
  return (difficulty === "expert" || character.role === "main") && Boolean(character.picture);
}

export async function drawCharacter(
  source: AnimeSource,
  settings: Settings,
  random: () => number = Math.random,
): Promise<DrawnCharacter> {
  const remaining = [...(await source.topAnime(settings.pool))];
  for (let attempt = 0; attempt < maxAttempts && remaining.length > 0; attempt++) {
    const anime = pick(remaining, random);
    const characters = await source.characters(anime.id).catch((): Character[] => []);
    const eligible = characters.filter((character) => isEligible(character, settings.difficulty));
    if (eligible.length > 0) return { anime, character: pick(eligible, random) };
    remaining.splice(remaining.indexOf(anime), 1);
  }
  throw new Error("No eligible character with a picture could be drawn");
}
