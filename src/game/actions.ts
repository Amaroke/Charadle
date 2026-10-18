"use server";

import { isCorrectGuess } from "@/game/guess";
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
