import type { Metadata } from "next";
import { Suspense } from "react";
import { signedInPlayer } from "@/auth/session";
import { GuestStatsDetails } from "@/components/GuestStats";
import { Stats } from "@/components/Stats";
import { database } from "@/db/client";
import { playerDailyStore } from "@/db/player-dailies";
import { getDictionary, type Dictionary } from "@/i18n/dictionaries";

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDictionary();
  return { title: `${dict.stats.title} · Charadle` };
}

async function PlayerStats({ labels }: { labels: Dictionary["stats"] }) {
  const player = await signedInPlayer();
  if (!player) {
    return (
      <>
        <p className="max-w-sm text-center text-sm text-mist">{labels.guest}</p>
        <GuestStatsDetails labels={labels} />
      </>
    );
  }
  return <Stats labels={labels} scores={await playerDailyStore(await database()).scores(player.malId)} />;
}

export default async function StatsPage() {
  const dict = await getDictionary();

  return (
    <main className="flex flex-1 flex-col items-center gap-6 px-4 py-8">
      <h1 className="text-3xl font-bold tracking-tight">{dict.stats.heading}</h1>
      <Suspense>
        <PlayerStats labels={dict.stats} />
      </Suspense>
    </main>
  );
}
