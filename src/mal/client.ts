import { PoolError, type Anime, type AnimeSource, type Character, type ListedAnime } from "@/game/draw";
import { isWatchStatus } from "@/game/settings";

const officialApi = "https://api.myanimelist.net/v2";

type RankingResponse = {
  data: { node: { id: number; title: string; alternative_titles?: { en?: string } } }[];
};

type AnimeListResponse = {
  data: {
    node: { id: number; title: string; alternative_titles?: { en?: string } };
    list_status?: { status?: string; score?: number };
  }[];
  paging?: { next?: string };
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

const listPageSize = 1000;
const maxListPages = 20;

class MalHttpError extends Error {
  constructor(
    path: string,
    readonly status: number,
  ) {
    super(`MAL API ${path} answered ${status}`);
  }
}

const listProblems: Partial<Record<number, PoolError["problem"]>> = { 403: "private-list", 404: "unknown-user" };

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
    if (!response.ok) throw new MalHttpError(path, response.status);
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
        title: node.title,
        englishTitle: node.alternative_titles?.en,
      }));
    },

    async malList(username): Promise<ListedAnime[]> {
      const listed: ListedAnime[] = [];
      for (let page = 0; page < maxListPages; page++) {
        const list = await get<AnimeListResponse>(`/users/${encodeURIComponent(username)}/animelist`, {
          fields: "list_status,alternative_titles",
          limit: String(listPageSize),
          offset: String(page * listPageSize),
        }).catch((error: unknown) => {
          const problem = error instanceof MalHttpError ? listProblems[error.status] : undefined;
          throw problem ? new PoolError(problem) : error;
        });
        for (const { node, list_status } of list.data) {
          if (!isWatchStatus(list_status?.status)) continue;
          listed.push({
            id: node.id,
            title: node.title,
            englishTitle: node.alternative_titles?.en,
            status: list_status.status,
            score: list_status.score ?? 0,
          });
        }
        if (!list.paging?.next) break;
      }
      return listed;
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
