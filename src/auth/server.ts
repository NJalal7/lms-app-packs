import { redirect } from '@tanstack/react-router'
import { getUser, type User } from '@netlify/identity'
import { isAuthEnabled } from '@/config/flags'
import { insertAudit } from '@/data/audit'
import type { Json } from '@/db/schema'

export type SessionUser = User

/**
 * Resolves the current session user. Three explicit branches:
 *
 * 1. Auth is off (`AUTH_ENABLED` unset/false) -> always `null`. The rest of
 *    the app treats a `null` user as "no auth required", not "logged out".
 * 2. Local dev override -> when running under `netlify dev` (so
 *    `NETLIFY_DEV === 'true'`) and `AUTH_DEV_USER` is set to a JSON blob
 *    like `{"email":"you@example.com","roles":["admin"]}`, that fake user is
 *    used. This exists because `@netlify/identity` does not work locally
 *    (there is no real Identity endpoint to talk to outside a deploy).
 * 3. Otherwise -> defer to `@netlify/identity`'s isomorphic `getUser()`,
 *    which reads the `nf_jwt` cookie from the incoming request and returns
 *    an already-normalized `{ id, email, name, roles, ... }` object (or
 *    `null`).
 */
export async function getSessionUser(): Promise<SessionUser | null> {
  if (!isAuthEnabled()) {
    return null
  }

  if (process.env.NETLIFY_DEV === 'true' && process.env.AUTH_DEV_USER) {
    try {
      const parsed = JSON.parse(process.env.AUTH_DEV_USER) as Partial<User>
      return {
        id: parsed.id ?? 'dev-user',
        email: parsed.email,
        name: parsed.name ?? parsed.email,
        roles: parsed.roles ?? [],
      } as SessionUser
    } catch {
      console.warn('AUTH_DEV_USER is set but is not valid JSON — ignoring it.')
    }
  }

  return getUser()
}

/**
 * Returns the current user, or redirects to `/login` if auth is on and no
 * user is present. No-op (always returns `null`) when auth is off — route
 * loaders can call this unconditionally without an `if (authEnabled)` guard.
 */
export async function requireUser(): Promise<SessionUser | null> {
  if (!isAuthEnabled()) return null

  const user = await getSessionUser()
  if (!user) {
    throw redirect({ to: '/login' })
  }
  return user
}

/**
 * Throws a 403 error (rendered by `ErrorState` via the route's
 * `errorComponent`) if the current user lacks `role`. No-op when auth is
 * off, so admin routes stay reachable in demo mode.
 */
export async function requireRole(role: string): Promise<SessionUser | null> {
  if (!isAuthEnabled()) return null

  const user = await requireUser()
  const roles = user?.roles ?? []
  if (!roles.includes(role)) {
    throw new Error(`403: you need the "${role}" role to view this page.`)
  }
  return user
}

/**
 * Writes an audit log entry with the actor taken from the current session.
 * No-op when auth is off (there is no real actor to attribute the action
 * to, and demo mode has no meaningful audit trail).
 */
export async function audit(
  action: string,
  entity: string,
  entityId: string,
  before?: unknown,
  after?: unknown,
): Promise<void> {
  if (!isAuthEnabled()) return

  const user = await getSessionUser()
  await insertAudit({
    actorId: user?.id ?? null,
    actorEmail: user?.email ?? null,
    action,
    entity,
    entityId,
    before: (before as Json | undefined) ?? null,
    after: (after as Json | undefined) ?? null,
  })
}
