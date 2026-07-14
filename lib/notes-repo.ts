import { sql, ensureNotesTable } from './db'
import { ShiftNote } from './types'

interface NoteRow {
  id: string
  timestamp: Date | string
  device_id: string
  transcript: string
  tags: string[] | null
  reason: string | null
  machine: string | null
  component: string | null
  action_taken: string | null
  lesson: string | null
  completeness_score: number
  is_complete: boolean
  created_at: Date | string
}

function toIso(value: Date | string): string {
  return typeof value === 'string' ? value : value.toISOString()
}

export function rowToNote(row: NoteRow): ShiftNote {
  return {
    id: row.id,
    timestamp: toIso(row.timestamp),
    deviceId: row.device_id,
    transcript: row.transcript,
    structured: {
      tags: row.tags ?? [],
      reason: row.reason ?? undefined,
      machine: row.machine ?? undefined,
      component: row.component ?? undefined,
      actionTaken: row.action_taken ?? undefined,
      lesson: row.lesson ?? undefined,
    },
    completenessScore: row.completeness_score,
    isComplete: row.is_complete,
    createdAt: toIso(row.created_at),
  }
}

export async function insertNote(note: ShiftNote): Promise<ShiftNote> {
  await ensureNotesTable()
  const rows = await sql<NoteRow>`
    INSERT INTO notes (
      id, timestamp, device_id, transcript, tags,
      reason, machine, component, action_taken, lesson,
      completeness_score, is_complete, created_at
    ) VALUES (
      ${note.id}, ${note.timestamp}, ${note.deviceId}, ${note.transcript}, ${note.structured.tags ?? []},
      ${note.structured.reason ?? null}, ${note.structured.machine ?? null}, ${note.structured.component ?? null},
      ${note.structured.actionTaken ?? null}, ${note.structured.lesson ?? null},
      ${note.completenessScore}, ${note.isComplete}, ${note.createdAt}
    )
    ON CONFLICT (id) DO UPDATE SET
      timestamp = EXCLUDED.timestamp,
      device_id = EXCLUDED.device_id,
      transcript = EXCLUDED.transcript,
      tags = EXCLUDED.tags,
      reason = EXCLUDED.reason,
      machine = EXCLUDED.machine,
      component = EXCLUDED.component,
      action_taken = EXCLUDED.action_taken,
      lesson = EXCLUDED.lesson,
      completeness_score = EXCLUDED.completeness_score,
      is_complete = EXCLUDED.is_complete,
      created_at = EXCLUDED.created_at
    RETURNING *
  `
  return rowToNote(rows[0])
}

export async function listNotes(options: { since?: string; deviceId?: string; limit?: number } = {}): Promise<ShiftNote[]> {
  await ensureNotesTable()
  const limit = Math.min(options.limit ?? 200, 1000)
  const rows = await sql<NoteRow>`
    SELECT * FROM notes
    WHERE (${options.since ?? null}::timestamptz IS NULL OR created_at >= ${options.since ?? null}::timestamptz)
      AND (${options.deviceId ?? null}::text IS NULL OR device_id = ${options.deviceId ?? null})
    ORDER BY created_at DESC
    LIMIT ${limit}
  `
  return rows.map(rowToNote)
}

export async function deleteNote(id: string): Promise<boolean> {
  await ensureNotesTable()
  const rows = await sql<{ id: string }>`DELETE FROM notes WHERE id = ${id} RETURNING id`
  return rows.length > 0
}
