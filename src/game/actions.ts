"use server";

import { drawCharacter } from "@/game/draw";
import { isCorrectGuess, type CharacterNames } from "@/game/guess";
import { openTicket, sealTicket } from "@/game/ticket";
import { malSource } from "@/mal/source";

export type Reveal = {
  character: string;
  anime: string;
};

export type Puzzle = {
  ticket: string;
  picture: string;
};

export type GuessResult = { correct: false } | { correct: true; reveal: Reveal };

type SealedPuzzle = {
  names: CharacterNames;
  reveal: Reveal;
};

const maxGuessLength = 100;

function secret(): string {
  const value = process.env.GAME_SECRET;
  if (!value) throw new Error("GAME_SECRET is not set");
  return value;
}

function open(ticket: unknown): SealedPuzzle {
  const puzzle = typeof ticket === "string" ? openTicket<SealedPuzzle>(ticket, secret()) : undefined;
  if (!puzzle) throw new Error("Invalid ticket");
  return puzzle;
}

export async function startPuzzle(): Promise<Puzzle> {
  const { anime, character } = await drawCharacter(malSource);
  const sealed: SealedPuzzle = {
    names: { firstName: character.firstName, lastName: character.lastName, aliases: character.aliases },
    reveal: {
      character: `${character.firstName} ${character.lastName}`.trim(),
      anime: anime.title,
    },
  };
  return { ticket: sealTicket(sealed, secret()), picture: character.picture };
}

export async function submitGuess(ticket: string, guess: string): Promise<GuessResult> {
  const puzzle = open(ticket);
  if (typeof guess !== "string" || guess.length > maxGuessLength) return { correct: false };
  return isCorrectGuess(guess, puzzle.names) ? { correct: true, reveal: puzzle.reveal } : { correct: false };
}

export async function giveUp(ticket: string): Promise<Reveal> {
  return open(ticket).reveal;
}
