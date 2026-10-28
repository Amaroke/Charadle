import { afterEach, describe, expect, it, vi } from "vitest";
import { PoolError } from "@/game/draw";
import { malClient } from "@/mal/client";

function answer(...bodies: { body?: unknown; status?: number }[]) {
  const fetchMock = vi.fn<(url: URL, init?: RequestInit) => Promise<Response>>(async () => {
    const { body = {}, status = 200 } = bodies.shift() ?? {};
    return new Response(JSON.stringify(body), { status });
  });
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

function entry(id: number, status: string, score: number) {
  return { node: { id, title: `Anime ${id}`, alternative_titles: { en: `English ${id}` } }, list_status: { status, score } };
}

const client = malClient({ clientId: "client-id", baseUrl: "https://mal.example/v2" });

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("malClient.malList", () => {
  it("reads the anime of the MAL list with their watch status and rating", async () => {
    const fetchMock = answer({ body: { data: [entry(21, "completed", 9), entry(30, "plan_to_watch", 0)], paging: {} } });
    expect(await client.malList("luffy")).toEqual([
      { id: 21, title: "Anime 21", englishTitle: "English 21", status: "completed", score: 9 },
      { id: 30, title: "Anime 30", englishTitle: "English 30", status: "plan_to_watch", score: 0 },
    ]);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url.pathname).toBe("/v2/users/luffy/animelist");
    expect(url.searchParams.get("fields")).toBe("list_status,alternative_titles");
    expect(new Headers(init?.headers).get("X-MAL-CLIENT-ID")).toBe("client-id");
  });

  it("reads every page of a long MAL list", async () => {
    const fetchMock = answer(
      { body: { data: [entry(1, "completed", 8)], paging: { next: "https://api.myanimelist.net/v2/users/luffy/animelist?offset=1000" } } },
      { body: { data: [entry(2, "watching", 7)], paging: {} } },
    );
    expect((await client.malList("luffy")).map(({ id }) => id)).toEqual([1, 2]);
    expect(fetchMock.mock.calls.map(([url]) => url.searchParams.get("offset"))).toEqual(["0", "1000"]);
  });

  it("leaves out anime with an unknown watch status", async () => {
    answer({ body: { data: [entry(1, "rewatching", 8), entry(2, "dropped", 2)], paging: {} } });
    expect((await client.malList("luffy")).map(({ id }) => id)).toEqual([2]);
  });

  it("fails with an unknown user when the username does not exist", async () => {
    answer({ status: 404, body: { error: "not_found" } });
    await expect(client.malList("nobody")).rejects.toEqual(new PoolError("unknown-user"));
  });

  it("fails with a private list when the MAL list is not public", async () => {
    answer({ status: 403, body: { error: "forbidden" } });
    await expect(client.malList("secretive")).rejects.toEqual(new PoolError("private-list"));
  });

  it("fails like any MAL error otherwise", async () => {
    answer({ status: 500 });
    await expect(client.malList("luffy")).rejects.not.toBeInstanceOf(PoolError);
  });
});
