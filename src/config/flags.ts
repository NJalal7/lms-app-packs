/**
 * Server-only feature flag helpers.
 *
 * IMPORTANT: always read `process.env` INSIDE these functions, never hoist
 * values to module scope. Some server runtimes reuse a module across
 * requests/invocations with different env, and reading at module load time
 * can bake in a stale value.
 *
 * These flags never flow to the client via `import.meta.env` / `VITE_*`
 * (that would bake them into the public client bundle). Instead the root
 * route's `beforeLoad` calls `getAppContext()` (see src/server/context.ts)
 * and puts the resolved booleans into router context for client code to read
 * via `useAppContext()`.
 */

export function isDemoMode(): boolean {
  // DEMO_MODE is the sole source of truth, and defaults to true — every
  // fork of this template starts in demo mode with zero configuration.
  //
  // This deliberately does NOT infer demo mode from whether NETLIFY_DB_URL
  // is set. @netlify/database auto-provisions a local Postgres database
  // (and sets NETLIFY_DB_URL) in `netlify dev` / `vite dev` merely because
  // the package is a dependency — it does this before you've ever run
  // `netlify database init` or applied a single migration. Inferring demo
  // mode from that variable would silently flip the app into "real
  // database" mode against an empty, unmigrated database the first time
  // anyone runs the dev server. Set DEMO_MODE=false explicitly once you're
  // ready to point the app at a real, migrated database (see README).
  return process.env.DEMO_MODE !== 'false'
}

export function isAuthEnabled(): boolean {
  return process.env.AUTH_ENABLED === 'true'
}

/**
 * The role assigned to every new user at signup (see
 * `netlify/functions/identity.mts`). Unlike `isDemoMode`/`isAuthEnabled`,
 * this has no default: a vertical template MUST set `DEFAULT_ROLE` before
 * enabling Identity signups, or every signup attempt fails loudly instead of
 * silently assigning a made-up role name.
 */
export function getDefaultRole(): string {
  const value = process.env.DEFAULT_ROLE
  if (!value) {
    throw new Error(
      'DEFAULT_ROLE is not set. Set it to the role your vertical assigns new signups ' +
        '(e.g. "member") as a site environment variable before enabling Identity signups. See README > Roles.',
    )
  }
  return value
}

/**
 * Whether the scheduled hard-purge job (`netlify/functions/purge-deleted-records.mts`)
 * is allowed to permanently delete soft-deleted records. Off by default and
 * genuinely inert when off — nothing reads `RECORD_RETENTION_DAYS` at all
 * unless this is `true`. Soft delete itself (see `src/db/soft-delete.ts`) is
 * always on and unrelated to this flag; this only gates permanent purging.
 */
export function isPurgeEnabled(): boolean {
  return process.env.PURGE_ENABLED === 'true'
}

/**
 * How many days a soft-deleted record is retained before the purge job
 * permanently deletes it. Only ever called after confirming
 * `isPurgeEnabled()` — a retention period is a compliance decision, not a
 * safe engineering default, so this throws rather than guessing a number
 * when purge is turned on but no retention window has been configured.
 */
export function getRetentionDays(): number {
  const value = process.env.RECORD_RETENTION_DAYS
  const days = Number(value)
  if (!value || !Number.isFinite(days) || days <= 0) {
    throw new Error(
      'RECORD_RETENTION_DAYS is not set (or invalid). PURGE_ENABLED=true requires an explicit, ' +
        'positive number of days — there is no safe default for a data-retention policy. See README > Soft delete.',
    )
  }
  return days
}
