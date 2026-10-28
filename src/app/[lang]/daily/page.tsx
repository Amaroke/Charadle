import type { Metadata } from "next";
import { connection } from "next/server";
import { Suspense } from "react";
import { signedInPlayer } from "@/auth/session";
import { Daily, DailySkeleton } from "@/components/Daily";
import { DailyPending } from "@/db/dailies";
import { readProgress, todaysDaily, viewOf, type TodaysDaily as Today } from "@/game/daily-game";
import { currentLocale, getDictionary, type Dictionary } from "@/i18n/dictionaries";
import type { Locale } from "@/i18n/locales";

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDictionary();
  return { title: `${dict.daily.title} · Charadle` };
}

async function today(): Promise<Today | "pending" | "error"> {
  try {
    return await todaysDaily();
  } catch (error) {
    console.error("The Daily could not be loaded", error);
    return error instanceof DailyPending ? "pending" : "error";
  }
}

async function TodaysDaily({ labels, locale }: { labels: Dictionary["daily"]; locale: Locale }) {
  await connection();
  const daily = await today();
  if (daily === "pending") return <p role="status">{labels.pending}</p>;
  if (daily === "error") return <p role="alert">{labels.error}</p>;
  const [view, player] = await Promise.all([
    readProgress(daily.date).then((progress) => viewOf(daily.tiers, progress, locale)),
    signedInPlayer(),
  ]);
  return <Daily labels={labels} locale={locale} date={daily.date} initialView={view} signedIn={!!player} />;
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
