import { count, eq, sql } from "drizzle-orm";
import type { Database } from "@/db/client";
import { players } from "@/db/schema";

export type Player = { malId: number; name: string };

export type PlayerStore = {
  signIn(player: Player): Promise<void>;
  find(malId: number): Promise<Player | undefined>;
  count(): Promise<number>;
};

export function playerStore(database: Database): PlayerStore {
  return {
    async signIn({ malId, name }) {
      await database
        .insert(players)
        .values({ malId, name })
        .onConflictDoUpdate({ target: players.malId, set: { name, signedInAt: sql`now()` } });
    },
    async find(malId) {
      const [player] = await database
        .select({ malId: players.malId, name: players.name })
        .from(players)
        .where(eq(players.malId, malId));
      return player;
    },
    async count() {
      const [{ total }] = await database.select({ total: count() }).from(players);
      return total;
    },
  };
}
