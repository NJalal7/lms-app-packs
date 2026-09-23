import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import {
  isDemoMode,
  isAuthEnabled,
  getDefaultRole,
  getAllowedSignupDomain,
  isPurgeEnabled,
  getRetentionDays,
} from './flags'

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

describe('getDefaultRole', () => {
  afterEach(() => {
    delete process.env.DEFAULT_ROLE
  })

  it('throws when DEFAULT_ROLE is unset', () => {
    delete process.env.DEFAULT_ROLE
    expect(() => getDefaultRole()).toThrow(/DEFAULT_ROLE is not set/)
  })

  it('throws when DEFAULT_ROLE is an empty string', () => {
    process.env.DEFAULT_ROLE = ''
    expect(() => getDefaultRole()).toThrow(/DEFAULT_ROLE is not set/)
  })

  it('returns the configured value', () => {
    process.env.DEFAULT_ROLE = 'member'
    expect(getDefaultRole()).toBe('member')
  })
})

describe('getAllowedSignupDomain', () => {
  afterEach(() => {
    delete process.env.ALLOWED_SIGNUP_DOMAIN
  })

  it('is undefined by default (no restriction)', () => {
    delete process.env.ALLOWED_SIGNUP_DOMAIN
    expect(getAllowedSignupDomain()).toBeUndefined()
  })

  it('is undefined when set to an empty/whitespace string', () => {
    process.env.ALLOWED_SIGNUP_DOMAIN = '   '
    expect(getAllowedSignupDomain()).toBeUndefined()
  })

  it('returns the configured domain, trimmed and lowercased', () => {
    process.env.ALLOWED_SIGNUP_DOMAIN = '  Acme.Com  '
    expect(getAllowedSignupDomain()).toBe('acme.com')
  })
})

describe('isPurgeEnabled', () => {
  beforeEach(() => {
    delete process.env.PURGE_ENABLED
  })

  it('is false by default', () => {
    expect(isPurgeEnabled()).toBe(false)
  })

  it('is true only when PURGE_ENABLED is exactly "true"', () => {
    process.env.PURGE_ENABLED = 'true'
    expect(isPurgeEnabled()).toBe(true)

    process.env.PURGE_ENABLED = 'yes'
    expect(isPurgeEnabled()).toBe(false)
  })
})

describe('getRetentionDays', () => {
  afterEach(() => {
    delete process.env.RECORD_RETENTION_DAYS
  })

  it('throws when RECORD_RETENTION_DAYS is unset', () => {
    delete process.env.RECORD_RETENTION_DAYS
    expect(() => getRetentionDays()).toThrow(/RECORD_RETENTION_DAYS is not set/)
  })

  it('throws when RECORD_RETENTION_DAYS is zero, negative, or non-numeric', () => {
    process.env.RECORD_RETENTION_DAYS = '0'
    expect(() => getRetentionDays()).toThrow()

    process.env.RECORD_RETENTION_DAYS = '-5'
    expect(() => getRetentionDays()).toThrow()

    process.env.RECORD_RETENTION_DAYS = 'not-a-number'
    expect(() => getRetentionDays()).toThrow()
  })

  it('returns the configured value', () => {
    process.env.RECORD_RETENTION_DAYS = '30'
    expect(getRetentionDays()).toBe(30)
  })
})
