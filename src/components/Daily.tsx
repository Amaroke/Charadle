"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, useTransition, type FormEvent } from "react";
import { GuestStatsSummary, saveDaily } from "@/components/GuestStats";
import { guessDaily, hintDaily } from "@/game/daily-actions";
import { dailyTiers } from "@/game/daily";
import type { DailyReveal, DailyView } from "@/game/daily-view";
import { maxGuessLength } from "@/game/guess";
import type { HintKind } from "@/game/hint";
import { shareText } from "@/game/share";
import type { Dictionary } from "@/i18n/dictionaries";
import type { Locale } from "@/i18n/locales";

type DailyProps = {
  labels: Dictionary["daily"];
  locale: Locale;
  date: string;
  initialView: DailyView;
  signedIn: boolean;
};

type Feedback = "wrong" | "tierFailed" | "failed" | "expired";
type Shared = "copied" | "shareFailed";

function fill(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) => String(values[key] ?? match));
}

function feedbackOf(before: DailyView, after: DailyView, correct: boolean): Feedback | undefined {
  if (correct || after.status === "over") return undefined;
  return before.status === "playing" && after.tier === before.tier ? "wrong" : "tierFailed";
}

function Revealed({ labels, revealed }: { labels: Dictionary["daily"]; revealed: DailyReveal[] }) {
  if (revealed.length === 0) return null;
  return (
    <ol aria-label={labels.revealed} className="flex w-full flex-col gap-1 text-sm">
      {revealed.map(({ tier, found, character, anime }) => (
        <li key={tier} className="flex justify-between gap-2 rounded border border-mist/40 px-3 py-1">
          <span className="text-mist">{fill(labels.tier, { tier })}</span>
          <span className="text-right">
            <span className="font-bold">{character}</span> <span className="text-mist">· {anime}</span>{" "}
            <span className={found ? "text-sakura" : "text-blossom"}>{found ? labels.found : labels.missed}</span>
          </span>
        </li>
      ))}
    </ol>
  );
}

async function share(text: string): Promise<Shared | undefined> {
  if (typeof navigator.share === "function" && matchMedia("(pointer: coarse)").matches) {
    try {
      await navigator.share({ text });
      return undefined;
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return undefined;
    }
  }
  try {
    await navigator.clipboard.writeText(text);
    return "copied";
  } catch {
    return "shareFailed";
  }
}

type EndedProps = {
  labels: Dictionary["daily"];
  locale: Locale;
  date: string;
  view: Extract<DailyView, { status: "over" }>;
  signedIn: boolean;
};

function Ended({ labels, locale, date, view, signedIn }: EndedProps) {
  const [shared, setShared] = useState<Shared>();

  useEffect(() => saveDaily(date, view.score), [date, view.score]);

  return (
    <div className="flex w-full max-w-sm flex-col items-center gap-4">
      <section aria-live="polite" className="flex flex-col items-center gap-1 text-center">
        <p className="text-2xl font-bold text-sakura">{view.revealed.some(({ found }) => found) ? labels.won : labels.lost}</p>
        <p className="text-lg">{fill(labels.score, { score: view.score, max: dailyTiers.length })}</p>
      </section>
      <button
        type="button"
        onClick={async () => setShared(await share(shareText(date, view)))}
        className="rounded bg-sakura px-4 py-2 font-bold text-ink hover:bg-blossom"
      >
        {labels.share}
      </button>
      {shared && <p role="status" className="text-sm text-mist">{labels[shared]}</p>}
      <Revealed labels={labels} revealed={view.revealed} />
      {signedIn ? (
        <Link href={`/${locale}/stats`} className="text-sakura underline hover:text-blossom">{labels.myStats}</Link>
      ) : (
        <GuestStatsSummary labels={labels} />
      )}
      <p className="text-sm text-mist">{labels.comeBack}</p>
      <Link href={`/${locale}`} className="text-sakura underline hover:text-blossom">{labels.home}</Link>
    </div>
  );
}

