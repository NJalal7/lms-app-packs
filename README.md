# App Pack Starter

A TanStack Start + shadcn/ui application starter that deploys to Netlify in one
command, runs in **demo mode** by default (in-memory data, no database or auth
required), and exposes a single `AUTH_ENABLED` flag to turn on real
authentication. Built to be forked by HR, Finance, and other internal teams —
and by AI coding agents working on their behalf.

## Quick start

```bash
npm install
npm run dev
```

Open http://localhost:3000. You're in demo mode: the dashboard, records table,
and forms all work against an in-memory dataset that resets on every cold
start. Nothing to configure.

## One-command deploy

```bash
netlify init      # links this repo to a new or existing Netlify project
netlify deploy --build --prod
```

Or click:

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy)

The build (`npm run build`) and publish directory (`dist/client`) are already
configured in `netlify.toml`. No further setup is required to get the app
live in demo mode.

## Environment variables

| Variable                                                 | Default               | Purpose                                                                                                                                                                        |
| -------------------------------------------------------- | --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `DEMO_MODE`                                              | `true` (unset = true) | `false` switches every data read/write to the real Postgres database. See "Swap demo data" below.                                                                              |
| `AUTH_ENABLED`                                           | `false`               | `true` turns on Netlify Identity, route guards, and audit logging. See "Flip the auth toggle" below.                                                                           |
| `NETLIFY_DB_URL`                                         | —                     | Set automatically by `@netlify/database` / `netlify database init`. Don't set by hand.                                                                                         |
| `AUTH_DEV_USER`                                          | —                     | Local-dev-only fake session, e.g. `{"email":"you@example.com","roles":["admin"]}`. Only honored when `AUTH_ENABLED=true` and running under `netlify dev` (`NETLIFY_DEV=true`). |
| `SLACK_WEBHOOK_URL`                                      | —                     | Enables the `slack` notify channel.                                                                                                                                            |
| `RESEND_API_KEY`, `NOTIFY_EMAIL_FROM`, `NOTIFY_EMAIL_TO` | —                     | Enables the `email` notify channel (via [Resend](https://resend.com)).                                                                                                         |

See `.env.example` for a copy-pasteable starting point.

> **Note on local dev:** installing `@netlify/database` causes `netlify dev` /
> `vite dev` to auto-provision a local Postgres database and set
> `NETLIFY_DB_URL` — even before you've run `netlify database init` or
> applied a migration. `DEMO_MODE` is therefore the only thing that controls
> demo mode; the app never infers it from whether `NETLIFY_DB_URL` happens to
> be set.

## Flip the auth toggle

The app ships with auth **off**. To turn it on:

1. In the Netlify dashboard, enable Identity for your site (Site
   configuration → Identity → Enable Identity).
2. Set `AUTH_ENABLED=true` as a site environment variable and redeploy.
3. Invite users from the Identity tab, or let them sign up at `/login` (if
   signups are enabled in your Identity settings).
4. Assign roles (e.g. `admin`) to users from the Identity tab — `roles` land
   in `app_metadata.roles` and are what `requireRole()` checks.

With auth on:

- `/login` handles login, signup, and any OAuth providers you've enabled in
  Identity settings.
- Every route under `/records` and `/admin` redirects anonymous visitors to
  `/login` — but the **real** authorization boundary is `requireUser()` /
  `requireRole()` inside each server function (`src/server/*.ts`), which runs
  regardless of how the request got there.
- Mutations get audit-logged (actor, action, before/after) — see
  `/admin/audit`.

**Local development:** `@netlify/identity` only works against a real Netlify
deploy — there's no local Identity emulator. To develop with auth on locally,
run `netlify dev` and set:

```bash
AUTH_DEV_USER='{"email":"you@example.com","roles":["admin"]}'
```

This fake session is only honored when `NETLIFY_DEV=true` (i.e. under
`netlify dev`), never in a real deploy.

## Swap demo data for Netlify Database

1. `netlify database init` — provisions a database and scaffolds Drizzle if
   you haven't already (this repo already has schema + migrations).
2. Deploy. Netlify applies every migration in
   `netlify/database/migrations/` before the deploy goes live.
3. Set `DEMO_MODE=false` and redeploy (or restart `netlify dev` locally,
   which auto-provisions a local database the moment `@netlify/database` is
   installed).
4. Optionally seed the same data demo mode uses:
   ```bash
   npm run db:seed
   ```
   This inserts `src/data/demo/seed.ts` via Drizzle (`onConflictDoNothing`,
   safe to re-run).

To change the schema: edit `src/db/schema.ts`, run `npm run db:generate` to
emit a migration, commit the migration, and deploy.

## Notifications

`src/lib/notify.ts` exports one function: `notify({ channel, subject, body, to? })`.
It POSTs to `/api/notify`, a **background** Netlify Function
(`netlify/functions/notify.mts`) that does the actual send — so the caller
doesn't block on a third-party API.

- **Slack**: set `SLACK_WEBHOOK_URL` (an incoming webhook URL).
- **Email**: set `RESEND_API_KEY`, `NOTIFY_EMAIL_FROM`, and optionally
  `NOTIFY_EMAIL_TO` (or pass `to` per-call).

Missing config logs a warning and returns — it never throws. To add a
channel: create `src/lib/notify-channels/<channel>.ts` exporting a
`notify<Channel>({ subject, body, to? })` function, then add one line to the
map in `netlify/functions/notify.mts`.

## Uploads

`src/components/upload/file-upload.tsx` is a drag/drop uploader wired to
`/api/upload` (`netlify/functions/upload.mts`), which stores files in a
Netlify Blobs store named `uploads` (4 MB cap — the Netlify Functions request
body limit) and gates access behind auth when `AUTH_ENABLED=true`.
`/api/files/:key` (`netlify/functions/files.mts`) streams a file back out.

It isn't attached to any entity by default. To attach an upload to a record,
store the returned `{ key, url }` on the record (add a column in
`src/db/schema.ts`, thread it through `src/data/records.ts`, and render it in
`src/routes/_app/records/$id.tsx`).

## Extension points

- **Add an entity**: `src/db/schema.ts` (table + `$inferSelect`/`$inferInsert`
  types) → `src/data/<entity>.ts` (demo/DB branches, same pattern as
  `records.ts`) → `src/server/<entity>.ts` (`createServerFn` wrappers with
  Zod validation) → `src/routes/_app/<entity>/` (list/detail/new routes).
- **Branding**: edit `src/config/app.ts` only — product name, tagline, logo
  path, and brand colors. `src/components/brand-theme.tsx` and
  `src/components/app-shell.tsx` read from it; nothing else should hardcode
  a product name or color.
- **Roles**: `src/auth/server.ts`'s `requireRole(role)` checks
  `user.roles.includes(role)`. Add new roles by assigning them to users in
  the Identity dashboard — no code change needed unless you're adding a new
  gated route (call `requireRole('your-role')` in its loader).
- **Data table**: `src/components/data-table/` — pass new columns to
  `<DataTable columns data />`; sorting, filtering, search, and pagination
  are already wired via `features.ts`'s shared `dataTableFeatures`.
- **Forms**: `src/components/forms/use-app-form.ts` — add a new field type
  under `fields/` and register it in `fieldComponents`.

**Do not touch:**

- `src/config/flags.ts` — flag logic is intentionally centralized; don't
  read `process.env.DEMO_MODE` / `AUTH_ENABLED` anywhere else.
- `src/routeTree.gen.ts` — auto-generated by the TanStack Router Vite plugin.
  Never edit by hand.
- `netlify/database/migrations/` — never edit an already-applied migration
  (Netlify detects and rejects the drift). Write a new one instead.

## Testing, linting, formatting

```bash
npm run typecheck
npm run lint
npm test
npm run format
```

Tests run with `DEMO_MODE=true` (see `vitest.config.ts`) and cover the demo
data layer, flag parsing, the submission state machine, and notify's input
validation.

## Project layout

See `AGENTS.md` for a short orientation aimed at coding agents forking this
repo, and the folder-by-folder breakdown in the original implementation plan
for the full picture. The short version:

```
src/config/app.ts        # branding — the only file you edit to rebrand
src/config/flags.ts       # DEMO_MODE / AUTH_ENABLED — server-only
src/db/schema.ts          # Drizzle schema (source of truth for the DB shape)
src/data/                 # one file per entity, demo/DB branches inside
src/server/                # createServerFn wrappers (Zod validation, auth, audit)
src/auth/                  # session resolution, route guards, login UI
src/routes/                 # file-based routes (TanStack Router)
src/components/              # shadcn ui/, data-table/, forms/, states/
netlify/functions/            # notify, upload, files, events (background/HTTP)
```
