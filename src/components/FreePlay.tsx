"use client";

import Image from "next/image";
import { useCallback, useEffect, useState, useTransition, type FormEvent } from "react";
import { giveUp, startPuzzle, submitGuess, type Puzzle, type Reveal } from "@/game/actions";
import type { Dictionary } from "@/i18n/dictionaries";

type FreePlayProps = {
  labels: Dictionary["freePlay"];
};

type State =
  | { status: "loading" }
  | { status: "error" }
  | { status: "playing"; puzzle: Puzzle; feedback?: "wrong" | "failed" }
  | { status: "over"; puzzle: Puzzle; won: boolean; reveal: Reveal };

export function FreePlay({ labels }: FreePlayProps) {
  const [state, setState] = useState<State>({ status: "loading" });
  const [guess, setGuess] = useState("");
  const [pending, startTransition] = useTransition();

  const load = useCallback(() => {
    startTransition(async () => {
      try {
        setState({ status: "playing", puzzle: await startPuzzle() });
      } catch {
        setState({ status: "error" });
      }
    });
  }, []);

  useEffect(load, [load]);

  function next() {
    setState({ status: "loading" });
    setGuess("");
    load();
  }

  if (state.status === "loading") {
    return <p role="status" className="text-mist">{labels.loading}</p>;
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
      <Image
        src={puzzle.picture}
        alt={labels.pictureAlt}
        width={225}
        height={350}
        unoptimized
        priority
        className="h-auto max-h-87.5 w-auto rounded-lg shadow-lg"
      />
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
          <button type="button" onClick={next} disabled={pending} className="rounded bg-sakura px-4 py-2 font-bold text-ink hover:bg-blossom disabled:opacity-60">
            {labels.next}
          </button>
        </>
      )}
    </div>
  );
}
