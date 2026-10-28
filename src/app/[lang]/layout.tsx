import { Analytics } from "@vercel/analytics/next";
import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { playerName } from "@/auth/session";
import { Account } from "@/components/Account";
import { MergeGuestStats } from "@/components/GuestStats";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { currentLocale, getDictionary, type Dictionary } from "@/i18n/dictionaries";
import { locales } from "@/i18n/locales";
import "../globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDictionary();
  return {
    title: "Charadle",
    description: dict.home.tagline,
  };
}

export const viewport: Viewport = {
  themeColor: "#1d1d20",
};

async function SignedInAccount({ labels }: { labels: Dictionary["account"] }) {
  const name = await playerName();
  return (
    <>
      {name && <MergeGuestStats />}
      <Account labels={labels} name={name} />
    </>
  );
}

export default async function RootLayout({ children }: LayoutProps<"/[lang]">) {
  const locale = await currentLocale();
  const dict = await getDictionary();

  return (
    <html
      lang={locale}
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col font-sans xl:bg-[url(/images/background.png)] xl:bg-cover xl:bg-fixed xl:bg-no-repeat">
        <header className="bg-ink">
          <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-3">
            <Link href={`/${locale}`} className="flex items-center gap-3 hover:text-blossom">
              <Image src="/images/logo.png" alt="" width={32} height={32} priority />
              <span className="text-lg font-bold">Charadle</span>
            </Link>
            <div className="ml-auto flex items-center gap-2">
              <Link href={`/${locale}/stats`} className="rounded px-2 py-1 text-sm text-mist hover:text-blossom">
                {dict.stats.title}
              </Link>
              <Suspense>
                <SignedInAccount labels={dict.account} />
              </Suspense>
              <LanguageSwitcher
                locale={locale}
                labels={{ label: dict.languageSwitcher.label, names: dict.languages }}
              />
            </div>
          </div>
        </header>
        {children}
        <footer className="bg-ink px-4 py-4 text-center text-sm text-mist">
          © 2023 <a href="https://amaroke.github.io/Portfolio" className="text-sakura hover:text-blossom">Amaroke</a>
        </footer>
        <Analytics />
      </body>
    </html>
  );
}
