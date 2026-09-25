import { getIdentityConfig } from '@netlify/identity'

const officialDemoSiteIds = new Set<string>(['480ddca5-1fd1-4784-b8c7-c889474b8cf9'])

const officialDemoSiteNames = new Set(['app-pack-template'])

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
  // Demo mode is automatic:
  //
  // - Local development stays in demo mode so the template runs with zero
  //   setup.
  // - The canonical Netlify demo project stays in demo mode so prospective
  //   users can explore the app without Identity or a database.
  // - Every other deployed Netlify project uses the real database path.
  //
  // This deliberately does NOT infer demo mode from whether NETLIFY_DB_URL is
  // set. @netlify/database can auto-provision a local Postgres database (and
  // set NETLIFY_DB_URL) in dev merely because the package is a dependency,
  // before you've ever applied a single migration.
  if (process.env.NETLIFY_DEV === 'true') {
    return true
  }

  const siteId = process.env.SITE_ID ?? process.env.NETLIFY_SITE_ID
  const siteName = process.env.SITE_NAME

  if (!siteId && !siteName) {
    return true
  }

  return (
    (siteId ? officialDemoSiteIds.has(siteId) : false) ||
    (siteName ? officialDemoSiteNames.has(siteName) : false)
  )
}

export function isAuthEnabled(): boolean {
  if (process.env.NETLIFY_DEV === 'true' && process.env.AUTH_DEV_USER) {
    return true
  }

  if (isDemoMode()) {
    return false
  }

  return getIdentityConfig() != null
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
 * The email domain new signups must match (see
 * `netlify/functions/identity.mts`), or `undefined` for no restriction.
 * Unlike `getDefaultRole`, this is optional, not fail-loud: the signup hook
 * has no way to tell whether Identity's own "open signups" setting is even
 * on, so it can't force a vertical to configure this the way it forces
 * `DEFAULT_ROLE`. Unset (the default) means unrestricted — correct for an
 * invite-only setup, where every signup already comes from a trusted
 * invite. Matching is exact-domain only (`acme.com`, not `*.acme.com`) —
 * comparison is done against the literal string after `@`, so a
 * subdomain-based email is rejected unless you list it explicitly.
 */
export function getAllowedSignupDomain(): string | undefined {
  const value = process.env.ALLOWED_SIGNUP_DOMAIN?.trim().toLowerCase()
  return value ? value : undefined
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
