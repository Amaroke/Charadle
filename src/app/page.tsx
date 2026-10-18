import Image from "next/image";
import { SakuraPetals } from "@/components/SakuraPetals";

export default function Home() {
  return (
    <>
      <SakuraPetals />
      <header className="bg-ink">
        <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-3">
          <Image src="/images/logo.png" alt="" width={32} height={32} priority />
          <span className="text-lg font-bold">Charadle</span>
        </div>
      </header>
      <main className="flex flex-1 flex-col items-center justify-center gap-6 px-4 py-12 text-center">
        <Image
          src="/images/logo.png"
          alt="Charadle logo"
          width={128}
          height={128}
          priority
          className="size-24 drop-shadow-lg sm:size-32"
        />
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Chara<span className="text-sakura">dle</span>
        </h1>
        <p className="max-w-sm text-base text-mist sm:max-w-md sm:text-lg">
          Guess the anime character from their picture.
        </p>
      </main>
      <footer className="bg-ink px-4 py-4 text-center text-sm text-mist">
        © 2023 <a href="https://amaroke.github.io/Portfolio" className="text-sakura hover:text-blossom">Amaroke</a>
      </footer>
    </>
  );
}
