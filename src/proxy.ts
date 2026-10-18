import { NextResponse, type NextRequest } from "next/server";
import { localeCookie, localeOf, localizedPath, pickLocale } from "@/i18n/locales";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (localeOf(pathname)) return;

  const locale = pickLocale({
    saved: request.cookies.get(localeCookie)?.value,
    acceptLanguage: request.headers.get("accept-language") ?? undefined,
  });
  const url = request.nextUrl.clone();
  url.pathname = localizedPath(pathname, locale);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!_next/|api/|.*\\..*).*)"],
};
