import { NextRequest, NextResponse } from 'next/server'
import { ShiftNote } from '@/lib/types'
import { insertNote, listNotes } from '@/lib/notes-repo'
import { requirePilotCode } from '@/lib/auth'

function isValidNote(body: unknown): body is ShiftNote {
  if (!body || typeof body !== 'object') return false
  const n = body as Record<string, unknown>
  return (
    typeof n.id === 'string' &&
    typeof n.timestamp === 'string' &&
    typeof n.deviceId === 'string' &&
    typeof n.transcript === 'string' &&
    typeof n.structured === 'object' && n.structured !== null &&
    typeof n.completenessScore === 'number' &&
    typeof n.isComplete === 'boolean' &&
    typeof n.createdAt === 'string'
  )
}

export async function POST(req: NextRequest) {
  const unauthorized = requirePilotCode(req)
  if (unauthorized) return unauthorized

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  if (!isValidNote(body)) {
    return NextResponse.json({ error: 'Invalid note shape' }, { status: 400 })
  }

  try {
    const note = await insertNote(body)
    return NextResponse.json({ note }, { status: 201 })
  } catch (err) {
    return NextResponse.json({ error: 'Failed to save note', detail: String(err) }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  const unauthorized = requirePilotCode(req)
  if (unauthorized) return unauthorized

  const { searchParams } = new URL(req.url)
  const since = searchParams.get('since') ?? undefined
  const deviceId = searchParams.get('deviceId') ?? undefined
  const limitParam = searchParams.get('limit')
  const limit = limitParam ? Number(limitParam) : undefined

  try {
    const notes = await listNotes({ since, deviceId, limit })
    return NextResponse.json({ notes })
  } catch (err) {
    return NextResponse.json({ error: 'Failed to list notes', detail: String(err) }, { status: 500 })
  }
}
