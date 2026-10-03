# Decidra

Decidra is a lightweight product-prioritization app for collecting feature ideas and comparing them with the RICE framework. The sample workspace is called GymBuddy.

## Features

- Create, edit, and delete backlog items.
- Estimate Reach, Impact, Confidence, and Effort for each feature.
- Calculate RICE scores automatically using `Reach × Impact × Confidence ÷ Effort`, converting confidence percentages to decimals.
- See each score's calculation breakdown and suggested rank; ties resolve by lower effort, higher confidence, then original order.
- Search feature names and descriptions, and filter by status.
- Track work as Backlog, In progress, or Done.
- Use a responsive layout on desktop and smaller screens.

The app is a front-end prototype. Backlog changes stay in memory for the current page session and reset on reload. There are no accounts, server API, database, or export features.

## Requirements

- Node.js 18 or newer
- npm

## Getting started

Install dependencies:

```sh
npm install
```

Start the development server:

```sh
npm run dev
```

Vite prints a local URL in the terminal (usually `http://localhost:5173`). Open it in a browser.

## Production build

Create an optimized production build:

```sh
npm run build
```

The generated site is written to `dist/`. To serve that build locally, run:

```sh
npm run preview
```

Run the deterministic RICE engine tests (Node.js 22.6 or newer):

```sh
npm test
```

## Project structure

```text
src/
  App.tsx       Main page and backlog interactions
  rice.ts       Pure RICE calculation, validation, and deterministic ranking
  main.tsx      React application entry point
  styles.css    Application styles
tests/
  rice.test.mjs RICE engine tests
index.html      Vite HTML entry point
vite.config.ts Vite configuration
```

## Available scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite development server. |
| `npm run build` | Type-check the TypeScript project and build the site. |
| `npm run preview` | Preview the production build locally. |
| `npm test` | Run the RICE scoring and ranking tests. |

## Tech stack

- React 19
- TypeScript 5
- Vite 6
