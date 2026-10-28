import { dailyDate } from "@/game/daily";
import type { GuestStats } from "@/game/guest-stats";

export type LeaderboardPlayer = { name: string; scores: GuestStats };

export type Standing = { name: string; value: number };

export type Leaderboard = { today: Standing[]; average: Standing[]; streak: Standing[] };

export const minimumDailiesForAverage = 7;
const defaultSize = 10;
const dayMs = 24 * 60 * 60 * 1000;

function previousDate(date: string): string {
  return new Date(Date.parse(`${date}T00:00:00Z`) - dayMs).toISOString().slice(0, 10);
}

export function currentStreak(scores: GuestStats, now: Date): number {
  let date = dailyDate(now);
  if (!(date in scores)) date = previousDate(date);
  let streak = 0;
  while ((scores[date] ?? 0) >= 1) {
    streak++;
    date = previousDate(date);
  }
  return streak;
}

function rank(entries: Standing[], size: number): Standing[] {
  return entries.sort((a, b) => b.value - a.value || a.name.localeCompare(b.name)).slice(0, size);
}

function averageOf(scores: GuestStats): number | undefined {
  const values = Object.values(scores);
  if (values.length < minimumDailiesForAverage) return undefined;
  return values.reduce((sum, score) => sum + score, 0) / values.length;
}

export function leaderboard(players: LeaderboardPlayer[], now: Date, size = defaultSize): Leaderboard {
  const today = dailyDate(now);
  return {
    today: rank(
      players.filter(({ scores }) => today in scores).map(({ name, scores }) => ({ name, value: scores[today] })),
      size,
    ),
    average: rank(
      players.flatMap(({ name, scores }) => {
        const value = averageOf(scores);
        return value === undefined ? [] : [{ name, value }];
      }),
      size,
    ).map(({ name, value }) => ({ name, value: Math.round(value * 10) / 10 })),
    streak: rank(
      players.map(({ name, scores }) => ({ name, value: currentStreak(scores, now) })).filter(({ value }) => value > 0),
      size,
    ),
  };
}
