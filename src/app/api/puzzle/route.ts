import { drawPuzzle } from "@/game/puzzle";

export async function GET(request: Request): Promise<Response> {
  const locale = new URL(request.url).searchParams.get("locale");
  const puzzle = await drawPuzzle(locale);
  return Response.json(puzzle, { headers: { "Cache-Control": "no-store" } });
}
