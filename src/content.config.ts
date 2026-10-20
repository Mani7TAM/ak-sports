import { defineCollection, reference } from 'astro:content';
import { file } from 'astro/loaders';
import { z } from 'astro/zod';
import { club } from './data/club';

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Use YYYY-MM-DD');

const players = defineCollection({
  loader: file('src/content/players.json'),
  schema: ({ image }) =>
    z.object({
      name: z.string(),
      number: z.number().int().optional(),
      role: z.enum(['Batter', 'Wicket-keeper', 'All-rounder', 'Bowler']),
      battingStyle: z.enum(['Right-hand bat', 'Left-hand bat']).optional(),
      bowlingStyle: z.string().optional(),
      captain: z.boolean().default(false),
      viceCaptain: z.boolean().default(false),
      // Set to false when a player leaves: they drop off the squad page but keep their stats.
      active: z.boolean().default(true),
      // Path relative to players.json, e.g. "../assets/players/your-name.jpg"
      photo: image().optional(),
      cricheroesUrl: z.url().optional(),
    }),
});

const matches = defineCollection({
  loader: file('src/content/matches.json'),
  schema: z
    .object({
      date: isoDate,
      time: z
        .string()
        .regex(/^\d{2}:\d{2}$/, 'Use 24-hour HH:MM')
        .optional(),
      // Defaults to the year of `date`. Must match the season ids in stats.json.
      season: z.string().optional(),
      opponent: z.string(),
      venue: z.string(),
      tournament: z.string().optional(),
      format: z.string().optional(),
      // Leave out until the match is played.
      result: z
        .object({
          outcome: z.enum(['won', 'lost', 'tied', 'no-result']),
          ourScore: z.string().optional(),
          theirScore: z.string().optional(),
          summary: z.string(),
          playerOfMatch: z.string().optional(),
        })
        .optional(),
      cricheroesUrl: z.url().optional(),
    })
    .transform((m) => ({
      ...m,
      season: m.season ?? m.date.slice(0, 4),
      start: new Date(`${m.date}T${m.time ?? '00:00'}:00${club.utcOffset}`),
    })),
});

// Season totals per player, copied from CricHeroes. Averages and rates are worked out on the site.
const stats = defineCollection({
  loader: file('src/content/stats.json'),
  schema: z.object({
    updated: isoDate.optional(),
    cricheroesUrl: z.url().optional(),
    players: z.array(
      z.object({
        player: reference('players'),
        matches: z.number().int().nonnegative(),
        batting: z
          .object({
            innings: z.number().int().nonnegative(),
            notOuts: z.number().int().nonnegative().default(0),
            runs: z.number().int().nonnegative(),
            balls: z.number().int().nonnegative(),
            highest: z.string().regex(/^\d+\*?$/, 'Like "78" or "78*"'),
            fifties: z.number().int().nonnegative().default(0),
            hundreds: z.number().int().nonnegative().default(0),
          })
          .optional(),
        bowling: z
          .object({
            innings: z.number().int().nonnegative(),
            overs: z.coerce.string().regex(/^\d+(\.[0-5])?$/, 'Like "32.4"'),
            maidens: z.number().int().nonnegative().default(0),
            runs: z.number().int().nonnegative(),
            wickets: z.number().int().nonnegative(),
            best: z.string().regex(/^\d+\/\d+$/, 'Like "4/22"'),
          })
          .optional(),
      }),
    ),
  }),
});

// One entry per folder in src/assets/gallery/. The entry id is the folder name.
const albums = defineCollection({
  loader: file('src/content/albums.json'),
  schema: z.object({
    title: z.string(),
    date: isoDate,
    description: z.string().optional(),
    // Link to a bigger album elsewhere (e.g. Google Photos). Can be used without local photos.
    externalUrl: z.url().optional(),
    // Keyed by file name, e.g. { "trophy.jpg": "Lifting the cup" }
    captions: z.record(z.string(), z.string()).default({}),
  }),
});

export const collections = { players, matches, stats, albums };
