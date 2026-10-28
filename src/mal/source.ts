import { cacheLife } from "next/cache";
import { PoolError, type Anime, type AnimeSource, type Character, type ListedAnime, type PoolProblem } from "@/game/draw";
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

async function cachedMalList(username: string): Promise<{ listed: ListedAnime[] } | { problem: PoolProblem }> {
  "use cache";
  try {
    const listed = await client().malList(username);
    cacheLife("minutes");
    return { listed };
  } catch (error) {
    if (!(error instanceof PoolError)) throw error;
    cacheLife("seconds");
    return { problem: error.problem };
  }
}

async function malList(username: string): Promise<ListedAnime[]> {
  const result = await cachedMalList(username.toLowerCase());
  if ("problem" in result) throw new PoolError(result.problem);
  return result.listed;
}

async function characters(animeId: number): Promise<Character[]> {
  "use cache";
  cacheLife("days");
  return client().characters(animeId);
}

export const malSource: AnimeSource = { topAnime, malList, characters };
