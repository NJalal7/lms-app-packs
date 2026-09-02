import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { isDemoMode, isAuthEnabled } from './flags'

describe('isDemoMode', () => {
  const original = { ...process.env }

  afterEach(() => {
    process.env = { ...original }
  })

  it('is true when DEMO_MODE=true', () => {
    process.env.DEMO_MODE = 'true'
    expect(isDemoMode()).toBe(true)
  })

  it('is false when DEMO_MODE=false, even without a database configured', () => {
    process.env.DEMO_MODE = 'false'
    delete process.env.NETLIFY_DB_URL
    expect(isDemoMode()).toBe(false)
  })

  it('defaults to true when DEMO_MODE is unset, regardless of NETLIFY_DB_URL', () => {
    delete process.env.DEMO_MODE
    delete process.env.NETLIFY_DB_URL
    expect(isDemoMode()).toBe(true)
  })

  it('stays true even when NETLIFY_DB_URL is set (e.g. auto-provisioned by netlify dev), unless DEMO_MODE=false', () => {
    delete process.env.DEMO_MODE
    process.env.NETLIFY_DB_URL = 'postgres://example'
    expect(isDemoMode()).toBe(true)
  })
})

describe('isAuthEnabled', () => {
  beforeEach(() => {
    delete process.env.AUTH_ENABLED
  })

  it('is false by default', () => {
    expect(isAuthEnabled()).toBe(false)
  })

  it('is true only when AUTH_ENABLED is exactly "true"', () => {
    process.env.AUTH_ENABLED = 'true'
    expect(isAuthEnabled()).toBe(true)

    process.env.AUTH_ENABLED = 'yes'
    expect(isAuthEnabled()).toBe(false)
  })
})
