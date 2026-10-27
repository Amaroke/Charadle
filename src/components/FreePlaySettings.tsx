"use client";

import { useState, type FormEvent } from "react";
import {
  defaultMalList,
  difficulties,
  isMalList,
  isUsername,
  maxScore,
  tiers,
  watchStatuses,
  type Difficulty,
  type MalListPool,
  type Settings,
  type Tier,
  type WatchStatus,
} from "@/game/settings";
import type { Dictionary } from "@/i18n/dictionaries";

type FreePlaySettingsProps = {
  labels: Dictionary["freePlay"];
  player?: string;
  settings: Settings;
  pending: boolean;
  onPlay: (settings: Settings) => void;
  onCancel?: () => void;
};

const optionClass =
  "cursor-pointer rounded border border-mist/40 px-3 py-2 text-center has-checked:border-sakura has-checked:bg-sakura has-checked:font-bold has-checked:text-ink has-focus-visible:outline-2 has-focus-visible:outline-blossom";

const scores = Array.from({ length: maxScore + 1 }, (_, score) => score);

export function FreePlaySettings({ labels, player, settings, pending, onPlay, onCancel }: FreePlaySettingsProps) {
  const [pool, setPool] = useState<Tier | "mal">(isMalList(settings.pool) ? "mal" : settings.pool);
  const [malList, setMalList] = useState<MalListPool>(
    isMalList(settings.pool) ? settings.pool : { ...defaultMalList, username: player ?? "" },
  );
  const [difficulty, setDifficulty] = useState<Difficulty>(settings.difficulty);
  const username = malList.username.trim();
  const playable = pool !== "mal" || (isUsername(username) && malList.statuses.length > 0);

  function toggleStatus(status: WatchStatus) {
    setMalList((current) => ({
      ...current,
      statuses: current.statuses.includes(status)
        ? current.statuses.filter((kept) => kept !== status)
        : watchStatuses.filter((kept) => kept === status || current.statuses.includes(kept)),
    }));
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!playable) return;
    onPlay({ pool: pool === "mal" ? { ...malList, username } : pool, difficulty });
  }

  return (
    <form onSubmit={submit} aria-label={labels.settings} className="flex w-full max-w-sm flex-col gap-6">
      <p className="text-center text-mist">{labels.settingsIntro}</p>
      <fieldset className="flex flex-col gap-2">
        <legend className="mb-2 font-bold">{labels.pool}</legend>
        <p className="text-sm text-mist">{labels.poolHint}</p>
        <div className="grid grid-cols-4 gap-2">
          {tiers.map((tier) => (
            <label key={tier} className={optionClass}>
              <input
                type="radio"
                name="pool"
                value={tier}
                checked={pool === tier}
                onChange={() => setPool(tier)}
                className="sr-only"
              />
              Top {tier}
            </label>
          ))}
          <label className={optionClass}>
            <input
              type="radio"
              name="pool"
              value="mal"
              checked={pool === "mal"}
              onChange={() => setPool("mal")}
              className="sr-only"
            />
            {labels.malList}
          </label>
        </div>
      </fieldset>
      {pool === "mal" && (
        <fieldset className="flex flex-col gap-4">
          <legend className="mb-2 font-bold">{labels.malList}</legend>
          <p className="text-sm text-mist">{labels.malListHint}</p>
          <label className="flex flex-col gap-1">
            <span className="text-sm">{labels.username}</span>
            <input
              value={malList.username}
              onChange={(event) => setMalList((current) => ({ ...current, username: event.target.value }))}
              autoComplete="off"
              required
              className="rounded border border-mist/40 bg-ink px-3 py-2 focus:border-sakura focus:outline-none"
            />
          </label>
          <fieldset className="flex flex-col gap-2">
            <legend className="mb-2 text-sm">{labels.statuses}</legend>
            <div className="grid grid-cols-2 gap-2">
              {watchStatuses.map((status) => (
                <label key={status} className={optionClass}>
                  <input
                    type="checkbox"
                    name="status"
                    value={status}
                    checked={malList.statuses.includes(status)}
                    onChange={() => toggleStatus(status)}
                    className="sr-only"
                  />
                  {labels[status]}
                </label>
              ))}
            </div>
          </fieldset>
          <label className="flex items-center justify-between gap-2">
            <span className="text-sm">{labels.minScore}</span>
            <select
              value={malList.minScore}
              onChange={(event) => setMalList((current) => ({ ...current, minScore: Number(event.target.value) }))}
              className="rounded border border-mist/40 bg-ink px-3 py-2 focus:border-sakura focus:outline-none"
            >
              {scores.map((score) => (
                <option key={score} value={score}>
                  {score === 0 ? labels.anyScore : score}
                </option>
              ))}
            </select>
          </label>
        </fieldset>
      )}
      <fieldset className="flex flex-col gap-2">
        <legend className="mb-2 font-bold">{labels.difficulty}</legend>
        <div className="grid grid-cols-2 gap-2">
          {difficulties.map((option) => (
            <label key={option} className={optionClass}>
              <input
                type="radio"
                name="difficulty"
                value={option}
                checked={difficulty === option}
                onChange={() => setDifficulty(option)}
                className="sr-only"
              />
              <span className="block">{labels[option]}</span>
              <span className="block text-xs font-normal">{labels[`${option}Hint`]}</span>
            </label>
          ))}
        </div>
      </fieldset>
      <div className="flex justify-center gap-3">
        {onCancel && (
          <button type="button" onClick={onCancel} disabled={pending} className="rounded border border-mist/40 px-4 py-2 text-mist hover:text-blossom">
            {labels.cancel}
          </button>
        )}
        <button type="submit" disabled={pending || !playable} aria-busy={pending} className="rounded bg-sakura px-6 py-2 font-bold text-ink hover:bg-blossom disabled:opacity-60">
          {pending ? labels.loading : labels.play}
        </button>
      </div>
    </form>
  );
}
