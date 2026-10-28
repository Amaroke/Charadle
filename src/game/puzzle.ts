import { drawCharacter, drawChoices, fullName, nextHistory, type DrawHistory } from "@/game/draw";
import type { CharacterNames } from "@/game/guess";
import { initials, type HintKind } from "@/game/hint";
import type { Settings } from "@/game/settings";
import { gameSecret, openTicket, sealTicket } from "@/game/ticket";
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
  choices: string[];
  history?: DrawHistory;
};

export function openPuzzle(ticket: unknown): SealedPuzzle {
  const puzzle = typeof ticket === "string" ? openTicket<SealedPuzzle>(ticket, gameSecret()) : undefined;
  if (!puzzle) throw new Error("Invalid ticket");
  return puzzle;
}

function historyAfter(ticket: string | null | undefined): DrawHistory | undefined {
  return ticket ? openTicket<SealedPuzzle>(ticket, gameSecret())?.history : undefined;
}

export async function drawPuzzle(
  locale: string | null | undefined,
  settings: Settings,
  previousTicket?: string | null,
): Promise<Puzzle> {
  const history = historyAfter(previousTicket) ?? { characters: [] };
  const drawn = await drawCharacter(malSource, settings, Math.random, history);
  const { anime, character } = drawn;
  const [animeTitle, choices] = await Promise.all([
    localizedTitle(anime, locale && hasLocale(locale) ? locale : defaultLocale, frenchTitle),
    drawChoices(malSource, settings, drawn),
  ]);
  const reveal: Reveal = {
    character: fullName(character),
    anime: animeTitle,
  };
  const sealed: SealedPuzzle = {
    names: { firstName: character.firstName, lastName: character.lastName, aliases: character.aliases },
    reveal,
    choices,
    history: nextHistory(history, drawn),
  };
  return {
    ticket: sealTicket(sealed, gameSecret()),
    picture: character.picture,
    hints: { anime: reveal.anime, initials: initials(reveal.character) },
  };
}
