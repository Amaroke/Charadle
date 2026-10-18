import { currentTier, dailyScore, dailyTiers, guessesPerTier, isOver, type DailyProgress } from "@/game/daily";
import { fullName, type Anime, type DrawnCharacter } from "@/game/draw";
import type { Reveal } from "@/game/puzzle";
import type { Tier } from "@/game/settings";

export type DailyReveal = Reveal & {
  tier: Tier;
  found: boolean;
};

export type DailyView =
  | { status: "playing"; tier: Tier; picture: string; guessesLeft: number; revealed: DailyReveal[] }
  | { status: "over"; score: number; revealed: DailyReveal[] };

export async function dailyView(
  tiers: DrawnCharacter[],
  progress: DailyProgress,
  title: (anime: Anime) => Promise<string>,
): Promise<DailyView> {
  const ended = tiers.slice(0, progress.found ? progress.tier + 1 : progress.tier);
  const revealed = await Promise.all(
    ended.map(async ({ anime, character }, index) => ({
      tier: dailyTiers[index],
      found: progress.found && index === progress.tier,
      character: fullName(character),
      anime: await title(anime),
    })),
  );
  const tier = currentTier(progress);
  if (isOver(progress) || !tier) return { status: "over", score: dailyScore(progress), revealed };
  return {
    status: "playing",
    tier,
    picture: tiers[progress.tier].character.picture,
    guessesLeft: guessesPerTier - progress.misses,
    revealed,
  };
}
