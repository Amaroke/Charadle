import { drawCharacter } from "@/game/draw";
import type { CharacterNames } from "@/game/guess";
import { initials, type HintKind } from "@/game/hint";
import type { Settings } from "@/game/settings";
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
  hints: Record<HintKind, string>;
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

export async function drawPuzzle(locale: string | null | undefined, settings: Settings): Promise<Puzzle> {
  const { anime, character } = await drawCharacter(malSource, settings);
  const animeTitle = await localizedTitle(anime, locale && hasLocale(locale) ? locale : defaultLocale, frenchTitle);
  const reveal: Reveal = {
    character: `${character.firstName} ${character.lastName}`.trim(),
    anime: animeTitle,
  };
  const sealed: SealedPuzzle = {
    names: { firstName: character.firstName, lastName: character.lastName, aliases: character.aliases },
    reveal,
  };
  return {
    ticket: sealTicket(sealed, secret()),
    picture: character.picture,
    hints: { anime: reveal.anime, initials: initials(reveal.character) },
  };
}
