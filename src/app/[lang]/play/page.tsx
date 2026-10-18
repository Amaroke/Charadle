import type { Metadata } from "next";
import { FreePlay } from "@/components/FreePlay";
import { getDictionary } from "@/i18n/dictionaries";

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDictionary();
  return { title: `${dict.freePlay.title} · Charadle` };
}

export default async function FreePlayPage() {
  const dict = await getDictionary();

  return (
    <main className="flex flex-1 flex-col items-center gap-6 px-4 py-8">
      <h1 className="text-3xl font-bold tracking-tight">{dict.freePlay.title}</h1>
      <FreePlay labels={dict.freePlay} />
    </main>
  );
}
