import type { Metadata } from "next";
import { connection } from "next/server";
import { Suspense } from "react";
import { FreePlay, FreePlaySkeleton } from "@/components/FreePlay";
import { startPuzzle } from "@/game/actions";
import { getDictionary, type Dictionary } from "@/i18n/dictionaries";

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDictionary();
  return { title: `${dict.freePlay.title} · Charadle` };
}

async function FirstPuzzle({ labels }: { labels: Dictionary["freePlay"] }) {
  await connection();
  const puzzle = await startPuzzle().catch(() => undefined);
  return <FreePlay labels={labels} initialPuzzle={puzzle} />;
}

export default async function FreePlayPage() {
  const dict = await getDictionary();

  return (
    <main className="flex flex-1 flex-col items-center gap-6 px-4 py-8">
      <h1 className="text-3xl font-bold tracking-tight">{dict.freePlay.title}</h1>
      <Suspense fallback={<FreePlaySkeleton label={dict.freePlay.loading} />}>
        <FirstPuzzle labels={dict.freePlay} />
      </Suspense>
    </main>
  );
}
