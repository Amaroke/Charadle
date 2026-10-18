const officialEndpoint = "https://query.wikidata.org/sparql";
const timeoutMs = 3000;

type SparqlResponse = {
  results: { bindings: { label?: { value?: string } }[] };
};

export function wikidataClient({ endpoint = officialEndpoint }: { endpoint?: string } = {}) {
  return {
    async frenchTitle(malAnimeId: number): Promise<string | undefined> {
      const query = `SELECT ?label WHERE { ?anime wdt:P4086 "${Math.trunc(malAnimeId)}"; rdfs:label ?label. FILTER(LANG(?label) = "fr") } LIMIT 1`;
      const url = new URL(endpoint);
      url.search = new URLSearchParams({ query, format: "json" }).toString();
      const response = await fetch(url, {
        headers: { Accept: "application/sparql-results+json", "User-Agent": "Charadle (https://github.com/Amaroke/Charadle)" },
        signal: AbortSignal.timeout(timeoutMs),
      });
      if (!response.ok) throw new Error(`Wikidata answered ${response.status}`);
      const body = (await response.json()) as SparqlResponse;
      return body.results.bindings[0]?.label?.value?.trim() || undefined;
    },
  };
}
