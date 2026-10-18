"use client";

import Image from "next/image";
import { useState, useTransition, type FormEvent } from "react";
import { guessDaily } from "@/game/daily-actions";
import { dailyTiers } from "@/game/daily";
import type { DailyReveal, DailyView } from "@/game/daily-view";
import { maxGuessLength } from "@/game/guess";
import type { Dictionary } from "@/i18n/dictionaries";
import type { Locale } from "@/i18n/locales";

type DailyProps = {
  labels: Dictionary["daily"];
  locale: Locale;
  date: string;
  initialView: DailyView;
};

type Feedback = "wrong" | "tierFailed" | "failed" | "expired";

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

export function Daily({ labels, locale, date, initialView }: DailyProps) {
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

  const alert = feedback && (
    <p role="alert" className="text-blossom">
      {labels[feedback]}{" "}
      {feedback === "expired" && (
        <a href={`/${locale}/daily`} className="text-sakura underline hover:text-blossom">{labels.reload}</a>
      )}
    </p>
  );

  if (view.status === "over") {
    return (
      <div className="flex w-full max-w-sm flex-col items-center gap-4">
        <section aria-live="polite" className="flex flex-col items-center gap-1 text-center">
          <p className="text-2xl font-bold text-sakura">{view.score > 0 ? labels.won : labels.lost}</p>
          <p className="text-lg">{fill(labels.score, { score: view.score, max: dailyTiers.length })}</p>
        </section>
        <Revealed labels={labels} revealed={view.revealed} />
        <p className="text-sm text-mist">{labels.comeBack}</p>
      </div>
    );
  }

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
