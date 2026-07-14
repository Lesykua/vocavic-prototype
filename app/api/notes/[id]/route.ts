import { NextRequest, NextResponse } from 'next/server'
import { deleteNote } from '@/lib/notes-repo'

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  try {
    const deleted = await deleteNote(id)
    if (!deleted) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 })
    }
    return NextResponse.json({ ok: true })
  } catch (err) {
    return NextResponse.json({ error: 'Failed to delete note', detail: String(err) }, { status: 500 })
  }
}
