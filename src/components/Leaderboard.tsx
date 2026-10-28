import { minimumDailiesForAverage, type Leaderboard as Board, type Standing } from "@/game/leaderboard";
import type { Dictionary } from "@/i18n/dictionaries";

type LeaderboardProps = {
  labels: Dictionary["leaderboard"];
  board: Board;
};

function Standings({ title, note, entries, empty }: { title: string; note?: string; entries: Standing[]; empty: string }) {
  return (
    <section aria-label={title} className="flex flex-col gap-2 rounded border border-mist/40 p-3">
      <h2 className="text-center text-sm font-bold text-mist">{title}</h2>
      {note && <p className="text-center text-xs text-mist">{note}</p>}
      {entries.length === 0 ? (
        <p className="text-center text-sm text-mist">{empty}</p>
      ) : (
        <ol className="flex flex-col gap-1">
          {entries.map(({ name, value }, index) => (
            <li key={index} aria-label={`${index + 1}. ${name}: ${value}`} className="flex items-center gap-2 text-sm">
              <span className="w-5 text-right text-mist">{index + 1}</span>
              <span className="flex-1 truncate">{name}</span>
              <span className="font-bold text-sakura">{value}</span>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}

export function Leaderboard({ labels, board }: LeaderboardProps) {
  return (
    <div className="grid w-full max-w-3xl gap-4 sm:grid-cols-3">
      <Standings title={labels.today} entries={board.today} empty={labels.empty} />
      <Standings
        title={labels.average}
        note={labels.averageNote.replace("{count}", String(minimumDailiesForAverage))}
        entries={board.average}
        empty={labels.empty}
      />
      <Standings title={labels.streak} entries={board.streak} empty={labels.empty} />
    </div>
  );
}
