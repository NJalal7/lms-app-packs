import { drizzle } from 'drizzle-orm/netlify-db'
import { getDatabase } from '@netlify/database'

// NOTE: the installed drizzle-orm (1.0.0-rc.4) netlify-db driver's `drizzle()`
// config type does not accept a `schema` object (that option was removed in
// favor of the newer `relations` API for the relational query builder). This
// app only uses the plain query builder (`db.select().from(records)`, etc.),
// so table objects are imported directly from `./schema` wherever needed
// instead of being registered here.
//
// WORKAROUND: drizzle-orm 1.0.0-rc.4's serverless session runs every query
// as `httpClient(sql, params, options)`. `@neondatabase/serverless` 1.x
// rejects that call shape ("This function can now be called only as a
// tagged-template function...") and requires `httpClient.query(...)`
// instead, so every query on a deployed site failed. We build the
// connection with `@netlify/database`'s `getDatabase()` (the same client
// `drizzle()` would create, including connection-string refresh) and wrap
// its HTTP client so plain-function calls go to `.query()`. Remove this
// once a drizzle-orm release calls `.query()` itself.
function createDb() {
  const connection = getDatabase()
  if (connection.driver !== 'serverless') {
    return drizzle({ client: connection })
  }
  const { httpClient } = connection
  const compatHttpClient = new Proxy(httpClient, {
    apply: (_target, _thisArg, args: Parameters<typeof httpClient.query>) => httpClient.query(...args),
  })
  return drizzle({
    client: {
      driver: 'serverless',
      httpClient: compatHttpClient,
      pool: connection.pool,
      connectionString: connection.connectionString,
    },
  })
}

let cached: ReturnType<typeof createDb> | undefined

/**
 * Lazily creates (and caches) the Drizzle client on first use.
 *
 * IMPORTANT: `@netlify/database`'s `getDatabase()` throws synchronously if
 * `NETLIFY_DB_URL` isn't set. Building the client eagerly at module scope
 * would therefore crash the whole app on import in demo mode (no database
 * configured). Every caller lives in the `else` branch of an
 * `if (isDemoMode())` check in `src/data/*.ts`, so this only ever runs when
 * a real database is expected to exist.
 */
export function getDb() {
  if (!cached) {
    cached = createDb()
  }
  return cached
}
