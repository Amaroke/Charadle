import type { Tier } from "@/game/settings";

export const dailyTiers = [500, 200, 100, 50, 20, 10, 5] as const satisfies readonly Tier[];
export const guessesPerTier = 2;

export type DailyProgress = {
  tier: number;
  misses: number;
  found: boolean;
};

const renewalHour = 12;

export function startDaily(): DailyProgress {
  return { tier: 0, misses: 0, found: false };
}

export function isOver({ tier, found }: DailyProgress): boolean {
  return found || tier >= dailyTiers.length;
}

export function currentTier(progress: DailyProgress): Tier | undefined {
  return dailyTiers[progress.tier];
}

export function afterGuess(progress: DailyProgress, correct: boolean): DailyProgress {
  if (isOver(progress)) return progress;
  if (correct) return { ...progress, found: true };
  const misses = progress.misses + 1;
  return misses < guessesPerTier ? { ...progress, misses } : { tier: progress.tier + 1, misses: 0, found: false };
}

export function dailyScore(progress: DailyProgress): number {
  return progress.found ? dailyTiers.length - progress.tier : 0;
}

export function dailyDate(now: Date): string {
  return new Date(now.getTime() - renewalHour * 60 * 60 * 1000).toISOString().slice(0, 10);
}