export function Daily({ labels, locale, date, initialView, signedIn }: DailyProps) {
  const [view, setView] = useState(initialView);
  const [guess, setGuess] = useState("");
  const [feedback, setFeedback] = useState<Feedback>();
  const [pending, startTransition] = useTransition();

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!guess.trim()) return;
    startTransition(async () => {
      try {
        const result = await guessDaily(date, guess, locale);
        if (result.expired) return setFeedback("expired");
        setFeedback(feedbackOf(view, result.view, result.correct));
        setView(result.view);
        setGuess("");
      } catch {
        setFeedback("failed");
      }
    });
  }

  function reveal(kind: HintKind) {
    startTransition(async () => {
      try {
        const result = await hintDaily(date, kind, locale);
        if (result.expired) return setFeedback("expired");
        setFeedback((current) => (current === "failed" || current === "expired" ? undefined : current));
        setView(result.view);
      } catch {
        setFeedback("failed");
      }
    });
  }

  const alert = feedback && (
    <p role="alert" className="text-blossom">
      {labels[feedback]}{" "}
      {feedback === "expired" && (
        <a href={`/${locale}/daily`} className="text-sakura underline hover:text-blossom">{labels.reload}</a>
      )}
    </p>
  );

  if (view.status === "over") return <Ended labels={labels} locale={locale} date={date} view={view} signedIn={signedIn} />;

  const hintRows: { kind: HintKind; label: string; button: string }[] = [
    { kind: "anime", label: labels.anime, button: labels.hintAnime },
    { kind: "initials", label: labels.initials, button: labels.hintInitials },
  ];

  return (
    <div className="flex w-full max-w-sm flex-col items-center gap-4">
      <p className="flex w-full justify-between text-sm">
        <span className="font-bold text-sakura">{fill(labels.tier, { tier: view.tier })}</span>
        <span className="text-mist">{fill(labels.guessesLeft, { count: view.guessesLeft })}</span>
      </p>
      <div className="flex h-87.5 items-center justify-center">
        <Image
          key={view.picture}
          src={view.picture}
          alt={labels.pictureAlt}
          width={225}
          height={350}
          unoptimized
          priority
          className="h-auto max-h-87.5 w-auto rounded-lg shadow-lg"
        />
      </div>
      <form onSubmit={submit} className="flex w-full gap-2">
        <label htmlFor="daily-guess" className="sr-only">{labels.guessLabel}</label>
        <input
          id="daily-guess"
          value={guess}
          onChange={(event) => setGuess(event.target.value)}
          placeholder={labels.guessPlaceholder}
          autoComplete="off"
          maxLength={maxGuessLength}
          className="min-w-0 flex-1 rounded border border-mist/40 bg-ink px-3 py-2 placeholder:text-mist focus:border-sakura focus:outline-none"
        />
        <button type="submit" disabled={pending} className="rounded bg-sakura px-4 py-2 font-bold text-ink hover:bg-blossom disabled:opacity-60">
          {labels.submit}
        </button>
      </form>
      {alert}
      <section aria-label={labels.hints} className="flex w-full flex-col items-center gap-2">
        {hintRows.map(({ kind, label, button }) =>
          kind in view.hints ? (
            <p key={kind} className="rounded border border-mist/40 px-3 py-1 text-sm">
              <span className="text-mist">{label} </span>
              <span className="font-bold">{view.hints[kind]}</span>
            </p>
          ) : (
            <button
              key={kind}
              type="button"
              onClick={() => reveal(kind)}
              disabled={pending}
              className="rounded border border-sakura px-3 py-1 text-sm text-sakura hover:bg-sakura hover:text-ink disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-sakura"
            >
              {button}
            </button>
          ),
        )}
      </section>
      <Revealed labels={labels} revealed={view.revealed} />
    </div>
  );
}

export function DailySkeleton({ label }: { label: string }) {
  return (
    <div className="flex w-full max-w-sm flex-col items-center gap-4" aria-busy="true">
      <p role="status" className="sr-only">{label}</p>
      <div className="h-5 w-full animate-pulse rounded bg-ink" />
      <div className="h-87.5 w-56.25 animate-pulse rounded-lg bg-ink" />
      <div className="flex w-full gap-2">
        <div className="h-10.5 flex-1 animate-pulse rounded bg-ink" />
        <div className="h-10.5 w-20 animate-pulse rounded bg-ink" />
      </div>
    </div>
  );
}
