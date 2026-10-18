import { cookies } from "next/headers";
import { database } from "@/db/client";
import { dailyStore, ensureDaily } from "@/db/dailies";
import { dailyDate, dailyTiers, startDaily, type DailyProgress } from "@/game/daily";
import { dailyView, type DailyView } from "@/game/daily-view";
import { drawDaily, type DrawnCharacter } from "@/game/draw";
import { gameSecret, openTicket, sealTicket } from "@/game/ticket";
import { localizedTitle } from "@/game/title";
import { defaultLocale, hasLocale } from "@/i18n/locales";
import { malSource } from "@/mal/source";
import { frenchTitle } from "@/wikidata/source";

export type TodaysDaily = {
  date: string;
  tiers: DrawnCharacter[];
};

type SavedProgress = DailyProgress & { date: string };

const progressCookie = "DAILY_PROGRESS";
const twoDays = 60 * 60 * 24 * 2;

export async function todaysDaily(now: Date = new Date()): Promise<TodaysDaily> {
  const date = dailyDate(now);
  const tiers = await ensureDaily(dailyStore(await database()), date, () => drawDaily(malSource, dailyTiers));
  return { date, tiers };
}

export async function readProgress(date: string): Promise<DailyProgress> {
  const value = (await cookies()).get(progressCookie)?.value;
  const saved = value ? openTicket<SavedProgress>(value, gameSecret()) : undefined;
  if (!saved || saved.date !== date) return startDaily();
  return { tier: saved.tier, misses: saved.misses, found: saved.found };
}

export async function saveProgress(date: string, progress: DailyProgress): Promise<void> {
  const saved: SavedProgress = { date, ...progress };
  (await cookies()).set(progressCookie, sealTicket(saved, gameSecret()), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: twoDays,
  });
}

export function viewOf(tiers: DrawnCharacter[], progress: DailyProgress, locale: string): Promise<DailyView> {
  const language = hasLocale(locale) ? locale : defaultLocale;
  return dailyView(tiers, progress, (anime) => localizedTitle(anime, language, frenchTitle));
}
