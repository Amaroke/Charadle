import type { Anime } from "@/game/draw";
import type { Locale } from "@/i18n/locales";

export type FrenchTitleSource = (animeId: number) => Promise<string | undefined>;

export async function localizedTitle(anime: Anime, locale: Locale, frenchTitle: FrenchTitleSource): Promise<string> {
  const fallback = anime.englishTitle || anime.title;
  if (locale !== "fr") return fallback;
  return (await frenchTitle(anime.id).catch(() => undefined)) || fallback;
}
