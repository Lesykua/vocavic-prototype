import { NextRequest, NextResponse } from 'next/server'
import { ShiftNote } from '@/lib/types'

export interface ShiftSummaryRequest {
  notes: ShiftNote[]
  /** Optional label, e.g. "Day shift · Moulding Machine 3" */
  label?: string
}

export interface ShiftSummaryResponse {
  /** 60–80 word narrative paragraph */
  narrative: string
  /** Top recurring themes (max 3) */
  themes: string[]
  /** Key actions taken (max 3) */
  actions: string[]
  /** Open items / follow-ups (max 3) */
  open: string[]
  /** What to watch next shift (max 2) */
  watch: string[]
  metrics: {
    noteCount: number
    completeCount: number
    incompleteCount: number
    avgScore: number
    /** Most mentioned machine */
    topMachine: string | null
    /** Most mentioned component */
    topComponent: string | null
  }
}

/**
 * Build the narrative entirely from structured data — no LLM, no hallucination.
 * One sentence per note, grouped by machine.
 * Format: "[Machine]: [reason] ([component]) — [actionTaken]. [Pending/Resolved]."
 */
function buildNarrative(notes: ShiftNote[]): string {
  if (notes.length === 0) return 'No notes recorded for this shift.'

  // Group by machine so same-machine notes appear together
  const byMachine = new Map<string, ShiftNote[]>()
  for (const n of notes) {
    const key = n.structured.machine ?? '__none__'
    if (!byMachine.has(key)) byMachine.set(key, [])
    byMachine.get(key)!.push(n)
  }

  const sentences: string[] = []
  for (const [machine, machineNotes] of byMachine) {
    for (const n of machineNotes) {
      const s = n.structured
      const parts: string[] = []

      // Lead with machine name
      if (machine !== '__none__') parts.push(`${machine}:`)

      // Problem + component
      if (s.reason && s.component) parts.push(`${s.reason} (${s.component})`)
      else if (s.reason)           parts.push(s.reason)
      else if (s.component)        parts.push(`issue on ${s.component}`)
      else                         parts.push('issue logged')

      // Action
      if (s.actionTaken) parts.push(`— ${s.actionTaken}`)

      // Status
      parts.push(n.isComplete ? '(resolved).' : '(pending).')

      sentences.push(parts.join(' '))
    }
  }

  return sentences.join(' ')
}

/**
 * Derive themes, actions, open items, and watch list directly from structured
 * note data — no LLM needed, no risk of hallucination.
 */
function deriveStructuredFields(notes: ShiftNote[]): Pick<ShiftSummaryResponse, 'themes' | 'actions' | 'open' | 'watch'> {
  // themes: "reason — machine" for each unique (machine, reason) pair
  const themeSeen = new Set<string>()
  const themes: string[] = []
  for (const n of notes) {
    const machine = n.structured.machine
    const reason = n.structured.reason
    if (!reason) continue
    const key = `${machine ?? ''}::${reason}`
    if (themeSeen.has(key)) continue
    themeSeen.add(key)
    themes.push(machine ? `${reason} — ${machine}` : reason)
    if (themes.length >= 3) break
  }

  // actions: "action — machine" for each unique (machine, actionTaken) pair
  const actionSeen = new Set<string>()
  const actions: string[] = []
  for (const n of notes) {
    const machine = n.structured.machine
    const action = n.structured.actionTaken
    if (!action) continue
    const key = `${machine ?? ''}::${action}`
    if (actionSeen.has(key)) continue
    actionSeen.add(key)
    actions.push(machine ? `${action} — ${machine}` : action)
    if (actions.length >= 3) break
  }

  // open: pending notes listed as "machine: reason"
  const open: string[] = []
  for (const n of notes) {
    if (n.isComplete) continue
    const machine = n.structured.machine
    const reason = n.structured.reason
    if (machine && reason) open.push(`${machine}: ${reason} (pending)`)
    else if (machine)      open.push(`${machine}: follow-up needed`)
    else if (reason)       open.push(`${reason} (pending, machine unspecified)`)
    if (open.length >= 3) break
  }

  // watch: machines with unresolved issues
  const watchMachines = new Set<string>()
  const watch: string[] = []
  for (const n of notes) {
    if (n.isComplete) continue
    const machine = n.structured.machine
    if (!machine || watchMachines.has(machine)) continue
    watchMachines.add(machine)
    const reason = n.structured.reason
    watch.push(reason ? `${machine} — ${reason} unresolved` : `${machine} — issue unresolved`)
    if (watch.length >= 2) break
  }

  return {
    themes: themes.length ? themes : ['No specific problems identified'],
    actions: actions.length ? actions : ['No actions logged'],
    open: open.length ? open : ['Nothing outstanding'],
    watch: watch.length ? watch : ['Nothing to flag'],
  }
}

function computeMetrics(notes: ShiftNote[]): ShiftSummaryResponse['metrics'] {
  const completeCount = notes.filter(n => n.isComplete).length
  const avgScore = notes.length
    ? Math.round(notes.reduce((s, n) => s + n.completenessScore, 0) / notes.length)
    : 0

  // Most frequently mentioned machine
  const machineCounts = new Map<string, number>()
  const componentCounts = new Map<string, number>()
  for (const n of notes) {
    if (n.structured.machine) machineCounts.set(n.structured.machine, (machineCounts.get(n.structured.machine) ?? 0) + 1)
    if (n.structured.component) componentCounts.set(n.structured.component, (componentCounts.get(n.structured.component) ?? 0) + 1)
  }
  const topMachine = [...machineCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null
  const topComponent = [...componentCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null

  return {
    noteCount: notes.length,
    completeCount,
    incompleteCount: notes.length - completeCount,
    avgScore,
    topMachine,
    topComponent,
  }
}

export async function POST(req: NextRequest) {
  let body: ShiftSummaryRequest
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const notes: ShiftNote[] = Array.isArray(body.notes) ? body.notes : []
  const metrics = computeMetrics(notes)

  // If no notes, return a static empty summary (no LLM call needed)
  if (notes.length === 0) {
    const empty: ShiftSummaryResponse = {
      narrative: 'No operator notes have been recorded for this shift window. Verify that notes are being captured and tagged correctly before the shift ends.',
      themes: ['No data yet'],
      actions: ['No actions logged'],
      open: ['Await first tagged note'],
      watch: ['Note capture rate'],
      metrics,
    }
    return NextResponse.json(empty)
  }

  const narrative = buildNarrative(notes)
  const structured = deriveStructuredFields(notes)

  const response: ShiftSummaryResponse = { narrative, ...structured, metrics }
  return NextResponse.json(response)
}
