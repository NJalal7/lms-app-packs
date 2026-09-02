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
