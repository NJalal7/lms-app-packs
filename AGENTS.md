# For coding agents

This is a TanStack Start + shadcn/ui starter, forkable into HR/Finance/etc.
apps. Read this before making changes.

- **Runs in demo mode by default.** `npm install && npm run dev` — no
  database, no auth, no env vars needed. Data lives in memory
  (`src/data/*.ts`) and resets on cold start.
- **One flag controls each toggle**: `DEMO_MODE` (data source) and
  `AUTH_ENABLED` (real auth). Both live in `src/config/flags.ts` — read
  `process.env` only inside those two functions, never at module scope,
  never anywhere else.
- **Branding lives in one file**: `src/config/app.ts`. If you're asked to
  rebrand the app, that's the only file that should change (plus swapping
  `/public/logo.svg`).
- **Data layer pattern**: `src/data/<entity>.ts` has `if (isDemoMode())`
  branches inline — no interface + two implementations. To add an entity,
  copy `src/data/records.ts`'s shape.
- **Route loaders/components must never import `src/data/*.ts` or
  `src/config/flags.ts` directly.** Both pull in Node-only code
  (`drizzle-orm/netlify-db`) or raw `process.env` reads that break the
  client bundle. Always go through the `createServerFn`-wrapped functions in
  `src/server/*.ts`, or (for flags) the root-provided `useAppContext()`.
- **Every mutation is authorized server-side**, not just route-guarded:
  `src/server/*.ts` functions call `requireUser()`/`requireRole()` from
  `src/auth/server.ts` before touching data. Route-level `beforeLoad` guards
  (e.g. `src/routes/_app.tsx`) are UX only.
- **Full details**: see `README.md` — especially "Extension points" and the
  "Do not touch" list before adding a new entity, changing branding, or
  touching the DB schema.

If you're not sure whether something belongs in demo mode or the DB path,
check `src/data/records.ts` for the reference pattern.
