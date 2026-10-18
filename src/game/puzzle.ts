import { drawCharacter } from "@/game/draw";
import type { CharacterNames } from "@/game/guess";
import { openTicket, sealTicket } from "@/game/ticket";
import { localizedTitle } from "@/game/title";
import { defaultLocale, hasLocale } from "@/i18n/locales";
import { malSource } from "@/mal/source";
import { frenchTitle } from "@/wikidata/source";

export type Reveal = {
  character: string;
  anime: string;
};

export type Puzzle = {
  ticket: string;
  picture: string;
};

type SealedPuzzle = {
  names: CharacterNames;
  reveal: Reveal;
};

function secret(): string {
  const value = process.env.GAME_SECRET;
  if (!value) throw new Error("GAME_SECRET is not set");
  return value;
}

export function openPuzzle(ticket: unknown): SealedPuzzle {
  const puzzle = typeof ticket === "string" ? openTicket<SealedPuzzle>(ticket, secret()) : undefined;
  if (!puzzle) throw new Error("Invalid ticket");
  return puzzle;
}

export async function drawPuzzle(locale: string | null | undefined): Promise<Puzzle> {
  const { anime, character } = await drawCharacter(malSource);
  const animeTitle = await localizedTitle(anime, locale && hasLocale(locale) ? locale : defaultLocale, frenchTitle);
  const sealed: SealedPuzzle = {
    names: { firstName: character.firstName, lastName: character.lastName, aliases: character.aliases },
    reveal: {
      character: `${character.firstName} ${character.lastName}`.trim(),
      anime: animeTitle,
    },
  };
  return { ticket: sealTicket(sealed, secret()), picture: character.picture };
}
