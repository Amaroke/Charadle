const officialEndpoint = "https://query.wikidata.org/sparql";
const timeoutMs = 3000;

type Label = { value?: string };

type SparqlResponse = {
  results: { bindings: { itemLabel?: Label; seriesLabel?: Label }[] };
};

function frenchLabelsQuery(malAnimeId: number): string {
  return `SELECT ?itemLabel ?seriesLabel WHERE {
  ?item wdt:P4086 "${Math.trunc(malAnimeId)}".
  OPTIONAL { ?item rdfs:label ?itemLabel. FILTER(LANG(?itemLabel) = "fr") }
  OPTIONAL { ?item wdt:P179 ?series. ?series rdfs:label ?seriesLabel. FILTER(LANG(?seriesLabel) = "fr") }
}`;
}

function firstLabel(labels: (Label | undefined)[]): string | undefined {
  return labels.map((label) => label?.value?.trim()).find(Boolean);
}

export function wikidataClient({ endpoint = officialEndpoint }: { endpoint?: string } = {}) {
  return {
    async frenchTitle(malAnimeId: number): Promise<string | undefined> {
      const url = new URL(endpoint);
      url.search = new URLSearchParams({ query: frenchLabelsQuery(malAnimeId), format: "json" }).toString();
      const response = await fetch(url, {
        headers: { Accept: "application/sparql-results+json", "User-Agent": "Charadle (https://github.com/Amaroke/Charadle)" },
        signal: AbortSignal.timeout(timeoutMs),
      });
      if (!response.ok) throw new Error(`Wikidata answered ${response.status}`);
      const { bindings } = ((await response.json()) as SparqlResponse).results;
      return firstLabel(bindings.map((row) => row.seriesLabel)) ?? firstLabel(bindings.map((row) => row.itemLabel));
    },
  };
}
