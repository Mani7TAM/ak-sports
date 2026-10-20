import { getCollection, type CollectionEntry } from 'astro:content';

export type Player = CollectionEntry<'players'>;

/** Squad page sections, in display order. */
export const roleGroups: Record<Player['data']['role'], string> = {
  Batter: 'Batters',
  'Wicket-keeper': 'Wicket-keepers',
  'All-rounder': 'All-rounders',
  Bowler: 'Bowlers',
};

const rank = (p: Player) => (p.data.captain ? 0 : p.data.viceCaptain ? 1 : 2);

/** Current players: captain first, then vice-captain, then by name. (Collections don't keep file order.) */
export async function getSquad() {
  const players = await getCollection('players', (p) => p.data.active);
  return players.sort((a, b) => rank(a) - rank(b) || a.data.name.localeCompare(b.data.name));
}
