# For coding agents

This is a TanStack Start + shadcn/ui starter, forkable into HR/Finance/etc.
apps. Read this before making changes.

- **Runs in demo mode by default.** `npm install && npm run dev` — no
  database, no auth, no env vars needed. Data lives in memory
  (`src/data/*.ts`) and resets on cold start.
- **One flag controls each toggle**: `DEMO_MODE` (data source), `AUTH_ENABLED`
  (real auth), `DEFAULT_ROLE` (role assigned at signup, required once
  signups are enabled), and `PURGE_ENABLED`/`RECORD_RETENTION_DAYS` (hard
  purge of soft-deleted records — off by default, `RECORD_RETENTION_DAYS`
  required once `PURGE_ENABLED=true`). All live in `src/config/flags.ts` —
  read `process.env` only inside those functions, never at module scope,
  never anywhere else.
- **Branding lives in one file**: `src/config/app.ts`. If you're asked to
  rebrand the app, that's the only file that should change (plus swapping
  `/public/logo.svg`).
- **Data layer pattern**: `src/data/<entity>.ts` has `if (isDemoMode())`
  branches inline — no interface + two implementations. To add an entity,
  copy `src/data/records.ts`'s shape.
- **Soft delete is always on, not configurable**: `src/db/soft-delete.ts`'s
  `softDeleteColumns` (spread into a table) and `notDeleted`/`isNotDeleted`
  (the shared query filter/predicate) are how `records` excludes
  soft-deleted rows by default. "Delete" sets `deletedAt`; it never issues a
  real `DELETE`. Permanent purge is a separate, opt-in concern — see README
  > Soft delete — and is not audit-logged.
- **Route loaders/components must never import `src/data/*.ts` or
  `src/config/flags.ts` directly.** Both pull in Node-only code
  (`drizzle-orm/netlify-db`) or raw `process.env` reads that break the
  client bundle. Always go through the `createServerFn`-wrapped functions in
  `src/server/*.ts`, or (for flags) the root-provided `useAppContext()`.
- **Every mutation is authorized server-side**, not just route-guarded:
  `src/server/*.ts` functions call `requireUser()`/`requireRole(allowedRoles)`
  from `src/auth/server.ts` before touching data. Route-level `beforeLoad`
  guards (e.g. `src/routes/_app.tsx`) are UX only. Raw Netlify Functions use
  `checkRole(allowedRoles)` from `src/auth/session.ts` instead (no router to
  catch a thrown error, and importing it directly avoids pulling
  `server.ts`'s TanStack Router/DB dependencies into the function's bundle)
  — see `netlify/functions/example-protected.mts`. Both are pure boilerplate;
  only the `allowedRoles` array is vertical-specific. Roles live in Identity's
  `app_metadata.roles`, never `user_metadata` — see README > Roles.
- **Auth UI covers login, signup, forgot-password, and invite/recovery
  acceptance**: `src/auth/client.tsx` (`LoginForm`, `ResetPasswordForm`) and
  `src/routes/login.tsx` / `src/routes/reset-password.tsx`. If `AUTH_ENABLED=true`
  but Identity itself isn't enabled in the Netlify dashboard,
  `getSettings()` throws `MissingIdentityError` and `/login` shows an alert
  rather than failing silently on submit.
- **Full details**: see `README.md` — especially "Extension points" and the
  "Do not touch" list before adding a new entity, changing branding, or
  touching the DB schema.

If you're not sure whether something belongs in demo mode or the DB path,
check `src/data/records.ts` for the reference pattern.
