import { NextRequest, NextResponse } from 'next/server'
import { ShiftNote } from '@/lib/types'
import { hfChat, HF_SUMMARY_MODEL, HF_SUMMARY_PROVIDER } from '@/lib/hf-client'

export interface ShiftSummaryRequest {
  notes: ShiftNote[]
  label?: string
}

export interface ShiftSummaryResponse {
  narrative: string
  themes: string[]
  actions: string[]
  open: string[]
  watch: string[]
  metrics: {
    noteCount: number
    completeCount: number
    incompleteCount: number
    avgScore: number
    topMachine: string | null
    topComponent: string | null
  }
}

// ─── Prompt ──────────────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `You write shift handover notes for manufacturing supervisors.

You will receive a numbered list of machine events. Write a summary using ONLY the facts given.
One line per machine event. Use plain, direct language. No filler words.

Output format — follow this exactly:
1. <Machine name>: <what happened>, <what was done>, <status>.
2. <Machine name>: <what happened>, <what was done>, <status>.

Rules:
- Copy the machine name exactly from the input
- status must be either "pending" or "resolved"
- Do not add any information not present in the input
- Do not use words: "overall", "notably", "the team", "operators", "diligently"
- If no action is listed, omit it
- Output only the numbered lines — no intro, no conclusion, no extra text`

/**
 * Build a compact, machine-grouped fact sheet for the model.
 * No raw transcript — only extracted structured fields.
 */
function buildFactSheet(notes: ShiftNote[]): string {
  const byMachine = new Map<string, ShiftNote[]>()
  for (const n of notes) {
    const key = n.structured.machine ?? '__none__'
    if (!byMachine.has(key)) byMachine.set(key, [])
    byMachine.get(key)!.push(n)
  }

  const lines: string[] = []
  let i = 1
  for (const [key, machineNotes] of byMachine) {
    const machine = key !== '__none__' ? key : 'unspecified machine'
    for (const n of machineNotes) {
      const s = n.structured
      const fields: string[] = [`${i}. machine="${machine}"`]
      if (s.reason)      fields.push(`problem="${s.reason}"`)
      if (s.component)   fields.push(`component="${s.component}"`)
      if (s.actionTaken) fields.push(`action="${s.actionTaken}"`)
      fields.push(`status="${n.isComplete ? 'resolved' : 'pending'}"`)
      lines.push(fields.join(' '))
      i++
    }
  }
  return lines.join('\n')
}

/**
 * Fallback narrative built from code — used if the LLM call fails or
 * returns unusable output.
 */
function buildFallbackNarrative(notes: ShiftNote[]): string {
  if (notes.length === 0) return 'No notes recorded for this shift.'

  const byMachine = new Map<string, ShiftNote[]>()
  for (const n of notes) {
    const key = n.structured.machine ?? '__none__'
    if (!byMachine.has(key)) byMachine.set(key, [])
    byMachine.get(key)!.push(n)
  }

  const machineNames = [...byMachine.keys()].filter(k => k !== '__none__')
  const pending = notes.filter(n => !n.isComplete).length
  const resolved = notes.length - pending

  const header = machineNames.length > 1
    ? `${machineNames.length} machines flagged — ${notes.length} note${notes.length > 1 ? 's' : ''} total.`
    : machineNames.length === 1
      ? `${machineNames[0]} — ${notes.length} note${notes.length > 1 ? 's' : ''} logged.`
      : `${notes.length} note${notes.length > 1 ? 's' : ''} logged.`

  let idx = 1
  const items: string[] = []
  for (const [key, machineNotes] of byMachine) {
    const machine = key !== '__none__' ? key : null
    for (const n of machineNotes) {
      const s = n.structured
      let line = `${idx}) `
      if (machine) line += `[${machine}] `
      if (s.reason && s.component) line += `${s.reason} on ${s.component}`
      else if (s.reason) line += s.reason
      else if (s.component) line += `issue on ${s.component}`
      else line += 'issue logged'
      if (s.actionTaken) line += ` → ${s.actionTaken}`
      line += n.isComplete ? ' ✓ resolved' : ' ⚠ pending'
      items.push(line)
      idx++
    }
  }

  const footer = pending === 0
    ? `All ${notes.length} issue${notes.length > 1 ? 's' : ''} resolved.`
    : pending === notes.length
      ? `All ${pending} issue${pending > 1 ? 's are' : ' is'} still open — hand over before leaving.`
      : `${resolved} resolved, ${pending} still open for the next crew.`

  return [header, ...items, footer].join('\n')
}

// ─── Structured chips (code-derived, no LLM) ─────────────────────────────────

function deriveStructuredFields(notes: ShiftNote[]): Pick<ShiftSummaryResponse, 'themes' | 'actions' | 'open' | 'watch'> {
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

  const open: string[] = []
  for (const n of notes) {
    if (n.isComplete) continue
    const machine = n.structured.machine
    const reason = n.structured.reason
    if (machine && reason) open.push(`${machine}: ${reason} (pending)`)
    else if (machine)      open.push(`${machine}: follow-up needed`)
    else if (reason)       open.push(`${reason} (pending)`)
    if (open.length >= 3) break
  }

  const watchSeen = new Set<string>()
  const watch: string[] = []
  for (const n of notes) {
    if (n.isComplete) continue
    const machine = n.structured.machine
    if (!machine || watchSeen.has(machine)) continue
    watchSeen.add(machine)
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

// ─── Metrics ─────────────────────────────────────────────────────────────────

function computeMetrics(notes: ShiftNote[]): ShiftSummaryResponse['metrics'] {
  const completeCount = notes.filter(n => n.isComplete).length
  const avgScore = notes.length
    ? Math.round(notes.reduce((s, n) => s + n.completenessScore, 0) / notes.length)
    : 0

  const machineCounts = new Map<string, number>()
  const componentCounts = new Map<string, number>()
  for (const n of notes) {
    if (n.structured.machine)
      machineCounts.set(n.structured.machine, (machineCounts.get(n.structured.machine) ?? 0) + 1)
    if (n.structured.component)
      componentCounts.set(n.structured.component, (componentCounts.get(n.structured.component) ?? 0) + 1)
  }

  return {
    noteCount: notes.length,
    completeCount,
    incompleteCount: notes.length - completeCount,
    avgScore,
    topMachine:    [...machineCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null,
    topComponent:  [...componentCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null,
  }
}

// ─── Handler ─────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  let body: ShiftSummaryRequest
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const notes: ShiftNote[] = Array.isArray(body.notes) ? body.notes : []
  const metrics = computeMetrics(notes)

  if (notes.length === 0) {
    return NextResponse.json({
      narrative: 'No operator notes recorded for this shift window.',
      themes: ['No data yet'],
      actions: ['No actions logged'],
      open: ['Await first tagged note'],
      watch: ['Note capture rate'],
      metrics,
    } satisfies ShiftSummaryResponse)
  }

  const structured = deriveStructuredFields(notes)

  // Ask Gemma 3 12B to write polished prose from structured facts only
  let narrative: string
  try {
    const factSheet = buildFactSheet(notes)
    const raw = await hfChat({
      provider: HF_SUMMARY_PROVIDER,
      model: HF_SUMMARY_MODEL,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: `Facts:\n${factSheet}` },
      ],
      maxTokens: 300,
      temperature: 0,
    })

    // Accept if output contains at least one numbered line (1. or 1) format)
    narrative = raw.trim()
    if (!narrative || !/^\d+[.)]\s/.test(narrative.split('\n').find(l => l.trim()) ?? '')) {
      narrative = buildFallbackNarrative(notes)
    }
  } catch {
    // Any API failure → fall back to code-generated narrative instantly
    narrative = buildFallbackNarrative(notes)
  }

  return NextResponse.json({ narrative, ...structured, metrics } satisfies ShiftSummaryResponse)
}
