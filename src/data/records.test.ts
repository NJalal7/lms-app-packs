import { describe, it, expect } from 'vitest'

// DEMO_MODE=true is set globally in vitest.config.ts, so data/records.ts
// always takes the in-memory branch here — no database needed for tests.
import { listRecords, getRecord, createRecord, updateRecord, deleteRecord } from './records'
import { seedRecords } from './demo/seed'

describe('records (demo mode)', () => {
  it('lists the seeded records', async () => {
    const records = await listRecords()
    expect(records.length).toBeGreaterThanOrEqual(seedRecords.length)
  })

  it('gets a record by id', async () => {
    const [first] = await listRecords()
    const found = await getRecord(first.id)
    expect(found?.id).toBe(first.id)
  })

  it('returns undefined for an unknown id', async () => {
    const found = await getRecord('00000000-0000-0000-0000-000000000000')
    expect(found).toBeUndefined()
  })

  it('creates a record and it appears in the list', async () => {
    const before = await listRecords()
    const created = await createRecord({
      title: 'New thing',
      status: 'draft',
      owner: 'Test Owner',
      amount: '10.00',
    })
    expect(created.id).toBeTruthy()
    expect(created.title).toBe('New thing')

    const after = await listRecords()
    expect(after.length).toBe(before.length + 1)
  })

  it('updates a record', async () => {
    const created = await createRecord({
      title: 'To update',
      status: 'draft',
      owner: 'Owner',
      amount: '5.00',
    })
    const updated = await updateRecord(created.id, { title: 'Updated title' })
    expect(updated?.title).toBe('Updated title')
    expect(updated?.updatedAt.getTime()).toBeGreaterThanOrEqual(created.updatedAt.getTime())
  })

  it('returns undefined when updating an unknown id', async () => {
    const result = await updateRecord('00000000-0000-0000-0000-000000000000', { title: 'x' })
    expect(result).toBeUndefined()
  })

  it('deletes a record', async () => {
    const created = await createRecord({
      title: 'To delete',
      status: 'draft',
      owner: 'Owner',
      amount: '1.00',
    })
    const ok = await deleteRecord(created.id)
    expect(ok).toBe(true)

    const found = await getRecord(created.id)
    expect(found).toBeUndefined()
  })

  it('returns false when deleting an unknown id', async () => {
    const ok = await deleteRecord('00000000-0000-0000-0000-000000000000')
    expect(ok).toBe(false)
  })
})
