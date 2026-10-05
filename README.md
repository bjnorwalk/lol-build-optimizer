# RiftGuide - League of Legends Build Optimizer

A React and TypeScript recommendation prototype by William Norwalk. It compares item choices using champion profiles, role, game state, and enemy-team threats.

[Open the static demo](https://bjnorwalk.github.io/lol-build-optimizer/). Champion/item planning runs in the browser; Riot account features require the optional backend described below.

## What it demonstrates

- Structured champion and item data with reusable recommendation logic.
- Item scoring with explanations for damage, healing, shields, and other matchup factors.
- Shareable selections through URL state and saved plans in localStorage.
- Riot Data Dragon integration, champion guides, and an optional server-side Riot API proxy.

## Run the core app

Use Node.js 24.

```sh
npm ci
npm run dev
```

Open http://127.0.0.1:5174. Core champion/item recommendations use Data Dragon and local data. A network connection is needed to fetch uncached Data Dragon content.

## Optional Riot account features

Copy `.env.example` to `.env` and supply your own Riot API key. In a second terminal:

```sh
npm run api
```

The local Vite server proxies `/api` requests to port 8787. Personal match history, timelines, and ladder sampling need the proxy and a valid key. The key remains on the server. Cached account/match data is not included in this snapshot.

## Validate

```sh
npm test
npm run build
```

## Technical guide

| File | Purpose |
|---|---|
| `src/recommender.ts` | Recommendation scoring |
| `src/data/` | Champion profiles, guides, and source references |
| `src/dataDragon.ts` | Riot static-data integration |
| `src/urlState.ts`, `src/storage.ts` | Shareable and persisted state |
| `server/riotApi.mjs` | Optional credentialed API proxy |

## Limitations

This is a prototype, not a validated competitive ranking service. Some tier, win-rate, confidence, and guide values are seeded or estimated. They should not be interpreted as a comprehensive live statistical sample. The source distinguishes generated and curated data in several views.

The optional manual Pages workflow builds the static frontend only. Riot account features require a separately hosted proxy; they do not work on a standalone Pages deployment. The complete local setup supports the proxy.

League of Legends and related game content belong to Riot Games. This independent project is not endorsed by Riot Games. Upstream data references are retained in `src/data/`.
