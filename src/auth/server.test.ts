import { randomUUID } from 'node:crypto'
import { describe, it, expect, afterEach } from 'vitest'
import { auditRead } from './server'
import { listAudit } from '@/data/audit'
import { listRecords, getRecord } from '@/data/records'

describe('auditRead', () => {
  const original = { ...process.env }

  afterEach(() => {
    process.env = { ...original }
  })

  function enableAuditedSession() {
    process.env.AUTH_ENABLED = 'true'
    process.env.NETLIFY_DEV = 'true'
    process.env.AUTH_DEV_USER = JSON.stringify({ email: 'tester@example.com', roles: ['admin'] })
  }

  it('writes a correctly-shaped read entry when called directly', async () => {
    enableAuditedSession()
    const entityId = randomUUID()

    await auditRead('employee-record.viewed', 'employee-record', entityId)

    const [latest] = await listAudit()
    expect(latest).toMatchObject({
      action: 'employee-record.viewed',
      entity: 'employee-record',
      entityId,
      actorEmail: 'tester@example.com',
      before: null,
      after: null,
    })
    expect(latest.createdAt).toBeInstanceOf(Date)
  })

  it('is a no-op when AUTH_ENABLED is not true', async () => {
    delete process.env.AUTH_ENABLED
    const before = (await listAudit()).length

    await auditRead('employee-record.viewed', 'employee-record', randomUUID())

    expect((await listAudit()).length).toBe(before)
  })

  it('produces zero new audit entries when calling the existing records getters, proving read-logging stays opt-in', async () => {
    enableAuditedSession()

    const before = (await listAudit()).length
    const records = await listRecords()
    if (records[0]) {
      await getRecord(records[0].id)
    }

    expect((await listAudit()).length).toBe(before)
  })
})
