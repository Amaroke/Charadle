import Image from "next/image";
import Link from "next/link";
import { SakuraPetals } from "@/components/SakuraPetals";
import { currentLocale, getDictionary } from "@/i18n/dictionaries";

export default async function Home() {
  const locale = await currentLocale();
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
        <div className="flex flex-wrap justify-center gap-3">
          <Link
            href={`/${locale}/daily`}
            className="relative rounded bg-sakura px-6 py-3 text-lg font-bold text-ink hover:bg-blossom"
          >
            {dict.home.daily}
          </Link>
          <Link
            href={`/${locale}/play`}
            className="relative rounded border border-sakura px-6 py-3 text-lg font-bold text-sakura hover:bg-sakura hover:text-ink"
          >
            {dict.home.play}
          </Link>
        </div>
      </main>
    </>
  );
}
