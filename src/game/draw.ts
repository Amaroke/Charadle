import type { CharacterNames } from "@/game/guess";
import { isMalList, type AnimePool, type Difficulty, type Settings, type WatchStatus } from "@/game/settings";

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

export type ListedAnime = Anime & {
  status: WatchStatus;
  score: number;
};

export type AnimeSource = {
  topAnime(limit: number): Promise<Anime[]>;
  malList(username: string): Promise<ListedAnime[]>;
  characters(animeId: number): Promise<Character[]>;
};

export type DrawnCharacter = {
  anime: Anime;
  character: Character & { picture: string };
};

export const poolProblems = ["unknown-user", "private-list", "empty-pool"] as const;

export type PoolProblem = (typeof poolProblems)[number];

export class PoolError extends Error {
  constructor(readonly problem: PoolProblem) {
    super(`Anime pool problem: ${problem}`);
    this.name = "PoolError";
  }
}

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

async function animePool(source: AnimeSource, pool: AnimePool): Promise<Anime[]> {
  if (!isMalList(pool)) return [...(await source.topAnime(pool))];
  const listed = await source.malList(pool.username);
  const kept = listed
    .filter(({ status, score }) => pool.statuses.includes(status) && score >= pool.minScore)
    .map(({ id, title, englishTitle }) => ({ id, title, englishTitle }));
  if (kept.length === 0) throw new PoolError("empty-pool");
  return kept;
}

export async function drawCharacter(
  source: AnimeSource,
  settings: Settings,
  random: () => number = Math.random,
): Promise<DrawnCharacter> {
  const remaining = await animePool(source, settings.pool);
  for (let attempt = 0; attempt < maxAttempts && remaining.length > 0; attempt++) {
    const anime = pick(remaining, random);
    const characters = await source.characters(anime.id).catch((): Character[] => []);
    const eligible = characters.filter((character) => isEligible(character, settings.difficulty));
    if (eligible.length > 0) return { anime, character: pick(eligible, random) };
    remaining.splice(remaining.indexOf(anime), 1);
  }
  if (remaining.length === 0 && isMalList(settings.pool)) throw new PoolError("empty-pool");
  throw new Error("No eligible character with a picture could be drawn");
}
