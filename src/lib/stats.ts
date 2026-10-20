import { getCollection } from 'astro:content';

const oversToBalls = (overs: string) => {
  const [whole, part = '0'] = overs.split('.');
  return Number(whole) * 6 + Number(part);
};
const ratio = (a: number, b: number) => (b > 0 ? a / b : undefined);

/** Every season in stats.json, newest first, with players resolved and rates worked out. */
export async function getSeasons() {
  const players = new Map((await getCollection('players')).map((p) => [p.id, p]));
  const seasons = (await getCollection('stats')).sort((a, b) => b.id.localeCompare(a.id));

  return seasons.map((season) => ({
    id: season.id,
    ...season.data,
    players: season.data.players.map(({ player: ref, batting, bowling, matches }) => {
      const player = players.get(ref.id);
      if (!player) {
        throw new Error(`stats.json season "${season.id}": no player with id "${ref.id}" in players.json`);
      }
      return {
        player,
        matches,
        batting: batting && {
          ...batting,
          average: ratio(batting.runs, batting.innings - batting.notOuts),
          strikeRate: ratio(batting.runs * 100, batting.balls),
        },
        bowling: bowling && {
          ...bowling,
          average: ratio(bowling.runs, bowling.wickets),
          economy: ratio(bowling.runs * 6, oversToBalls(bowling.overs)),
        },
      };
    }),
  }));
}

export type Season = Awaited<ReturnType<typeof getSeasons>>[number];
type Row = Season['players'][number];
type Batter = Row & { batting: NonNullable<Row['batting']> };
type Bowler = Row & { bowling: NonNullable<Row['bowling']> };

const highest = (b: Batter) => parseInt(b.batting.highest) + (b.batting.highest.endsWith('*') ? 0.5 : 0);
const best = (b: Bowler) => {
  const [wickets, runs] = b.bowling.best.split('/').map(Number);
  return wickets * 1000 - runs;
};

/** Batters by runs, bowlers by wickets (then economy). */
export function tables(season: Season) {
  const batters = season.players
    .filter((r): r is Batter => Boolean(r.batting))
    .sort((a, b) => b.batting.runs - a.batting.runs);
  const bowlers = season.players
    .filter((r): r is Bowler => Boolean(r.bowling))
    .sort(
      (a, b) =>
        b.bowling.wickets - a.bowling.wickets ||
        (a.bowling.economy ?? Infinity) - (b.bowling.economy ?? Infinity),
    );
  return { batters, bowlers };
}

export function leaders(season: Season) {
  const { batters, bowlers } = tables(season);
  return {
    mostRuns: batters[0],
    mostWickets: bowlers[0],
    highestScore: [...batters].sort((a, b) => highest(b) - highest(a))[0],
    bestBowling: [...bowlers].sort((a, b) => best(b) - best(a))[0],
  };
}

/** Format a rate, or an en dash when it can't be worked out (e.g. no dismissals). */
export const fmt = (n: number | undefined, digits = 2) => (n === undefined ? '–' : n.toFixed(digits));
