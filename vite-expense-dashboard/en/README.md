# Expense Dashboard

A simple dashboard to record expenses and track the overall total and the total per category.
Built with Vite + TypeScript (vanilla), HTML and CSS. Requirements are described in [`prd.md`](./prd.md).

## Getting started

Requirement: Node.js 20.19+ (or 22.12+).

```bash
npm install
npm run dev
```

Open the address shown in the terminal (usually http://localhost:5173).

## Other commands

```bash
npm run build     # type-checks and builds the production version into dist/
npm run preview   # serves the production build locally
```

## Structure

```
index.html      page structure (no inline events)
src/types.ts    all types (Category, Expense)
src/main.ts     state, rendering and events
src/style.css   styles
```

Data is kept in memory only: reloading the page clears the list.