import { readFileSync } from "node:fs";
import { createServer } from "node:http";

const port = Number(process.env.FAKE_MAL_PORT ?? 3101);
const origin = `http://localhost:${port}`;
const picture = readFileSync(new URL("../public/images/logo.png", import.meta.url));

const ranking = {
  data: [{ node: { id: 21, title: "Wan Pīsu", alternative_titles: { en: "One Piece" } } }],
};

const characters = {
  data: [
    {
      node: {
        id: 40,
        first_name: "Luffy",
        last_name: "Monkey D.",
        alternative_name: "Straw Hat",
        main_picture: { medium: `${origin}/characters/40.png` },
      },
      role: "Main",
    },
    {
      node: { id: 723, first_name: "Nami", last_name: "", main_picture: { medium: `${origin}/characters/723.png` } },
      role: "Supporting",
    },
  ],
};

const frenchTitles = { 21: "One Piece (VF)" };

function sparql(query) {
  const animeId = query?.match(/wdt:P4086 "(\d+)"/)?.[1];
  const label = frenchTitles[animeId];
  return { results: { bindings: label ? [{ itemLabel: { "xml:lang": "fr", type: "literal", value: label } }] : [] } };
}

function json(response, body) {
  response.writeHead(200, { "content-type": "application/json" });
  response.end(JSON.stringify(body));
}

createServer((request, response) => {
  const { pathname, searchParams } = new URL(request.url, origin);
  if (pathname === "/sparql") return json(response, sparql(searchParams.get("query")));
  if (pathname.startsWith("/characters/")) {
    response.writeHead(200, { "content-type": "image/png" });
    return response.end(picture);
  }
  if (!request.headers["x-mal-client-id"]) {
    response.writeHead(401);
    return response.end();
  }
  if (pathname === "/v2/anime/ranking") return json(response, ranking);
  if (pathname === "/v2/anime/21/characters") return json(response, characters);
  response.writeHead(404);
  response.end();
}).listen(port);
