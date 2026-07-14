import { neon, NeonQueryFunction } from '@neondatabase/serverless'

// Lazy — avoids throwing at module-import time if the env var isn't set yet
// (e.g. during `next build` without a database configured).
let client: NeonQueryFunction<false, false> | null = null
function getClient(): NeonQueryFunction<false, false> {
  if (!client) {
    const url = process.env.DATABASE_URL || process.env.POSTGRES_URL
    if (!url) throw new Error('DATABASE_URL (or POSTGRES_URL) not configured')
    client = neon(url)
  }
  return client
}

export function sql<T = Record<string, unknown>>(strings: TemplateStringsArray, ...values: unknown[]): Promise<T[]> {
  return getClient()(strings, ...values) as Promise<T[]>
}

// Prototype-stage bootstrap: no migration tool, just an idempotent create.
// Replace with real migrations before a wider rollout.
let ensured: Promise<unknown> | null = null

export function ensureNotesTable() {
  if (!ensured) {
    ensured = sql`
      CREATE TABLE IF NOT EXISTS notes (
        id                  TEXT PRIMARY KEY,
        timestamp           TIMESTAMPTZ NOT NULL,
        device_id           TEXT NOT NULL,
        transcript          TEXT NOT NULL,
        tags                TEXT[] NOT NULL DEFAULT '{}',
        reason              TEXT,
        machine             TEXT,
        component           TEXT,
        action_taken        TEXT,
        lesson              TEXT,
        completeness_score  INTEGER NOT NULL,
        is_complete         BOOLEAN NOT NULL,
        created_at          TIMESTAMPTZ NOT NULL
      )
    `.then(() =>
      sql`CREATE INDEX IF NOT EXISTS notes_created_at_idx ON notes (created_at DESC)`
    ).then(() =>
      sql`CREATE INDEX IF NOT EXISTS notes_device_id_idx ON notes (device_id)`
    )
  }
  return ensured
}
