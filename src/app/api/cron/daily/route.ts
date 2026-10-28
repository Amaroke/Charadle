import { forgetPreviousProgress, todaysDaily } from "@/game/daily-game";

function causeOf(error: unknown): string {
  const cause = error instanceof Error && error.cause !== undefined ? error.cause : error;
  return cause instanceof Error ? cause.message : String(cause);
}

export async function GET(request: Request): Promise<Response> {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { date } = await todaysDaily(new Date(), { force: true });
    await forgetPreviousProgress(date);
    return Response.json({ date }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("The Daily could not be drawn", error);
    return Response.json({ error: causeOf(error) }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}
