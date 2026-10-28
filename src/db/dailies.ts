import { eq, lt, sql } from "drizzle-orm";
import type { Database } from "@/db/client";
import { dailies, dailyDraws } from "@/db/schema";
import type { DrawnCharacter } from "@/game/draw";

export type DrawClaim = "claimed" | "drawing" | "failed";

export type DailyStore = {
  find(date: string): Promise<DrawnCharacter[] | undefined>;
  save(date: string, tiers: DrawnCharacter[]): Promise<void>;
  claimDraw(date: string, now: Date, since: Date): Promise<DrawClaim>;
  failDraw(date: string): Promise<void>;
};

export class DailyPending extends Error {
  constructor(date: string, options?: ErrorOptions) {
    super(`The Daily of ${date} is not drawn yet`, options);
    this.name = "DailyPending";
  }
}

const drawDelay = 10 * 60 * 1000;
const defaultPatience = 15_000;
const pollInterval = 250;

export function dailyStore(database: Database): DailyStore {
  return {
    async find(date) {
      const [daily] = await database.select({ tiers: dailies.tiers }).from(dailies).where(eq(dailies.date, date));
      return daily?.tiers;
    },
    async save(date, tiers) {
      await database.insert(dailies).values({ date, tiers }).onConflictDoNothing();
    },
    async claimDraw(date, now, since) {
      const claimed = await database
        .insert(dailyDraws)
        .values({ date, startedAt: now })
        .onConflictDoUpdate({
          target: dailyDraws.date,
          set: { startedAt: sql`excluded.started_at`, failed: false },
          setWhere: lt(dailyDraws.startedAt, since),
        })
        .returning({ date: dailyDraws.date });
      if (claimed.length > 0) return "claimed";
      const [draw] = await database.select({ failed: dailyDraws.failed }).from(dailyDraws).where(eq(dailyDraws.date, date));
      return draw?.failed ? "failed" : "drawing";
    },
    async failDraw(date) {
      await database.update(dailyDraws).set({ failed: true }).where(eq(dailyDraws.date, date));
    },
  };
}

async function waitForDraw(store: DailyStore, date: string, patience: number): Promise<DrawnCharacter[]> {
  for (let waited = 0; waited < patience; waited += pollInterval) {
    await new Promise((resolve) => setTimeout(resolve, pollInterval));
    const tiers = await store.find(date);
    if (tiers) return tiers;
  }
  throw new DailyPending(date);
}

export async function ensureDaily(
  store: DailyStore,
  date: string,
  draw: () => Promise<DrawnCharacter[]>,
  { now = new Date(), force = false, patience = defaultPatience }: { now?: Date; force?: boolean; patience?: number } = {},
): Promise<DrawnCharacter[]> {
  const existing = await store.find(date);
  if (existing) return existing;
  const claim = await store.claimDraw(date, now, new Date(now.getTime() - drawDelay));
  if (claim === "failed" && !force) throw new DailyPending(date);
  if (claim === "drawing" && !force) return waitForDraw(store, date, patience);
  const tiers = await draw().catch(async (error: unknown) => {
    await store.failDraw(date);
    throw new DailyPending(date, { cause: error });
  });
  await store.save(date, tiers);
  const saved = await store.find(date);
  if (!saved) throw new Error(`The Daily of ${date} could not be saved`);
  return saved;
}
