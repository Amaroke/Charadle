import { forgetPreviousProgress, todaysDaily } from "@/game/daily-game";

export async function GET(request: Request): Promise<Response> {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { date } = await todaysDaily();
  await forgetPreviousProgress(date);
  return Response.json({ date }, { headers: { "Cache-Control": "no-store" } });
}
