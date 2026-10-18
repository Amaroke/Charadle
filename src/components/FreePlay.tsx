"use client";

import Image from "next/image";
import { useEffect, useRef, useState, useTransition, type FormEvent } from "react";
import { giveUp, submitGuess } from "@/game/actions";
import { PoolError, poolProblems, type PoolProblem } from "@/game/draw";
import type { HintKind } from "@/game/hint";
import type { Puzzle, Reveal } from "@/game/puzzle";
import { defaultSettings, settingsCookie, settingsParams, type Settings } from "@/game/settings";
import type { Dictionary } from "@/i18n/dictionaries";
import type { Locale } from "@/i18n/locales";
import { FreePlaySettings } from "@/components/FreePlaySettings";

type FreePlayProps = {
  labels: Dictionary["freePlay"];
  locale: Locale;
  initialSettings?: Settings;
  initialPuzzle?: Puzzle;
  initialProblem?: PoolProblem;
};

type Game =
  | { status: "error"; attempted: Settings; problem?: PoolProblem }
  | { status: "playing"; puzzle: Puzzle; feedback?: "wrong" | "failed" }
  | { status: "over"; puzzle: Puzzle; won: boolean; reveal: Reveal };

type State = Game | { status: "settings"; previous?: Game };

const problemLabels = {
  "unknown-user": "unknownUser",
  "private-list": "privateList",
  "empty-pool": "emptyPool",
} as const satisfies Record<PoolProblem, keyof Dictionary["freePlay"]>;

const oneYear = 60 * 60 * 24 * 365;

function remember(settings: Settings) {
  document.cookie = `${settingsCookie}=${settingsParams(settings)}; max-age=${oneYear}; path=/; samesite=lax`;
}

function preloadPicture(src: string): Promise<void> {
  return new Promise((resolve) => {
    const picture = new window.Image();
    picture.onload = () => resolve();
    picture.onerror = () => resolve();
    picture.src = src;
  });
}

async function drawWithPicture(locale: Locale, settings: Settings): Promise<Puzzle> {
  const params = settingsParams(settings);
  params.set("locale", locale);
  const response = await fetch(`/api/puzzle?${params}`, { cache: "no-store" });
  if (response.status === 422) {
    const { problem } = (await response.json()) as { problem?: PoolProblem };
    if (problem && poolProblems.includes(problem)) throw new PoolError(problem);
  }
  if (!response.ok) throw new Error(`Puzzle draw answered ${response.status}`);
  const puzzle = (await response.json()) as Puzzle;
  await preloadPicture(puzzle.picture);
  return puzzle;
}

function sameSettings(a: Settings, b: Settings): boolean {
  return settingsParams(a).toString() === settingsParams(b).toString();
}

function initialState(settings?: Settings, puzzle?: Puzzle, problem?: PoolProblem): State {
  if (!settings) return { status: "settings" };
  return puzzle ? { status: "playing", puzzle } : { status: "error", attempted: settings, problem };
}

