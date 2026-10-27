import type { Anime } from "@/game/draw";
import type { Locale } from "@/i18n/locales";

export type FrenchTitleSource = (animeId: number) => Promise<string | undefined>;

const leadingSeason = /^saison\s+\d+\s+de\s+/iu;
const trailingSeason = /[\s:]*(?:(?:the\s+)?final\s+season|season\s+\d+|\d+(?:st|nd|rd|th)\s+season|part\s+\d+|cour\s+\d+)$/iu;

export function withoutSeason(title: string): string {
  let stripped = title.replace(leadingSeason, "");
  for (let previous = ""; previous !== stripped; ) {
    previous = stripped;
    stripped = stripped.replace(trailingSeason, "");
  }
  return stripped.trim() || title;
}

export function franchiseKey(romajiTitle: string): string {
  return withoutSeason(romajiTitle).split(":")[0].trim().toLowerCase();
}

export async function localizedTitle(anime: Anime, locale: Locale, frenchTitle: FrenchTitleSource): Promise<string> {
  const fallback = anime.englishTitle || anime.title;
  if (locale !== "fr") return withoutSeason(fallback);
  return withoutSeason((await frenchTitle(anime.id).catch(() => undefined)) || fallback);
}
