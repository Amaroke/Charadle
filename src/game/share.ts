import { dailyTiers } from "@/game/daily";
import type { DailyView } from "@/game/daily-view";

const firstDaily = "2026-10-18";
const oneDay = 24 * 60 * 60 * 1000;

export function dailyNumber(date: string): number {
  return Math.round((Date.parse(date) - Date.parse(firstDaily)) / oneDay) + 1;
}

export function shareText(date: string, { score, hintsUsed, revealed }: Extract<DailyView, { status: "over" }>): string {
  const tiers = revealed.map(({ found }) => (found ? "🟩" : "🟥")).join("");
  const hints = hintsUsed > 0 ? ` 💡${hintsUsed}` : "";
  return `Charadle #${dailyNumber(date)} ${tiers}${hints} ${score}/${dailyTiers.length}`;
}
