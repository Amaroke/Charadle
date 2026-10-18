import type { Anime, AnimeSource, Character } from "@/game/draw";

const officialApi = "https://api.myanimelist.net/v2";

type RankingResponse = {
  data: { node: { id: number; title: string; alternative_titles?: { en?: string } } }[];
};

type CharactersResponse = {
  data: {
    node: {
      id: number;
      first_name?: string;
      last_name?: string;
      alternative_name?: string;
      main_picture?: { medium?: string; large?: string };
    };
    role?: string;
  }[];
};

export function malClient({
  clientId,
  baseUrl = officialApi,
}: {
  clientId: string;
  baseUrl?: string;
}): AnimeSource {
  async function get<T>(path: string, params: Record<string, string>): Promise<T> {
    const url = new URL(`${baseUrl}${path}`);
    url.search = new URLSearchParams(params).toString();
    const response = await fetch(url, { headers: { "X-MAL-CLIENT-ID": clientId } });
    if (!response.ok) throw new Error(`MAL API ${path} answered ${response.status}`);
    return response.json() as Promise<T>;
  }

  return {
    async topAnime(limit): Promise<Anime[]> {
      const ranking = await get<RankingResponse>("/anime/ranking", {
        ranking_type: "bypopularity",
        limit: String(limit),
        fields: "alternative_titles",
      });
      return ranking.data.map(({ node }) => ({
        id: node.id,
        title: node.alternative_titles?.en || node.title,
      }));
    },

    async characters(animeId): Promise<Character[]> {
      const characters = await get<CharactersResponse>(`/anime/${animeId}/characters`, {
        limit: "100",
        fields: "first_name,last_name,alternative_name,main_picture,role",
      });
      return characters.data.map(({ node, role }) => ({
        id: node.id,
        firstName: node.first_name ?? "",
        lastName: node.last_name ?? "",
        aliases: (node.alternative_name ?? "")
          .split(",")
          .map((alias) => alias.trim())
          .filter(Boolean),
        picture: node.main_picture?.large ?? node.main_picture?.medium,
        role: role?.toLowerCase() === "main" ? "main" : "supporting",
      }));
    },
  };
}