export function FreePlay({ labels, locale, initialSettings, initialPuzzle, initialProblem }: FreePlayProps) {
  const [state, setState] = useState<State>(() => initialState(initialSettings, initialPuzzle, initialProblem));
  const [settings, setSettings] = useState<Settings | undefined>(initialSettings);
  const [guess, setGuess] = useState("");
  const [usedHints, setUsedHints] = useState<HintKind[]>([]);
  const [pending, startTransition] = useTransition();
  const upcoming = useRef<{ settings: Settings; draw: Promise<Puzzle> } | null>(null);
  const game = state.status === "settings" ? state.previous : state;
  const ticket = game && game.status !== "error" ? game.puzzle.ticket : undefined;

  useEffect(() => {
    if (!ticket || !settings) return;
    const draw = drawWithPicture(locale, settings);
    draw.catch(() => {});
    upcoming.current = { settings, draw };
  }, [ticket, locale, settings]);

  function play(chosen: Settings) {
    const preloaded = upcoming.current && sameSettings(upcoming.current.settings, chosen) ? upcoming.current : null;
    const draw = preloaded?.draw ?? drawWithPicture(locale, chosen);
    upcoming.current = null;
    startTransition(async () => {
      try {
        const puzzle = await draw;
        setGuess("");
        setUsedHints([]);
        remember(chosen);
        setSettings(chosen);
        setState({ status: "playing", puzzle });
      } catch (error) {
        setState({ status: "error", attempted: chosen, problem: error instanceof PoolError ? error.problem : undefined });
      }
    });
  }

  function next() {
    if (settings) play(settings);
  }

  const settingsButton = (
    <button
      type="button"
      onClick={() => setState({ status: "settings", previous: game })}
      disabled={pending}
      className="text-sm text-mist underline hover:text-blossom"
    >
      {labels.settings}
    </button>
  );

  if (state.status === "settings") {
    const { previous } = state;
    return (
      <FreePlaySettings
        labels={labels}
        settings={previous?.status === "error" ? previous.attempted : (settings ?? defaultSettings)}
        pending={pending}
        onPlay={play}
        onCancel={previous && (() => setState(previous))}
      />
    );
  }

  if (state.status === "error") {
    return (
      <div className="flex flex-col items-center gap-3">
        <p role="alert">{state.problem ? labels[problemLabels[state.problem]] : labels.error}</p>
        {!state.problem && (
          <button type="button" onClick={() => play(state.attempted)} disabled={pending} className="rounded bg-sakura px-4 py-2 font-bold text-ink hover:bg-blossom disabled:opacity-60">
            {labels.retry}
          </button>
        )}
        {settingsButton}
      </div>
    );
  }

  const { puzzle } = state;

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!guess.trim()) return;
    startTransition(async () => {
      try {
        const result = await submitGuess(puzzle.ticket, guess);
        if (result.correct) setState({ status: "over", puzzle, won: true, reveal: result.reveal });
        else setState({ status: "playing", puzzle, feedback: "wrong" });
      } catch {
        setState({ status: "playing", puzzle, feedback: "failed" });
      }
    });
  }

  function abandon() {
    startTransition(async () => {
      try {
        setState({ status: "over", puzzle, won: false, reveal: await giveUp(puzzle.ticket) });
      } catch {
        setState({ status: "playing", puzzle, feedback: "failed" });
      }
    });
  }

  const hintRows: { kind: HintKind; label: string; button: string }[] = [
    { kind: "anime", label: labels.anime, button: labels.hintAnime },
    { kind: "initials", label: labels.initials, button: labels.hintInitials },
  ];

  const hintSection = (
    <section aria-label={labels.hints} className="flex w-full flex-col items-center gap-2">
      {hintRows.map(({ kind, label, button }) =>
        usedHints.includes(kind) ? (
          <p key={kind} className="rounded border border-mist/40 px-3 py-1 text-sm">
            <span className="text-mist">{label} </span>
            <span className="font-bold">{puzzle.hints[kind]}</span>
          </p>
        ) : (
          <button
            key={kind}
            type="button"
            onClick={() => setUsedHints((current) => [...current, kind])}
            disabled={state.status !== "playing"}
            className="rounded border border-sakura px-3 py-1 text-sm text-sakura hover:bg-sakura hover:text-ink disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-sakura"
          >
            {button}
          </button>
        ),
      )}
    </section>
  );

  return (
    <div className="flex w-full max-w-sm flex-col items-center gap-4">
      <div className="flex h-87.5 items-center justify-center">
        <Image
          key={puzzle.ticket}
          src={puzzle.picture}
          alt={labels.pictureAlt}
          width={225}
          height={350}
          unoptimized
          priority
          className="h-auto max-h-87.5 w-auto rounded-lg shadow-lg"
        />
      </div>
      {state.status === "playing" ? (
        <>
          <form onSubmit={submit} className="flex w-full gap-2">
            <label htmlFor="guess" className="sr-only">{labels.guessLabel}</label>
            <input
              id="guess"
              value={guess}
              onChange={(event) => setGuess(event.target.value)}
              placeholder={labels.guessPlaceholder}
              autoComplete="off"
              maxLength={100}
              className="min-w-0 flex-1 rounded border border-mist/40 bg-ink px-3 py-2 placeholder:text-mist focus:border-sakura focus:outline-none"
            />
            <button type="submit" disabled={pending} className="rounded bg-sakura px-4 py-2 font-bold text-ink hover:bg-blossom disabled:opacity-60">
              {labels.submit}
            </button>
          </form>
          {state.feedback && <p role="alert" className="text-blossom">{labels[state.feedback]}</p>}
          {hintSection}
          <div className="flex gap-4">
            <button type="button" onClick={abandon} disabled={pending} className="text-sm text-mist underline hover:text-blossom">
              {labels.giveUp}
            </button>
            {settingsButton}
          </div>
        </>
      ) : (
        <>
          <section aria-live="polite" className="flex flex-col items-center gap-1 text-center">
            <p className="text-2xl font-bold text-sakura">{state.won ? labels.won : labels.lost}</p>
            <p>
              <span className="text-mist">{labels.character} </span>
              <span className="font-bold">{state.reveal.character}</span>
            </p>
            <p>
              <span className="text-mist">{labels.anime} </span>
              <span className="font-bold">{state.reveal.anime}</span>
            </p>
          </section>
          {hintSection}
          <button type="button" onClick={next} disabled={pending} aria-busy={pending} className="rounded bg-sakura px-4 py-2 font-bold text-ink hover:bg-blossom disabled:opacity-60">
            {pending ? labels.loading : labels.next}
          </button>
          {settingsButton}
        </>
      )}
    </div>
  );
}

export function FreePlaySkeleton({ label }: { label: string }) {
  return (
    <div className="flex w-full max-w-sm flex-col items-center gap-4" aria-busy="true">
      <p role="status" className="sr-only">{label}</p>
      <div className="h-87.5 w-56.25 animate-pulse rounded-lg bg-ink" />
      <div className="flex w-full gap-2">
        <div className="h-10.5 flex-1 animate-pulse rounded bg-ink" />
        <div className="h-10.5 w-20 animate-pulse rounded bg-ink" />
      </div>
      <div className="h-5 w-16 animate-pulse rounded bg-ink" />
    </div>
  );
}
