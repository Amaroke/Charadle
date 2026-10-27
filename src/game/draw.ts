import { isCorrectGuess, type CharacterNames } from "@/game/guess";
import { isMalList, type AnimePool, type Difficulty, type Settings, type Tier, type WatchStatus } from "@/game/settings";
import { franchiseKey } from "@/game/title";

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

export type DrawHistory = {
  characters: number[];
  franchise?: string;
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
const choiceCount = 4;
const historyLength = 100;

function randomIndex(length: number, random: () => number): number {
  return Math.min(Math.floor(random() * length), length - 1);
}

function pick<T>(items: T[], random: () => number): T {
  return items.length === 1 ? items[0] : items[randomIndex(items.length, random)];
}

function shuffled<T>(items: T[], random: () => number): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = randomIndex(i + 1, random);
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export function fullName(character: CharacterNames): string {
  return `${character.firstName} ${character.lastName}`.trim();
}

function hasRole(character: Character, difficulty: Difficulty): boolean {
  return difficulty === "expert" || character.role === "main";
}

function isEligible(
  character: Character,
  difficulty: Difficulty,
): character is Character & { picture: string } {
  return hasRole(character, difficulty) && Boolean(character.picture);
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

function byFranchise(pool: Anime[]): Anime[][] {
  const franchises = new Map<string, Anime[]>();
  for (const anime of pool) {
    const key = franchiseKey(anime.title);
    franchises.set(key, [...(franchises.get(key) ?? []), anime]);
  }
  return [...franchises.values()];
}

async function drawFrom(
  source: AnimeSource,
  franchises: Anime[][],
  difficulty: Difficulty,
  random: () => number,
  excluded: ReadonlySet<number> = new Set(),
): Promise<DrawnCharacter | undefined> {
  for (let attempt = 0; attempt < maxAttempts && franchises.length > 0; attempt++) {
    const franchise = pick(franchises, random);
    const anime = pick(franchise, random);
    const characters = await source.characters(anime.id).catch((): Character[] => []);
    const eligible = characters
      .filter((character) => isEligible(character, difficulty))
      .filter(({ id }) => !excluded.has(id));
    if (eligible.length > 0) return { anime, character: pick(eligible, random) };
    franchise.splice(franchise.indexOf(anime), 1);
    if (franchise.length === 0) franchises.splice(franchises.indexOf(franchise), 1);
  }
  return undefined;
}

export async function drawCharacter(
  source: AnimeSource,
  settings: Settings,
  random: () => number = Math.random,
  history: DrawHistory = { characters: [] },
): Promise<DrawnCharacter> {
  const pool = await animePool(source, settings.pool);
  const others = pool.filter(({ title }) => franchiseKey(title) !== history.franchise);
  const stages = [{ pool: others.length > 0 ? others : pool, excluded: new Set(history.characters) }];
  if (history.characters.length > 0 || history.franchise) stages.push({ pool, excluded: new Set() });
  let exhausted = false;
  for (const stage of stages) {
    const franchises = byFranchise(stage.pool);
    const drawn = await drawFrom(source, franchises, settings.difficulty, random, stage.excluded);
    if (drawn) return drawn;
    exhausted = franchises.length === 0;
  }
  if (exhausted && isMalList(settings.pool)) throw new PoolError("empty-pool");
  throw new Error("No eligible character with a picture could be drawn");
}

export function nextHistory(history: DrawHistory, { anime, character }: DrawnCharacter): DrawHistory {
  return {
    characters: [...history.characters, character.id].slice(-historyLength),
    franchise: franchiseKey(anime.title),
  };
}

export async function drawDaily(
  source: AnimeSource,
  tiers: readonly Tier[],
  random: () => number = Math.random,
): Promise<DrawnCharacter[]> {
  const drawnTiers: DrawnCharacter[] = [];
  for (const tier of [...tiers].reverse()) {
    const used = new Set(drawnTiers.map(({ anime }) => anime.id));
    const remaining = (await source.topAnime(tier)).filter(({ id }) => !used.has(id));
    const drawn = await drawFrom(source, remaining.map((anime) => [anime]), "normal", random);
    if (!drawn) throw new Error(`No main character with a picture could be drawn for the Top ${tier}`);
    drawnTiers.unshift(drawn);
  }
  return drawnTiers;
}

export async function drawChoices(
  source: AnimeSource,
  settings: Settings,
  drawn: DrawnCharacter,
  random: () => number = Math.random,
): Promise<string[]> {
  const names = new Set([fullName(drawn.character)]);
  function offer(characters: Character[]) {
    for (const character of shuffled(characters, random)) {
      if (names.size >= choiceCount) return;
      const name = fullName(character);
      if (name && !isCorrectGuess(name, drawn.character)) names.add(name);
    }
  }
  const siblings = (await source.characters(drawn.anime.id).catch((): Character[] => [])).filter(
    ({ id }) => id !== drawn.character.id,
  );
  offer(siblings.filter((character) => hasRole(character, settings.difficulty)));
  offer(siblings.filter((character) => !hasRole(character, settings.difficulty)));
  if (names.size < choiceCount) {
    const pool = await animePool(source, settings.pool).catch((): Anime[] => []);
    const others = shuffled(pool.filter(({ id }) => id !== drawn.anime.id), random).slice(0, maxAttempts);
    const casts = await Promise.all(others.map((anime) => source.characters(anime.id).catch((): Character[] => [])));
    for (const characters of casts) offer(characters.filter((character) => hasRole(character, settings.difficulty)));
  }
  return shuffled([...names], random);
}
