# Hexa Battle

A dungeon crawler written in TypeScript using React and SVG.

![Screenshot](screenshots/1.png)
![Screenshot](screenshots/2.png)
![Screenshot](screenshots/3.png)

## Requirements

- Node.js 18–22 (recommended: 20, see `.nvmrc`)
- npm

## Getting started

Install dependencies and start the dev server:

```bash
npm install
npm run start
```

The app runs via webpack-dev-server with hot reload. On Linux/macOS, `npm run start` uses `scripts/dev.sh` to ensure Node 20 is available.

## Scripts

| Command | Description |
|---|---|
| `npm run start` | Start the development server |
| `npm run build` | Production build (webpack) |
| `npm run lint` | Run TSLint on the codebase |
| `npm run test` | Run unit tests once (Vitest) |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:ci` | Lint, test, and build — same checks as CI |

## Tests

Unit tests live under `src/**/__tests__/` and use [Vitest](https://vitest.dev/). The engine is covered independently of the UI, so game logic can be validated without a browser.

Current coverage focuses on the core game loop in `src/engine/game.ts` (factions, turns, units, win conditions, events).

Run the suite locally:

```bash
npm test
```

During development:

```bash
npm run test:watch
```

## CI/CD

Every push and pull request to `master` triggers a [GitHub Actions](https://github.com/ItaloKbb/hb/actions) workflow (`.github/workflows/ci.yml`) that runs:

1. **Lint** — `npm run lint`
2. **Test** — `npm run test`
3. **Build** — `npm run build`

You can also run the full pipeline locally before pushing:

```bash
npm run test:ci
```

## Browser support

Only tested on the latest version of Chrome.

## Credits

Kudos to [game-icons.net](http://game-icons.net/) for providing awesome icons.
