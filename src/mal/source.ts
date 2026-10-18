import { cacheLife } from "next/cache";
import type { Anime, AnimeSource, Character } from "@/game/draw";
import { tiers } from "@/game/settings";
import { malClient } from "@/mal/client";

function client(): AnimeSource {
  const clientId = process.env.MAL_CLIENT_ID;
  if (!clientId) throw new Error("MAL_CLIENT_ID is not set");
  return malClient({ clientId, baseUrl: process.env.MAL_API_URL || undefined });
}

const largestTier = Math.max(...tiers);

async function largestTop(): Promise<Anime[]> {
  "use cache";
  cacheLife("days");
  return client().topAnime(largestTier);
}

async function topAnime(limit: number): Promise<Anime[]> {
  return (await largestTop()).slice(0, limit);
}

async function characters(animeId: number): Promise<Character[]> {
  "use cache";
  cacheLife("days");
  return client().characters(animeId);
}

export const malSource: AnimeSource = { topAnime, characters };
