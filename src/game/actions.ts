"use server";

import { isCorrectGuess, maxGuessLength } from "@/game/guess";
import { openPuzzle, type Reveal } from "@/game/puzzle";

export type GuessResult = { correct: false } | { correct: true; reveal: Reveal };

export type ChoiceResult = { correct: boolean; reveal: Reveal };

export async function submitGuess(ticket: string, guess: string): Promise<GuessResult> {
  const puzzle = openPuzzle(ticket);
  if (typeof guess !== "string" || guess.length > maxGuessLength) return { correct: false };
  return isCorrectGuess(guess, puzzle.names) ? { correct: true, reveal: puzzle.reveal } : { correct: false };
}

export async function giveUp(ticket: string): Promise<Reveal> {
  return openPuzzle(ticket).reveal;
}

export async function multipleChoice(ticket: string): Promise<string[]> {
  return openPuzzle(ticket).choices;
}

export async function pickChoice(ticket: string, choice: string): Promise<ChoiceResult> {
  const { reveal } = openPuzzle(ticket);
  return { correct: choice === reveal.character, reveal };
}
