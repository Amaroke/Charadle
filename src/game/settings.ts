export const tiers = [5, 10, 20, 50, 100, 200, 500] as const;
export const difficulties = ["normal", "expert"] as const;

export type Tier = (typeof tiers)[number];
export type Difficulty = (typeof difficulties)[number];

export type Settings = {
  pool: Tier;
  difficulty: Difficulty;
};

export const settingsCookie = "FREE_PLAY_SETTINGS";

export const defaultSettings: Settings = { pool: 100, difficulty: "normal" };

function isTier(value: number): value is Tier {
  return (tiers as readonly number[]).includes(value);
}

function isDifficulty(value: string | null): value is Difficulty {
  return (difficulties as readonly (string | null)[]).includes(value);
}

export function parseSettings(params: URLSearchParams): Settings | undefined {
  const pool = Number(params.get("pool"));
  const difficulty = params.get("difficulty");
  return isTier(pool) && isDifficulty(difficulty) ? { pool, difficulty } : undefined;
}

export function settingsParams(settings: Settings): URLSearchParams {
  return new URLSearchParams({ pool: String(settings.pool), difficulty: settings.difficulty });
}
