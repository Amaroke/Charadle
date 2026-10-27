"use server";

import { playGuess, readProgress, todaysDaily, viewOf } from "@/game/daily-game";
import type { DailyView } from "@/game/daily-view";
import { isCorrectGuess, maxGuessLength } from "@/game/guess";

export type DailyGuessResult = { expired: true } | { expired: false; correct: boolean; view: DailyView };

export async function guessDaily(date: string, guess: string, locale: string): Promise<DailyGuessResult> {
  const { date: today, tiers } = await todaysDaily();
  if (date !== today) return { expired: true };
  if (typeof guess !== "string" || !guess.trim() || guess.length > maxGuessLength) {
    return { expired: false, correct: false, view: await viewOf(tiers, await readProgress(today), locale) };
  }
  const { correct, progress } = await playGuess(today, ({ tier }) => isCorrectGuess(guess, tiers[tier].character));
  return { expired: false, correct, view: await viewOf(tiers, progress, locale) };
}
