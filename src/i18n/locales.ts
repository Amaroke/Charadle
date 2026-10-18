export const locales = ["en", "fr"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";

export const localeCookie = "NEXT_LOCALE";

export function hasLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

function browserLocales(acceptLanguage: string): string[] {
  return acceptLanguage
    .split(",")
    .map((entry, index) => {
      const [tag, ...params] = entry.trim().split(";");
      const quality = params
        .map((param) => param.trim())
        .find((param) => param.startsWith("q="));
      const weight = quality ? Number(quality.slice(2)) : 1;
      return { language: tag.split("-")[0].toLowerCase(), weight, index };
    })
    .filter(({ language, weight }) => language && weight > 0)
    .sort((a, b) => b.weight - a.weight || a.index - b.index)
    .map(({ language }) => language);
}

export function pickLocale({
  saved,
  acceptLanguage,
}: {
  saved?: string;
  acceptLanguage?: string;
}): Locale {
  if (saved && hasLocale(saved)) return saved;
  const match = browserLocales(acceptLanguage ?? "").find(hasLocale);
  return match ?? defaultLocale;
}

export function localeOf(pathname: string): Locale | undefined {
  const segment = pathname.split("/")[1] ?? "";
  return hasLocale(segment) ? segment : undefined;
}

export function localizedPath(pathname: string, locale: Locale): string {
  const segments = pathname.split("/").filter(Boolean);
  if (segments[0] && hasLocale(segments[0])) segments.shift();
  return `/${[locale, ...segments].join("/")}`;
}
