# AK Sports Club website

Static site built with [Astro](https://docs.astro.build) and Tailwind CSS, hosted free on Cloudflare Pages.

## Commands

| Command           | What it does                                  |
| :---------------- | :-------------------------------------------- |
| `npm install`     | Install dependencies                          |
| `npm run dev`     | Dev server at `http://localhost:4321`         |
| `npm run build`   | Build the site into `dist/`                   |
| `npm run preview` | Serve the built site locally                  |
| `npx astro check` | Type-check `.astro` files and content schemas |

## Where things live

| To change…                                                | Edit                                                 |
| :-------------------------------------------------------- | :--------------------------------------------------- |
| Club name, tagline, story, ground, practice times, links | `src/data/club.ts`                                   |
| Players                                                   | `src/content/players.json`                           |
| Fixtures and results                                      | `src/content/matches.json`                           |
| Season batting/bowling stats                              | `src/content/stats.json`                             |
| Photo albums                                              | `src/content/albums.json` + `src/assets/gallery/`    |
| Header/footer links                                       | `src/data/nav.ts`                                    |
| Club colours                                              | `@theme` block in `src/styles/global.css`            |
| Fonts                                                     | `fonts` in `astro.config.mjs`                        |
| Logo, icons, share image                                  | `src/assets/logo.png`, `public/` (see below)         |

In `club.ts`, any field left as `''` (or an empty list) is hidden on the site. Lines marked `TODO` are placeholders.
The schemas in `src/content.config.ts` validate players and matches, so a typo fails `npm run build` with a clear error rather than breaking a page.

### Add a player

Add an entry to `players.json`. The `id` must be unique.

```json
{
  "id": "firstname-lastname",
  "name": "Firstname Lastname",
  "number": 21,
  "role": "Bowler",
  "battingStyle": "Right-hand bat",
  "bowlingStyle": "Right-arm off-break",
  "photo": "../assets/players/firstname-lastname.jpg",
  "cricheroesUrl": "https://cricheroes.com/player-profile/..."
}
```

- `role` is one of `Batter`, `Wicket-keeper`, `All-rounder`, `Bowler`. Set `"captain": true` or `"viceCaptain": true` where needed.
- Photos go in `src/assets/players/` and are resized and converted to WebP at build time. A portrait (4:5) crop looks best. Players without a photo get an initials tile.
- The squad shows the captain, then the vice-captain, then everyone else by name.
- When someone leaves, set `"active": false` rather than deleting them. They drop off the squad page but their past stats still work.

### Add a fixture, then its result

Add the fixture when it's announced:

```json
{
  "id": "2026-11-08-opponent-name",
  "date": "2026-11-08",
  "time": "07:00",
  "opponent": "Opponent Name",
  "venue": "Ground name",
  "tournament": "League name",
  "format": "T20"
}
```

After the match, add a `result` (and the CricHeroes scorecard link) to the same entry:

```json
"result": {
  "outcome": "won",
  "ourScore": "164/6 (20)",
  "theirScore": "151/9 (20)",
  "summary": "Won by 13 runs",
  "playerOfMatch": "Player Name"
},
"cricheroesUrl": "https://cricheroes.com/scorecard/..."
```

- `time` is local time at `club.utcOffset` (IST by default). `outcome` is one of `won`, `lost`, `tied`, `no-result`.
- Each match belongs to the season of its year. Add `"season": "2026-27"` to override, using the same id as in `stats.json`.
- Finished fixtures are hidden in the browser (on the home page and `/fixtures/`), so they drop off even if the site hasn't been rebuilt.
- **Matches played**, **Wins** and each season's record are counted from the results in this file.

### Update season stats

Copy each player's season totals from the CricHeroes team stats into `stats.json`. The site works out averages, strike rates, economy rates and the season leaders.

```json
{
  "id": "2026",
  "updated": "2026-10-18",
  "cricheroesUrl": "https://cricheroes.com/team-profile/...",
  "players": [
    {
      "player": "your-name",
      "matches": 12,
      "batting": { "innings": 11, "notOuts": 2, "runs": 312, "balls": 243, "highest": "78*", "fifties": 2, "hundreds": 0 },
      "bowling": { "innings": 10, "overs": "32.4", "maidens": 1, "runs": 221, "wickets": 14, "best": "4/22" }
    }
  ]
}
```

- `player` is the player's `id` from `players.json`. A wrong id fails the build and names the bad entry.
- Leave out `batting` or `bowling` for anyone who didn't bat or bowl.
- The newest season shows at `/stats/`, and older ones at `/stats/<id>/`. `id` is the season name, e.g. `"2026"`.

### Add a photo album

1. Make a folder `src/assets/gallery/<album-id>/` and put the photos in it. Photos show in file-name order, so `01.jpg`, `02.jpg`… works well.
2. Add the album to `albums.json`:
   ```json
   {
     "id": "2026-10-sample-cup",
     "title": "Sample Cup final",
     "date": "2026-10-18",
     "description": "Optional one-liner.",
     "externalUrl": "https://photos.app.goo.gl/...",
     "captions": { "01.jpg": "Lifting the trophy" }
   }
   ```
- Photos are resized and converted at build time (thumbnails plus a 1600px version for the full-screen viewer).
  Resize phone photos to about 2000px on the long side before committing, to keep the repo small and builds fast.
- For big albums, keep a handful of favourites here and set `externalUrl` to the full Google Photos album. An album with only an `externalUrl` and no folder links straight out.
- A folder with no matching `albums.json` entry fails the build with a clear message.
- Until the first album is added, the build prints a harmless "albums is empty" warning.

### Logo and colours

| File                                                                 | Use                                                         |
| :------------------------------------------------------------------- | :---------------------------------------------------------- |
| `src/assets/logo.png`                                                | Shield on a transparent background (header, footer, home)   |
| `public/favicon.ico`, `public/favicon-192.png`                       | Browser tab icons                                            |
| `public/apple-touch-icon.png`                                        | Home-screen icon on phones                                   |
| `public/og.png`                                                      | 1200×630 preview image for WhatsApp and social links         |

- `logo.png` was cut out of a dark-background image, so it only works on dark (navy) surfaces.
  If you get a transparent PNG or SVG of the logo from the designer, replace these files with versions made from it.
- The navy (`--color-brand-*`) and gold (`--color-accent-*`) scales are in the `@theme` block of `src/styles/global.css`.
- The preview image needs an absolute URL, so set `site` in `astro.config.mjs` to the live address. Otherwise link previews won't show it.

## Deploy to Cloudflare Pages (free)

1. Push this folder to a GitHub repository.
2. In the Cloudflare dashboard, open **Workers & Pages → Create → Pages → Import an existing Git repository** and pick the repo.
3. Build settings: framework preset **Astro**, build command `npm run build`, output directory `dist`. The Node version is taken from `.node-version`.
4. Deploy. The site goes live at `https://<project-name>.pages.dev`, and every push to `main` redeploys it.
5. Set `site` in `astro.config.mjs` to that address, so canonical and share links are correct.

A custom domain (e.g. `aksportsclub.in`) can be attached later under the project's **Custom domains** tab.

## Roadmap

- [x] Phase 1: Home, About, Squad, Join
- [x] Phase 2: Fixtures & Results page, Stats, Gallery
- [ ] Phase 3: News, sponsors, sitemap, social share image, analytics
- [ ] Phase 4: Custom domain
