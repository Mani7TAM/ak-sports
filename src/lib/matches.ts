import { getCollection, type CollectionEntry } from 'astro:content';
import { club } from '../data/club';

export type Match = CollectionEntry<'matches'>;
type Outcome = NonNullable<Match['data']['result']>['outcome'];

const HOUR = 3_600_000;

/** A fixture stays the "next match" until this time (epoch ms), so it shows on match day. */
export const showUntil = (m: Match['data']) => m.start.getTime() + (m.time ? 10 : 24) * HOUR;

export async function getMatches() {
  const all = await getCollection('matches');
  const upcoming = all
    .filter((m) => !m.data.result && showUntil(m.data) > Date.now())
    .sort((a, b) => a.data.start.getTime() - b.data.start.getTime());
  const results = all
    .filter((m) => m.data.result)
    .sort((a, b) => b.data.start.getTime() - a.data.start.getTime());
  return { upcoming, results };
}

/** Results grouped by season, keeping the order they're passed in. */
export function bySeason(matches: Match[]) {
  const seasons = new Map<string, Match[]>();
  for (const m of matches) seasons.set(m.data.season, [...(seasons.get(m.data.season) ?? []), m]);
  return [...seasons];
}

export function record(results: Match[]) {
  const count = (o: Outcome) => results.filter((m) => m.data.result?.outcome === o).length;
  const won = count('won');
  const noResult = count('no-result');
  const decided = results.length - noResult;
  return {
    played: results.length,
    won,
    lost: count('lost'),
    tied: count('tied'),
    noResult,
    winPct: decided ? Math.round((won / decided) * 100) : undefined,
  };
}

export const outcomes: Record<Outcome, { text: string; short: string; class: string }> = {
  won: { text: 'Won', short: 'W', class: 'bg-emerald-700 text-white' },
  lost: { text: 'Lost', short: 'L', class: 'bg-red-700 text-white' },
  tied: { text: 'Tied', short: 'T', class: 'bg-stone-600 text-white' },
  'no-result': { text: 'No result', short: 'NR', class: 'bg-stone-500 text-white' },
};

const dateFormat = new Intl.DateTimeFormat('en-IN', {
  weekday: 'short',
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  timeZone: club.timeZone,
});
const dateTimeFormat = new Intl.DateTimeFormat('en-IN', {
  weekday: 'short',
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
  timeZone: club.timeZone,
});

export const formatMatchDate = (m: Match['data']) =>
  (m.time ? dateTimeFormat : dateFormat).format(m.start);

const dayFormat = new Intl.DateTimeFormat('en-IN', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: club.timeZone,
});

/** "2026-10-18" → "18 October 2026" */
export const formatDay = (isoDate: string) =>
  dayFormat.format(new Date(`${isoDate}T12:00:00${club.utcOffset}`));
