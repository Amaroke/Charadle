import type { Metadata } from "next";
import { cookies } from "next/headers";
import { connection } from "next/server";
import { Suspense } from "react";
import { FreePlay, FreePlaySkeleton } from "@/components/FreePlay";
import { PoolError, type PoolProblem } from "@/game/draw";
import { drawPuzzle, type Puzzle } from "@/game/puzzle";
import { parseSettings, settingsCookie, type Settings } from "@/game/settings";
import { currentLocale, getDictionary, type Dictionary } from "@/i18n/dictionaries";
import type { Locale } from "@/i18n/locales";

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDictionary();
  return { title: `${dict.freePlay.title} · Charadle` };
}

async function firstDraw(locale: Locale, settings: Settings): Promise<{ puzzle?: Puzzle; problem?: PoolProblem }> {
  try {
    return { puzzle: await drawPuzzle(locale, settings) };
  } catch (error) {
    return { problem: error instanceof PoolError ? error.problem : undefined };
  }
}

async function FirstPuzzle({ labels, locale }: { labels: Dictionary["freePlay"]; locale: Locale }) {
  await connection();
  const settings = parseSettings(new URLSearchParams((await cookies()).get(settingsCookie)?.value));
  const { puzzle, problem } = settings ? await firstDraw(locale, settings) : {};
  return <FreePlay labels={labels} locale={locale} initialSettings={settings} initialPuzzle={puzzle} initialProblem={problem} />;
}

export default async function FreePlayPage() {
  const dict = await getDictionary();
  const locale = await currentLocale();

  return (
    <main className="flex flex-1 flex-col items-center gap-6 px-4 py-8">
      <h1 className="text-3xl font-bold tracking-tight">{dict.freePlay.title}</h1>
      <Suspense fallback={<FreePlaySkeleton label={dict.freePlay.loading} />}>
        <FirstPuzzle labels={dict.freePlay} locale={locale} />
      </Suspense>
    </main>
  );
}
