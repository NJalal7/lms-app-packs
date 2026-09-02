// To point this app at another data source, edit this file only. Demo
// writes live in memory and reset on cold start.

import { randomUUID } from 'node:crypto'
import { eq, desc } from 'drizzle-orm'
import { isDemoMode } from '@/config/flags'
import { getDb } from '@/db/client'
import { records, type RecordRow, type NewRecord } from '@/db/schema'
import { seedRecords } from '@/data/demo/seed'

export type RecordInput = Omit<NewRecord, 'id' | 'createdAt' | 'updatedAt'>

function toRow(input: NewRecord & { id: string }): RecordRow {
  const now = new Date()
  return {
    title: input.title,
    status: input.status ?? 'draft',
    owner: input.owner,
    amount: input.amount ?? '0',
    dueDate: input.dueDate ?? null,
    notes: input.notes ?? null,
    id: input.id,
    createdAt: now,
    updatedAt: now,
  }
}

// In-memory store for demo mode. Resets whenever the server cold-starts.
let demoRecords: Array<RecordRow> = seedRecords.map(toRow)

function sortByCreatedDesc(rows: Array<RecordRow>) {
  return [...rows].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
}

export async function listRecords(): Promise<Array<RecordRow>> {
  if (isDemoMode()) {
    return sortByCreatedDesc(demoRecords)
  }
  const db = getDb()
  return db.select().from(records).orderBy(desc(records.createdAt))
}

export async function getRecord(id: string): Promise<RecordRow | undefined> {
  if (isDemoMode()) {
    return demoRecords.find((r) => r.id === id)
  }
  const db = getDb()
  const [row] = await db.select().from(records).where(eq(records.id, id))
  return row
}

export async function createRecord(input: RecordInput): Promise<RecordRow> {
  if (isDemoMode()) {
    const row = toRow({ ...input, id: randomUUID() })
    demoRecords = [row, ...demoRecords]
    return row
  }
  const db = getDb()
  const [row] = await db.insert(records).values(input).returning()
  return row
}

export async function updateRecord(id: string, patch: Partial<RecordInput>): Promise<RecordRow | undefined> {
  if (isDemoMode()) {
    const index = demoRecords.findIndex((r) => r.id === id)
    if (index === -1) return undefined
    const updated: RecordRow = { ...demoRecords[index], ...patch, updatedAt: new Date() }
    demoRecords = [...demoRecords.slice(0, index), updated, ...demoRecords.slice(index + 1)]
    return updated
  }
  const db = getDb()
  const [row] = await db
    .update(records)
    .set({ ...patch, updatedAt: new Date() })
    .where(eq(records.id, id))
    .returning()
  return row
}

export async function deleteRecord(id: string): Promise<boolean> {
  if (isDemoMode()) {
    const before = demoRecords.length
    demoRecords = demoRecords.filter((r) => r.id !== id)
    return demoRecords.length < before
  }
  const db = getDb()
  const deleted = await db.delete(records).where(eq(records.id, id)).returning({ id: records.id })
  return deleted.length > 0
}
