"use server";

import { signedInPlayer } from "@/auth/session";
import { database } from "@/db/client";
import { playerDailyStore } from "@/db/player-dailies";
import { dailyDate } from "@/game/daily";
import { parseGuestStats } from "@/game/guest-stats";

const maxStatsLength = 100_000;

export async function mergeGuestStats(raw: string): Promise<boolean> {
  const player = await signedInPlayer();
  if (!player || typeof raw !== "string" || raw.length > maxStatsLength) return false;
  const today = dailyDate(new Date());
  const played = Object.entries(parseGuestStats(raw)).filter(([date]) => date <= today);
  await playerDailyStore(await database()).merge(player.malId, Object.fromEntries(played));
  return true;
}
