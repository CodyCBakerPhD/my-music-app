# My Music App

My web app for music management, playback, and analysis.

Songs, their metadata, and playlists are managed here; the page builds the files to copy to the VLC app on a phone.

## The page

**https://codycbakerphd.github.io/my-music-app/**

A static page, built from this repository and hosted on the `gh-pages` branch. Nothing to install.

- **Playlists**: every playlist generated from the song tags, in order, with a `.m3u` download for each.
- **Songs**: all song metadata, searchable by name, creator, or tag.
- **Build VLC folder**: choose your music folder and the page writes the files for the VLC app.

### Building the VLC folder

Lay out a folder on your computer like this:

```
music/
├── source/      every song, named after it: `Alicia.mp3`, `Wide Awake.flac`, ...
└── modified/    optional: hand-edited versions that replace their `source/` counterparts
```

On the page's _Build VLC folder_ tab, choose `music/` and press _Generate_. You get:

```
music/
├── vlc/         one `.wav` per song and one `.m3u` per playlist; copy this to the VLC app
└── logs/        one `<song>_error.log` per song that could not be converted
```

Chromium-based browsers also remember the folder: on later visits, press _Use "music" again_ and allow access when the browser asks. _Forget folder_ clears it.

Everything runs in the browser tab; no audio is uploaded anywhere. Chromium-based browsers (Chrome, Edge, Brave, ...) write `vlc/` and `logs/` straight into the chosen folder. Other browsers get a `vlc.zip` download instead, which is built in memory, so prefer a Chromium-based browser for a whole library.

Songs are decoded by the browser and re-encoded as 16-bit, 44.1 kHz `.wav`. A playlist gets an `.m3u` only when every one of its songs was converted; the page lists the ones that were skipped and why.

## Editing songs and playlists

Song metadata lives in [`src/data/song_metadata/`](src/data/song_metadata) and hand-ordered playlists in [`src/data/manual_playlists/`](src/data/manual_playlists); see [the metadata README](src/data/song_metadata/README.md). Merging to `main` redeploys the page.

## Development

Requires Node.js (LTS).

```bash
git clone https://github.com/CodyCBakerPhD/my-music-app
cd music
npm ci
npm run dev          # http://localhost:5173
```

| Command                   | What it does                                                   |
| ------------------------- | -------------------------------------------------------------- |
| `npm run build`           | Build the static site into `dist/`                             |
| `npm test`                | Unit tests (Vitest, jsdom)                                     |
| `npm run test:coverage`   | Unit tests with coverage                                       |
| `npm run test:e2e`        | Integration tests against the dev server (Playwright)          |
| `npm run test:chromatic`  | Snapshot suite archived for Chromatic (Playwright)             |
| `npm run storybook`       | Storybook of the page and its build reports                    |
| `npm run typecheck`       | TypeScript checks                                              |
| `npm run format`          | Prettier                                                       |

Playwright needs a browser: `npx playwright install chromium`. To use an existing Chromium instead, set `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH`.

### Layout

```
src/
├── index.html, styles.css, main.ts   the page
├── ui.ts                             views, navigation, and the build panel
├── playlists.ts                      tag-combination playlist rules
├── library.ts                        loads the YAML data bundled at build time
├── generator.ts                      builds vlc/ and logs/ from a music folder
├── sinks.ts                          writes to a folder, or to a .zip
├── wav.ts                            WAV encoder
└── data/                             song metadata and manual playlists
tests/
├── unit/                             Vitest
├── integration/                      Playwright
├── chromatic/                        Playwright snapshots for Chromatic
└── fixtures/                         shared helpers and a tiny music folder
stories/                              Storybook stories for Chromatic
configs/                              Vite, Vitest, Playwright, Storybook, TypeScript, Prettier
```

### CI

| Workflow                                        | When                          | What                                                                                |
| ----------------------------------------------- | ----------------------------- | ----------------------------------------------------------------------------------- |
| `test.yml`                                      | pull requests, pushes to main | Format, typecheck, build; unit tests (to Codecov); Playwright integration tests      |
| `chromatic.yml`, `chromatic-playwright.yml`     | every push and pull request   | Build the Storybook and the Playwright archive for Chromatic                        |
| `chromatic-publish.yml`                         | after the two above           | Upload both builds to Chromatic                                                     |
| `refresh-pages.yml`                             | pushes to main                | Build and deploy the site to `gh-pages`                                             |
| `preview.yml`, `preview-deploy.yml`             | pull requests                 | Deploy a preview to `gh-pages` under `pr-preview/pr-N/` and comment the link        |
| `version-check.yml`                             | pull requests                 | Require a `package.json` version bump for code changes (not for `src/data/` edits) |
| `weekly-tests.yml`, `npm-audit.yml`             | weekly                        | Re-run the tests and `npm audit`, emailing on failure                               |

Secrets used: `CHROMATIC_STORYBOOK_PROJECT_TOKEN` and `CHROMATIC_PLAYWRIGHT_PROJECT_TOKEN` (one Chromatic project each), `CODECOV_TOKEN`, and `MAIL_USERNAME` and `MAIL_PASSWORD` (failure emails, sent to the `MAIL_USERNAME` address).

pre-commit runs through [pre-commit.ci](https://pre-commit.ci), which needs its GitHub app installed on the repository; it pushes hook fixes to pull requests itself and updates hook versions quarterly.

GitHub Pages must be set to deploy from the `gh-pages` branch (Settings → Pages).
