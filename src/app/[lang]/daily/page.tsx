import type { Metadata } from "next";
import { connection } from "next/server";
import { Suspense } from "react";
import { Daily, DailySkeleton } from "@/components/Daily";
import { readProgress, todaysDaily, viewOf, type TodaysDaily as Today } from "@/game/daily-game";
import { currentLocale, getDictionary, type Dictionary } from "@/i18n/dictionaries";
import type { Locale } from "@/i18n/locales";

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDictionary();
  return { title: `${dict.daily.title} · Charadle` };
}

async function today(): Promise<Today | undefined> {
  try {
    return await todaysDaily();
  } catch (error) {
    console.error("The Daily could not be loaded", error);
    return undefined;
  }
}

async function TodaysDaily({ labels, locale }: { labels: Dictionary["daily"]; locale: Locale }) {
  await connection();
  const daily = await today();
  if (!daily) return <p role="alert">{labels.error}</p>;
  const view = await viewOf(daily.tiers, await readProgress(daily.date), locale);
  return <Daily labels={labels} locale={locale} date={daily.date} initialView={view} />;
}

export default async function DailyPage() {
  const dict = await getDictionary();
  const locale = await currentLocale();

  return (
    <main className="flex flex-1 flex-col items-center gap-6 px-4 py-8">
      <h1 className="text-3xl font-bold tracking-tight">{dict.daily.title}</h1>
      <Suspense fallback={<DailySkeleton label={dict.daily.loading} />}>
        <TodaysDaily labels={dict.daily} locale={locale} />
      </Suspense>
    </main>
  );
}
