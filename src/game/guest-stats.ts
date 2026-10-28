import { dailyTiers } from "@/game/daily";

export type GuestStats = Record<string, number>;

export type StatsSummary = {
  played: number;
  won: number;
  average: number;
};

const datePattern = /^\d{4}-\d{2}-\d{2}$/;

function isDailyDate(date: string): boolean {
  if (!datePattern.test(date)) return false;
  const time = Date.parse(`${date}T00:00:00Z`);
  return !Number.isNaN(time) && new Date(time).toISOString().startsWith(date);
}

function isDailyScore(value: unknown): value is number {
  return Number.isInteger(value) && (value as number) >= 0 && (value as number) <= dailyTiers.length;
}

export function parseGuestStats(raw: string | null): GuestStats {
  let parsed: unknown;
  try {
    parsed = raw ? JSON.parse(raw) : undefined;
  } catch {
    return {};
  }
  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) return {};
  return Object.fromEntries(
    Object.entries(parsed).filter(([date, score]) => isDailyDate(date) && isDailyScore(score)),
  );
}

export function withDaily(stats: GuestStats, date: string, score: number): GuestStats {
  return date in stats ? stats : { ...stats, [date]: score };
}

export function summarize(stats: GuestStats): StatsSummary {
  const scores = Object.values(stats);
  const total = scores.reduce((sum, score) => sum + score, 0);
  return {
    played: scores.length,
    won: scores.filter((score) => score > 0).length,
    average: scores.length ? Math.round((total / scores.length) * 10) / 10 : 0,
  };
}

export function distribution(stats: GuestStats): number[] {
  const counts = Array.from({ length: dailyTiers.length + 1 }, () => 0);
  Object.values(stats).forEach((score) => counts[score]++);
  return counts;
}
