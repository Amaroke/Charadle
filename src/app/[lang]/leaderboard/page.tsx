import type { Metadata } from "next";
import { connection } from "next/server";
import { Suspense } from "react";
import { Leaderboard } from "@/components/Leaderboard";
import { database } from "@/db/client";
import { playerDailyStore } from "@/db/player-dailies";
import { leaderboard, type Leaderboard as Board } from "@/game/leaderboard";
import { getDictionary, type Dictionary } from "@/i18n/dictionaries";

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDictionary();
  return { title: `${dict.leaderboard.title} · Charadle` };
}

async function loadBoard(): Promise<Board | undefined> {
  try {
    return leaderboard(await playerDailyStore(await database()).leaderboardPlayers(), new Date());
  } catch (error) {
    console.error("The Leaderboard could not be loaded", error);
    return undefined;
  }
}

async function TodaysBoard({ labels }: { labels: Dictionary["leaderboard"] }) {
  await connection();
  const board = await loadBoard();
  if (!board) return <p role="alert">{labels.error}</p>;
  return <Leaderboard labels={labels} board={board} />;
}

export default async function LeaderboardPage() {
  const dict = await getDictionary();

  return (
    <main className="flex flex-1 flex-col items-center gap-6 px-4 py-8">
      <h1 className="text-3xl font-bold tracking-tight">{dict.leaderboard.heading}</h1>
      <p className="max-w-sm text-center text-sm text-mist">{dict.leaderboard.note}</p>
      <Suspense>
        <TodaysBoard labels={dict.leaderboard} />
      </Suspense>
    </main>
  );
}
