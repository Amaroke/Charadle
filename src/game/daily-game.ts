import { randomUUID } from "node:crypto";
import { cookies } from "next/headers";
import { database } from "@/db/client";
import { dailyStore, ensureDaily } from "@/db/dailies";
import { progressStore, recordGuess, type RecordedGuess } from "@/db/progress";
import { dailyDate, dailyTiers, startDaily, type DailyProgress } from "@/game/daily";
import { dailyView, type DailyView } from "@/game/daily-view";
import { drawDaily, type DrawnCharacter } from "@/game/draw";
import { localizedTitle } from "@/game/title";
import { defaultLocale, hasLocale } from "@/i18n/locales";
import { malSource } from "@/mal/source";
import { frenchTitle } from "@/wikidata/source";

export type TodaysDaily = {
  date: string;
  tiers: DrawnCharacter[];
};

const guestCookie = "GUEST_ID";
const oneYear = 60 * 60 * 24 * 365;
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

export async function todaysDaily(now: Date = new Date()): Promise<TodaysDaily> {
  const date = dailyDate(now);
  const tiers = await ensureDaily(dailyStore(await database()), date, () => drawDaily(malSource, dailyTiers));
  return { date, tiers };
}

export async function forgetPreviousProgress(date: string): Promise<void> {
  await progressStore(await database()).forgetBefore(date);
}

async function guestId(): Promise<string | undefined> {
  const value = (await cookies()).get(guestCookie)?.value;
  return value && uuidPattern.test(value) ? value : undefined;
}

async function ensureGuestId(): Promise<string> {
  const existing = await guestId();
  if (existing) return existing;
  const created = randomUUID();
  (await cookies()).set(guestCookie, created, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: oneYear,
  });
  return created;
}

export async function readProgress(date: string): Promise<DailyProgress> {
  const guest = await guestId();
  if (!guest) return startDaily();
  return progressStore(await database()).find(guest, date);
}

export async function playGuess(
  date: string,
  isCorrect: (progress: DailyProgress) => boolean,
): Promise<RecordedGuess> {
  return recordGuess(progressStore(await database()), await ensureGuestId(), date, isCorrect);
}

export function viewOf(tiers: DrawnCharacter[], progress: DailyProgress, locale: string): Promise<DailyView> {
  const language = hasLocale(locale) ? locale : defaultLocale;
  return dailyView(tiers, progress, (anime) => localizedTitle(anime, language, frenchTitle));
}
