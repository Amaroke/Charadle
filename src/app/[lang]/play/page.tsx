import type { Metadata } from "next";
import { connection } from "next/server";
import { Suspense } from "react";
import { FreePlay, FreePlaySkeleton } from "@/components/FreePlay";
import { drawPuzzle } from "@/game/puzzle";
import { currentLocale, getDictionary, type Dictionary } from "@/i18n/dictionaries";
import type { Locale } from "@/i18n/locales";

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDictionary();
  return { title: `${dict.freePlay.title} · Charadle` };
}

async function FirstPuzzle({ labels, locale }: { labels: Dictionary["freePlay"]; locale: Locale }) {
  await connection();
  const puzzle = await drawPuzzle(locale).catch(() => undefined);
  return <FreePlay labels={labels} locale={locale} initialPuzzle={puzzle} />;
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
