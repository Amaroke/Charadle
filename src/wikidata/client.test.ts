import { afterEach, describe, expect, it, vi } from "vitest";
import { wikidataClient } from "@/wikidata/client";

function answer(body: unknown, status = 200) {
  const fetchMock = vi.fn<(url: URL) => Promise<Response>>(async () => new Response(JSON.stringify(body), { status }));
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

const client = wikidataClient({ endpoint: "https://wikidata.example/sparql" });

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("wikidataClient", () => {
  it("asks for the French label of the anime with this MAL ID", async () => {
    const fetchMock = answer({ results: { bindings: [{ itemLabel: { value: "L'Attaque des Titans" } }] } });
    expect(await client.frenchTitle(16498)).toBe("L'Attaque des Titans");
    const query = fetchMock.mock.calls[0][0].searchParams.get("query");
    expect(query).toContain('wdt:P4086 "16498"');
    expect(query).toContain('LANG(?itemLabel) = "fr"');
  });

  it("prefers the French label of the series a season belongs to", async () => {
    answer({
      results: {
        bindings: [
          { itemLabel: { value: "saison 1 de L'Attaque des Titans" }, seriesLabel: { value: "L'Attaque des Titans" } },
          { itemLabel: { value: "L'Attaque des Titans" } },
        ],
      },
    });
    expect(await client.frenchTitle(16498)).toBe("L'Attaque des Titans");
  });

  it("keeps the label of a season whose series has no French label", async () => {
    answer({ results: { bindings: [{ itemLabel: { value: "Saison 2 de Jujutsu Kaisen" } }] } });
    expect(await client.frenchTitle(51009)).toBe("Saison 2 de Jujutsu Kaisen");
  });

  it("finds no title when the anime has no French label", async () => {
    answer({ results: { bindings: [] } });
    expect(await client.frenchTitle(21)).toBeUndefined();
  });

  it("finds no title when the label is blank", async () => {
    answer({ results: { bindings: [{ itemLabel: { value: "  " } }] } });
    expect(await client.frenchTitle(21)).toBeUndefined();
  });

  it("fails when Wikidata answers with an error", async () => {
    answer({}, 503);
    await expect(client.frenchTitle(21)).rejects.toThrow();
  });
});
