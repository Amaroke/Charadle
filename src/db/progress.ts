import { isDeepStrictEqual } from "node:util";
import { and, eq, lt } from "drizzle-orm";
import type { Database } from "@/db/client";
import { guestProgress } from "@/db/schema";
import { afterGuess, afterHint, isOver, startDaily, type DailyProgress } from "@/game/daily";
import { hintKinds, type HintKind } from "@/game/hint";

export type ProgressStore = {
  find(guest: string, date: string): Promise<DailyProgress>;
  advance(guest: string, date: string, from: DailyProgress, to: DailyProgress): Promise<boolean>;
  forgetBefore(date: string): Promise<void>;
};

export type RecordedGuess = { correct: boolean; progress: DailyProgress };

type ProgressRow = Omit<typeof guestProgress.$inferSelect, "date" | "guest">;

function toRow({ tier, misses, found, hintsUsed, tierHints }: DailyProgress): ProgressRow {
  return {
    tier,
    misses,
    found,
    hintsUsed,
    animeHint: tierHints.includes("anime"),
    initialsHint: tierHints.includes("initials"),
  };
}

function fromRow({ tier, misses, found, hintsUsed, animeHint, initialsHint }: ProgressRow): DailyProgress {
  const used: Record<HintKind, boolean> = { anime: animeHint, initials: initialsHint };
  return { tier, misses, found, hintsUsed, tierHints: hintKinds.filter((kind) => used[kind]) };
}

export function progressStore(database: Database): ProgressStore {
  return {
    async find(guest, date) {
      const [saved] = await database
        .select({
          tier: guestProgress.tier,
          misses: guestProgress.misses,
          found: guestProgress.found,
          hintsUsed: guestProgress.hintsUsed,
          animeHint: guestProgress.animeHint,
          initialsHint: guestProgress.initialsHint,
        })
        .from(guestProgress)
        .where(and(eq(guestProgress.guest, guest), eq(guestProgress.date, date)));
      return saved ? fromRow(saved) : startDaily();
    },
    async advance(guest, date, from, to) {
      const before = toRow(from);
      const after = toRow(to);
      const unchanged = and(
        eq(guestProgress.tier, before.tier),
        eq(guestProgress.misses, before.misses),
        eq(guestProgress.found, before.found),
        eq(guestProgress.hintsUsed, before.hintsUsed),
        eq(guestProgress.animeHint, before.animeHint),
        eq(guestProgress.initialsHint, before.initialsHint),
      );
      const updated = isDeepStrictEqual(from, startDaily())
        ? await database
            .insert(guestProgress)
            .values({ date, guest, ...after })
            .onConflictDoUpdate({ target: [guestProgress.date, guestProgress.guest], set: after, setWhere: unchanged })
            .returning({ guest: guestProgress.guest })
        : await database
            .update(guestProgress)
            .set(after)
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

export async function recordHint(store: ProgressStore, guest: string, date: string, kind: HintKind): Promise<DailyProgress> {
  const progress = await store.find(guest, date);
  const next = afterHint(progress, kind);
  if (next === progress) return progress;
  if (await store.advance(guest, date, progress, next)) return next;
  return store.find(guest, date);
}
