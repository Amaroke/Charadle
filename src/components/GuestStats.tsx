"use client";

import { useRouter } from "next/navigation";
import { useEffect, useSyncExternalStore } from "react";
import { Stats } from "@/components/Stats";
import { mergeGuestStats } from "@/game/stats-actions";
import { parseGuestStats, summarize, withDaily, type GuestStats } from "@/game/guest-stats";
import type { Dictionary } from "@/i18n/dictionaries";

const storageKey = "charadle:guest-stats";
const listeners = new Set<() => void>();
let cached: { raw: string | null; stats: GuestStats } = { raw: null, stats: {} };
const empty: GuestStats = {};

function readRaw(): string | null {
  try {
    return localStorage.getItem(storageKey);
  } catch {
    return null;
  }
}

function snapshot(): GuestStats {
  const raw = readRaw();
  if (raw !== cached.raw) cached = { raw, stats: parseGuestStats(raw) };
  return cached.stats;
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  window.addEventListener("storage", listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
}

export function saveDaily(date: string, score: number): void {
  const stats = snapshot();
  const next = withDaily(stats, date, score);
  if (next === stats) return;
  try {
    localStorage.setItem(storageKey, JSON.stringify(next));
  } catch {
    return;
  }
  notify();
}

function notify(): void {
  listeners.forEach((listener) => listener());
}

function useGuestStats(): GuestStats {
  return useSyncExternalStore(subscribe, snapshot, () => empty);
}

export function MergeGuestStats() {
  const router = useRouter();

  useEffect(() => {
    const raw = readRaw();
    if (Object.keys(parseGuestStats(raw)).length === 0) return;
    mergeGuestStats(raw!)
      .then((merged) => {
        if (!merged) return;
        try {
          localStorage.removeItem(storageKey);
        } catch {
          return;
        }
        notify();
        router.refresh();
      })
      .catch(() => undefined);
  }, [router]);
  return null;
}

export function GuestStatsDetails({ labels }: { labels: Dictionary["stats"] }) {
  const stats = useSyncExternalStore(subscribe, snapshot, () => undefined);
  return stats && <Stats labels={labels} scores={stats} />;
}

export function GuestStatsSummary({ labels }: { labels: Dictionary["daily"] }) {
  const stats = useGuestStats();
  const { played, won, average } = summarize(stats);
  if (played === 0) return null;
  const rows = [
    { label: labels.played, value: played },
    { label: labels.wonCount, value: won },
    { label: labels.average, value: average },
  ];
  return (
    <section aria-label={labels.stats} className="flex w-full flex-col gap-2">
      <h2 className="text-center text-sm font-bold text-mist">{labels.stats}</h2>
      <dl className="grid grid-cols-3 gap-2 text-center">
        {rows.map(({ label, value }) => (
          <div key={label} className="rounded border border-mist/40 px-2 py-1">
            <dt className="text-xs text-mist">{label}</dt>
            <dd className="text-lg font-bold">{value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
