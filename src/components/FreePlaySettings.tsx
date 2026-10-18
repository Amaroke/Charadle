"use client";

import { useState, type FormEvent } from "react";
import { difficulties, tiers, type Difficulty, type Settings, type Tier } from "@/game/settings";
import type { Dictionary } from "@/i18n/dictionaries";

type FreePlaySettingsProps = {
  labels: Dictionary["freePlay"];
  settings: Settings;
  pending: boolean;
  onPlay: (settings: Settings) => void;
  onCancel?: () => void;
};

const optionClass =
  "cursor-pointer rounded border border-mist/40 px-3 py-2 text-center has-checked:border-sakura has-checked:bg-sakura has-checked:font-bold has-checked:text-ink has-focus-visible:outline-2 has-focus-visible:outline-blossom";

export function FreePlaySettings({ labels, settings, pending, onPlay, onCancel }: FreePlaySettingsProps) {
  const [pool, setPool] = useState<Tier>(settings.pool);
  const [difficulty, setDifficulty] = useState<Difficulty>(settings.difficulty);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onPlay({ pool, difficulty });
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
        </div>
      </fieldset>
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
        <button type="submit" disabled={pending} aria-busy={pending} className="rounded bg-sakura px-6 py-2 font-bold text-ink hover:bg-blossom disabled:opacity-60">
          {pending ? labels.loading : labels.play}
        </button>
      </div>
    </form>
  );
}
