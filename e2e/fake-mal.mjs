import { readFileSync } from "node:fs";
import { createServer } from "node:http";

const port = Number(process.env.FAKE_MAL_PORT ?? 3101);
const origin = `http://localhost:${port}`;
const picture = readFileSync(new URL("../public/images/logo.png", import.meta.url));

const dailyCasts = [
  { anime: { id: 20, title: "Naruto" }, character: { id: 17, first_name: "Naruto", last_name: "Uzumaki" } },
  { anime: { id: 5114, title: "Hagane no Renkinjutsushi" }, character: { id: 11, first_name: "Edward", last_name: "Elric" } },
  { anime: { id: 1535, title: "Death Note" }, character: { id: 80, first_name: "Light", last_name: "Yagami" } },
  { anime: { id: 16498, title: "Shingeki no Kyojin" }, character: { id: 40882, first_name: "Eren", last_name: "Yeager" } },
  { anime: { id: 813, title: "Dragon Ball Z" }, character: { id: 246, first_name: "Goku", last_name: "Son" } },
  { anime: { id: 38000, title: "Kimetsu no Yaiba" }, character: { id: 146156, first_name: "Tanjiro", last_name: "Kamado" } },
];

const ranking = {
  data: [
    { node: { id: 21, title: "Wan Pīsu", alternative_titles: { en: "One Piece" } } },
    ...dailyCasts.map(({ anime }) => ({ node: { ...anime, alternative_titles: {} } })),
  ],
};

const casts = {
  21: [
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
    { node: { id: 62, first_name: "Zoro", last_name: "Roronoa" }, role: "Supporting" },
    { node: { id: 305, first_name: "Sanji", last_name: "" }, role: "Supporting" },
  ],
  ...Object.fromEntries(
    dailyCasts.map(({ anime, character }) => [
      anime.id,
      [{ node: { ...character, main_picture: { medium: `${origin}/characters/${character.id}.png` } }, role: "Main" }],
    ]),
  ),
};

const animeLists = {
  luffyfan: {
    data: [
      { node: { id: 21, title: "Wan Pīsu", alternative_titles: { en: "One Piece" } }, list_status: { status: "completed", score: 9 } },
      { node: { id: 22, title: "Plan Only", alternative_titles: {} }, list_status: { status: "plan_to_watch", score: 0 } },
    ],
    paging: {},
  },
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
  const animeId = pathname.match(/^\/v2\/anime\/(\d+)\/characters$/)?.[1];
  if (casts[animeId]) return json(response, { data: casts[animeId] });
  const listOwner = pathname.match(/^\/v2\/users\/([^/]+)\/animelist$/)?.[1]?.toLowerCase();
  if (listOwner === "secretive") {
    response.writeHead(403, { "content-type": "application/json" });
    return response.end(JSON.stringify({ error: "forbidden" }));
  }
  if (listOwner && animeLists[listOwner]) return json(response, animeLists[listOwner]);
  response.writeHead(404);
  response.end();
}).listen(port);
