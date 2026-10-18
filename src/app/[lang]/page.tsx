import Image from "next/image";
import { SakuraPetals } from "@/components/SakuraPetals";
import { getDictionary } from "@/i18n/dictionaries";

export default async function Home() {
  const dict = await getDictionary();

  return (
    <>
      <SakuraPetals />
      <main className="flex flex-1 flex-col items-center justify-center gap-6 px-4 py-12 text-center">
        <Image
          src="/images/logo.png"
          alt={dict.home.logoAlt}
          width={128}
          height={128}
          priority
          className="size-24 drop-shadow-lg sm:size-32"
        />
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Chara<span className="text-sakura">dle</span>
        </h1>
        <p className="max-w-sm text-base text-mist sm:max-w-md sm:text-lg">
          {dict.home.tagline}
        </p>
      </main>
    </>
  );
}
