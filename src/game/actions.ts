"use server";

import { isCorrectGuess } from "@/game/guess";
import { initials, type HintKind } from "@/game/hint";
import { openPuzzle, type Reveal } from "@/game/puzzle";

export type GuessResult = { correct: false } | { correct: true; reveal: Reveal };

const maxGuessLength = 100;

export async function submitGuess(ticket: string, guess: string): Promise<GuessResult> {
  const puzzle = openPuzzle(ticket);
  if (typeof guess !== "string" || guess.length > maxGuessLength) return { correct: false };
  return isCorrectGuess(guess, puzzle.names) ? { correct: true, reveal: puzzle.reveal } : { correct: false };
}

export async function giveUp(ticket: string): Promise<Reveal> {
  return openPuzzle(ticket).reveal;
}

export async function revealHint(ticket: string, kind: HintKind): Promise<string> {
  const { reveal } = openPuzzle(ticket);
  if (kind === "anime") return reveal.anime;
  if (kind === "initials") return initials(reveal.character);
  throw new Error("Unknown hint");
}
