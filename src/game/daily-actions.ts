"use server";

import { afterGuess, isOver } from "@/game/daily";
import { readProgress, saveProgress, todaysDaily, viewOf } from "@/game/daily-game";
import type { DailyView } from "@/game/daily-view";
import { isCorrectGuess, maxGuessLength } from "@/game/guess";

export type DailyGuessResult = { expired: true } | { expired: false; correct: boolean; view: DailyView };

export async function guessDaily(date: string, guess: string, locale: string): Promise<DailyGuessResult> {
  const { date: today, tiers } = await todaysDaily();
  if (date !== today) return { expired: true };
  const progress = await readProgress(today);
  if (isOver(progress) || typeof guess !== "string" || !guess.trim() || guess.length > maxGuessLength) {
    return { expired: false, correct: false, view: await viewOf(tiers, progress, locale) };
  }
  const correct = isCorrectGuess(guess, tiers[progress.tier].character);
  const next = afterGuess(progress, correct);
  await saveProgress(today, next);
  return { expired: false, correct, view: await viewOf(tiers, next, locale) };
}
