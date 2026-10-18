"use client";

import Image from "next/image";
import { useEffect, useRef, useState, useTransition, type FormEvent } from "react";
import { giveUp, startPuzzle, submitGuess, type Puzzle, type Reveal } from "@/game/actions";
import type { Dictionary } from "@/i18n/dictionaries";

type FreePlayProps = {
  labels: Dictionary["freePlay"];
  initialPuzzle?: Puzzle;
};

type State =
  | { status: "error" }
  | { status: "playing"; puzzle: Puzzle; feedback?: "wrong" | "failed" }
  | { status: "over"; puzzle: Puzzle; won: boolean; reveal: Reveal };

function preloadPicture(src: string): Promise<void> {
  return new Promise((resolve) => {
    const picture = new window.Image();
    picture.onload = () => resolve();
    picture.onerror = () => resolve();
    picture.src = src;
  });
}

async function drawWithPicture(): Promise<Puzzle> {
  const puzzle = await startPuzzle();
  await preloadPicture(puzzle.picture);
  return puzzle;
}

export function FreePlay({ labels, initialPuzzle }: FreePlayProps) {
  const [state, setState] = useState<State>(
    initialPuzzle ? { status: "playing", puzzle: initialPuzzle } : { status: "error" },
  );
  const [guess, setGuess] = useState("");
  const [pending, startTransition] = useTransition();
  const upcoming = useRef<Promise<Puzzle> | null>(null);
  const ticket = state.status === "error" ? undefined : state.puzzle.ticket;

  useEffect(() => {
    if (!ticket) return;
    const draw = drawWithPicture();
    draw.catch(() => {});
    upcoming.current = draw;
  }, [ticket]);

  function next() {
    const draw = upcoming.current ?? drawWithPicture();
    upcoming.current = null;
    startTransition(async () => {
      try {
        const puzzle = await draw;
        setGuess("");
        setState({ status: "playing", puzzle });
      } catch {
        setState({ status: "error" });
      }
    });
  }

  if (state.status === "error") {
    return (
      <div className="flex flex-col items-center gap-3">
        <p role="alert">{labels.error}</p>
        <button type="button" onClick={next} disabled={pending} className="rounded bg-sakura px-4 py-2 font-bold text-ink hover:bg-blossom disabled:opacity-60">
          {labels.retry}
        </button>
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
          <button type="button" onClick={abandon} disabled={pending} className="text-sm text-mist underline hover:text-blossom">
            {labels.giveUp}
          </button>
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
          <button type="button" onClick={next} disabled={pending} aria-busy={pending} className="rounded bg-sakura px-4 py-2 font-bold text-ink hover:bg-blossom disabled:opacity-60">
            {pending ? labels.loading : labels.next}
          </button>
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
