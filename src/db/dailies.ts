import { eq } from "drizzle-orm";
import type { Database } from "@/db/client";
import { dailies } from "@/db/schema";
import type { DrawnCharacter } from "@/game/draw";

export type DailyStore = {
  find(date: string): Promise<DrawnCharacter[] | undefined>;
  save(date: string, tiers: DrawnCharacter[]): Promise<void>;
};

export function dailyStore(database: Database): DailyStore {
  return {
    async find(date) {
      const [daily] = await database.select({ tiers: dailies.tiers }).from(dailies).where(eq(dailies.date, date));
      return daily?.tiers;
    },
    async save(date, tiers) {
      await database.insert(dailies).values({ date, tiers }).onConflictDoNothing();
    },
  };
}

export async function ensureDaily(
  store: DailyStore,
  date: string,
  draw: () => Promise<DrawnCharacter[]>,
): Promise<DrawnCharacter[]> {
  const existing = await store.find(date);
  if (existing) return existing;
  await store.save(date, await draw());
  const saved = await store.find(date);
  if (!saved) throw new Error(`The Daily of ${date} could not be saved`);
  return saved;
}
