"use client";

import { usePathname } from "next/navigation";
import { localeCookie, localizedPath, locales, type Locale } from "@/i18n/locales";

type LanguageSwitcherProps = {
  locale: Locale;
  labels: { label: string; names: Record<Locale, string> };
};

const oneYear = 60 * 60 * 24 * 365;

function remember(locale: Locale) {
  document.cookie = `${localeCookie}=${locale}; max-age=${oneYear}; path=/; samesite=lax`;
}

export function LanguageSwitcher({ locale, labels }: LanguageSwitcherProps) {
  const pathname = usePathname();

  return (
    <nav aria-label={labels.label} className="flex gap-1 text-sm">
      {locales.map((option) => (
        <a
          key={option}
          href={localizedPath(pathname, option)}
          hrefLang={option}
          lang={option}
          aria-current={option === locale ? "true" : undefined}
          onClick={() => remember(option)}
          onAuxClick={() => remember(option)}
          className="rounded px-2 py-1 text-mist hover:text-blossom aria-[current]:font-bold aria-[current]:text-sakura"
        >
          {labels.names[option]}
        </a>
      ))}
    </nav>
  );
}
