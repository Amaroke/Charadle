import { and, eq } from "drizzle-orm";
import type { Database } from "@/db/client";
import { playerDailies, players } from "@/db/schema";
import type { GuestStats } from "@/game/guest-stats";
import type { LeaderboardPlayer } from "@/game/leaderboard";

export type PlayerDailyStore = {
  record(malId: number, date: string, score: number): Promise<void>;
  merge(malId: number, stats: GuestStats): Promise<void>;
  scores(malId: number): Promise<GuestStats>;
  leaderboardScores(malId: number): Promise<GuestStats>;
  leaderboardPlayers(): Promise<LeaderboardPlayer[]>;
};

export function playerDailyStore(database: Database): PlayerDailyStore {
  async function scoresWhere(malId: number, leaderboardOnly: boolean): Promise<GuestStats> {
    const rows = await database
      .select({ date: playerDailies.date, score: playerDailies.score })
      .from(playerDailies)
      .where(and(eq(playerDailies.malId, malId), leaderboardOnly ? eq(playerDailies.merged, false) : undefined));
    return Object.fromEntries(rows.map(({ date, score }) => [date, score]));
  }

  return {
    async record(malId, date, score) {
      await database
        .insert(playerDailies)
        .values({ malId, date, score })
        .onConflictDoUpdate({
          target: [playerDailies.malId, playerDailies.date],
          set: { score, merged: false },
          setWhere: eq(playerDailies.merged, true),
        });
    },
    async merge(malId, stats) {
      const rows = Object.entries(stats).map(([date, score]) => ({ malId, date, score, merged: true }));
      if (rows.length === 0) return;
      await database.insert(playerDailies).values(rows).onConflictDoNothing();
    },
    scores: (malId) => scoresWhere(malId, false),
    leaderboardScores: (malId) => scoresWhere(malId, true),
    async leaderboardPlayers() {
      const rows = await database
        .select({ malId: players.malId, name: players.name, date: playerDailies.date, score: playerDailies.score })
        .from(playerDailies)
        .innerJoin(players, eq(players.malId, playerDailies.malId))
        .where(eq(playerDailies.merged, false));
      const byPlayer = new Map<number, LeaderboardPlayer>();
      for (const { malId, name, date, score } of rows) {
        const player = byPlayer.get(malId) ?? { name, scores: {} };
        player.scores[date] = score;
        byPlayer.set(malId, player);
      }
      return [...byPlayer.values()];
    },
  };
}
