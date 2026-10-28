import { distribution, summarize, type GuestStats } from "@/game/guest-stats";
import type { Dictionary } from "@/i18n/dictionaries";

type StatsProps = {
  labels: Dictionary["stats"];
  scores: GuestStats;
  streak?: number;
};

export function Stats({ labels, scores, streak }: StatsProps) {
  const { played, won, average } = summarize(scores);
  if (played === 0) return <p className="text-mist">{labels.empty}</p>;
  const counts = distribution(scores);
  const most = Math.max(...counts);
  const rows = [
    { label: labels.played, value: played },
    { label: labels.won, value: won },
    { label: labels.average, value: average },
    ...(streak === undefined ? [] : [{ label: labels.streak, value: streak }]),
  ];
  return (
    <div className="flex w-full max-w-sm flex-col gap-6">
      <dl className={`grid gap-2 text-center ${streak !== undefined ? "grid-cols-2 sm:grid-cols-4" : "grid-cols-3"}`}>
        {rows.map(({ label, value }) => (
          <div key={label} className="rounded border border-mist/40 px-2 py-1">
            <dt className="text-xs text-mist">{label}</dt>
            <dd className="text-lg font-bold">{value}</dd>
          </div>
        ))}
      </dl>
      <section aria-label={labels.distribution} className="flex flex-col gap-1">
        <h2 className="text-center text-sm font-bold text-mist">{labels.distribution}</h2>
        <ol className="flex flex-col gap-1">
          {counts
            .map((count, score) => ({ count, score }))
            .reverse()
            .map(({ count, score }) => (
              <li key={score} aria-label={`${score}: ${count}`} className="flex items-center gap-2 text-sm">
                <span className="w-4 text-right font-bold">{score}</span>
                <span className="flex-1">
                  <span
                    className="block rounded bg-sakura px-2 text-right font-bold text-ink"
                    style={{ width: `${Math.max(8, (count / most) * 100)}%` }}
                  >
                    {count}
                  </span>
                </span>
              </li>
            ))}
        </ol>
      </section>
    </div>
  );
}
