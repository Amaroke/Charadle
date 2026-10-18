export const tiers = [5, 10, 20, 50, 100, 200, 500] as const;
export const difficulties = ["normal", "expert"] as const;
export const watchStatuses = ["completed", "watching", "on_hold", "dropped", "plan_to_watch"] as const;
export const maxScore = 10;

export type Tier = (typeof tiers)[number];
export type Difficulty = (typeof difficulties)[number];
export type WatchStatus = (typeof watchStatuses)[number];

export type MalListPool = {
  username: string;
  statuses: WatchStatus[];
  minScore: number;
};

export type AnimePool = Tier | MalListPool;

export type Settings = {
  pool: AnimePool;
  difficulty: Difficulty;
};

export const settingsCookie = "FREE_PLAY_SETTINGS";

export const defaultSettings: Settings = { pool: 100, difficulty: "normal" };

export const defaultMalList: MalListPool = { username: "", statuses: ["completed"], minScore: 0 };

const malPool = "mal";
const username = /^[\w-]{2,16}$/;

export function isMalList(pool: AnimePool): pool is MalListPool {
  return typeof pool !== "number";
}

export function isUsername(value: string): boolean {
  return username.test(value);
}

function isTier(value: number): value is Tier {
  return (tiers as readonly number[]).includes(value);
}

function isDifficulty(value: string | null): value is Difficulty {
  return (difficulties as readonly (string | null)[]).includes(value);
}

export function isWatchStatus(value: string | undefined): value is WatchStatus {
  return (watchStatuses as readonly (string | undefined)[]).includes(value);
}

function parseMalList(params: URLSearchParams): MalListPool | undefined {
  const user = params.get("user") ?? "";
  const statuses = [...new Set((params.get("status") ?? "").split(","))];
  const score = params.get("score");
  const minScore = Number(score);
  if (!isUsername(user) || !statuses.every(isWatchStatus)) return undefined;
  if (!score || !Number.isInteger(minScore) || minScore < 0 || minScore > maxScore) return undefined;
  return { username: user, statuses, minScore };
}

function parsePool(params: URLSearchParams): AnimePool | undefined {
  const pool = params.get("pool");
  if (pool === malPool) return parseMalList(params);
  const size = Number(pool);
  return isTier(size) ? size : undefined;
}

export function parseSettings(params: URLSearchParams): Settings | undefined {
  const pool = parsePool(params);
  const difficulty = params.get("difficulty");
  return pool !== undefined && isDifficulty(difficulty) ? { pool, difficulty } : undefined;
}

export function settingsParams({ pool, difficulty }: Settings): URLSearchParams {
  if (!isMalList(pool)) return new URLSearchParams({ pool: String(pool), difficulty });
  return new URLSearchParams({
    pool: malPool,
    user: pool.username,
    status: pool.statuses.join(","),
    score: String(pool.minScore),
    difficulty,
  });
}
