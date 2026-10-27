import { isDeepStrictEqual } from "node:util";
import { and, eq, lt } from "drizzle-orm";
import type { Database } from "@/db/client";
import { guestProgress } from "@/db/schema";
import { afterGuess, isOver, startDaily, type DailyProgress } from "@/game/daily";

export type ProgressStore = {
  find(guest: string, date: string): Promise<DailyProgress>;
  advance(guest: string, date: string, from: DailyProgress, to: DailyProgress): Promise<boolean>;
  forgetBefore(date: string): Promise<void>;
};

export type RecordedGuess = { correct: boolean; progress: DailyProgress };

export function progressStore(database: Database): ProgressStore {
  return {
    async find(guest, date) {
      const [saved] = await database
        .select({ tier: guestProgress.tier, misses: guestProgress.misses, found: guestProgress.found })
        .from(guestProgress)
        .where(and(eq(guestProgress.guest, guest), eq(guestProgress.date, date)));
      return saved ?? startDaily();
    },
    async advance(guest, date, from, to) {
      const unchanged = and(
        eq(guestProgress.tier, from.tier),
        eq(guestProgress.misses, from.misses),
        eq(guestProgress.found, from.found),
      );
      const updated = isDeepStrictEqual(from, startDaily())
        ? await database
            .insert(guestProgress)
            .values({ date, guest, ...to })
            .onConflictDoUpdate({ target: [guestProgress.date, guestProgress.guest], set: to, setWhere: unchanged })
            .returning({ guest: guestProgress.guest })
        : await database
            .update(guestProgress)
            .set(to)
            .where(and(eq(guestProgress.date, date), eq(guestProgress.guest, guest), unchanged))
            .returning({ guest: guestProgress.guest });
      return updated.length === 1;
    },
    async forgetBefore(date) {
      await database.delete(guestProgress).where(lt(guestProgress.date, date));
    },
  };
}

export async function recordGuess(
  store: ProgressStore,
  guest: string,
  date: string,
  isCorrect: (progress: DailyProgress) => boolean,
): Promise<RecordedGuess> {
  const progress = await store.find(guest, date);
  if (isOver(progress)) return { correct: false, progress };
  const correct = isCorrect(progress);
  const next = afterGuess(progress, correct);
  if (await store.advance(guest, date, progress, next)) return { correct, progress: next };
  return { correct: false, progress: await store.find(guest, date) };
}
