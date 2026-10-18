import { PoolError } from "@/game/draw";
import { drawPuzzle } from "@/game/puzzle";
import { parseSettings } from "@/game/settings";

export async function GET(request: Request): Promise<Response> {
  const { searchParams } = new URL(request.url);
  const settings = parseSettings(searchParams);
  if (!settings) return Response.json({ error: "Invalid settings" }, { status: 400 });
  try {
    const puzzle = await drawPuzzle(searchParams.get("locale"), settings);
    return Response.json(puzzle, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    if (!(error instanceof PoolError)) throw error;
    return Response.json({ problem: error.problem }, { status: 422, headers: { "Cache-Control": "no-store" } });
  }
}
