import { cacheLife } from "next/cache";
import { wikidataClient } from "@/wikidata/client";

export async function frenchTitle(malAnimeId: number): Promise<string | undefined> {
  "use cache";
  try {
    const title = await wikidataClient({ endpoint: process.env.WIKIDATA_URL || undefined }).frenchTitle(malAnimeId);
    cacheLife("days");
    return title;
  } catch {
    cacheLife("minutes");
    return undefined;
  }
}
