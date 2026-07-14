'use client'

import { useState, useEffect } from 'react'
import { VoiceCapture } from '@/components/capture/VoiceCapture'
import { NoteReview } from '@/components/capture/NoteReview'
import { ShiftSummary } from '@/components/capture/ShiftSummary'
import { ShiftNote } from '@/lib/types'
import { buildSeedNotes } from '@/lib/seed-notes'

const DEMO_SCRIPT =
  'Around 9am, Hot Press 1 showed a platen temperature deviation — the upper platen was reading about 12 degrees below setpoint. I paused the press cycle and found a loose thermocouple connection on the controller board. I re-seated the connector, restarted the heating zone, and temperature came back to normal within 15 minutes. We had three boards in the press that need to go to QC for a delamination check. Suggest we add quarterly thermocouple connection checks to the press maintenance schedule.'

function DemoScriptCard() {
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(DEMO_SCRIPT).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div
      className="w-full rounded-2xl border overflow-hidden mb-6"
      style={{ borderColor: 'rgba(15,95,104,0.25)', background: 'rgba(15,95,104,0.04)' }}
    >
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-5 py-3.5 text-left"
      >
        <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#0f5f68' }}>
          🎬 Demo script — say this aloud
        </span>
        <span className="text-lg" style={{ color: '#0f5f68' }}>{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div className="px-5 pb-5 flex flex-col gap-3">
          <p
            className="text-sm leading-relaxed rounded-xl p-4 italic"
            style={{ background: '#fff', color: '#12232c', border: '1px solid rgba(18,35,44,0.1)' }}
          >
            &ldquo;{DEMO_SCRIPT}&rdquo;
          </p>
          <div className="flex items-center justify-between">
            <p className="text-xs" style={{ color: '#687d85' }}>
              Hits all 5 fields — expect <strong style={{ color: '#2f8f63' }}>100 / 100</strong> completeness
            </p>
            <button
              onClick={handleCopy}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
              style={{ background: copied ? '#2f8f63' : '#0f5f68', color: '#fff' }}
            >
              {copied ? '✓ Copied' : 'Copy text'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

type Step = 'capture' | 'review' | 'saved'

const SHIFT_WINDOW_MS = 8 * 60 * 60 * 1000

function getDeviceId(): string {
  if (typeof window === 'undefined') return 'unknown'
  let id = localStorage.getItem('vocavic_device_id')
  if (!id) {
    id = `device_${crypto.randomUUID().slice(0, 8)}`
    localStorage.setItem('vocavic_device_id', id)
  }
  return id
}

function saveNoteLocally(note: ShiftNote) {
  const existing = JSON.parse(localStorage.getItem('vocavic_notes') ?? '[]') as ShiftNote[]
  existing.unshift(note)
  localStorage.setItem('vocavic_notes', JSON.stringify(existing))
}

// ── Shared-backend sync ─────────────────────────────────────────────────────
// localStorage stays the instant, never-blocks-on-network write path (shop
// floor wifi may be flaky) — this layer mirrors saved notes to the shared
// Postgres table in the background so they show up on other devices too.
const PILOT_CODE_KEY = 'vocavic_pilot_code'
const SYNCED_IDS_KEY = 'vocavic_synced_ids'

function getStoredPilotCode(): string | null {
  return localStorage.getItem(PILOT_CODE_KEY)
}

function setStoredPilotCode(code: string) {
  localStorage.setItem(PILOT_CODE_KEY, code)
}

function clearStoredPilotCode() {
  localStorage.removeItem(PILOT_CODE_KEY)
}

function getSyncedIds(): Set<string> {
  try {
    const raw = localStorage.getItem(SYNCED_IDS_KEY)
    return new Set(raw ? (JSON.parse(raw) as string[]) : [])
  } catch {
    return new Set()
  }
}

function markSynced(id: string) {
  const ids = getSyncedIds()
  ids.add(id)
  localStorage.setItem(SYNCED_IDS_KEY, JSON.stringify([...ids]))
}

/** Demo scaffolding never leaves the browser it was seeded on. */
function isSyncable(note: ShiftNote): boolean {
  return !note.id.startsWith('seed-')
}

async function syncNoteToServer(note: ShiftNote, code: string): Promise<boolean> {
  try {
    const res = await fetch('/api/notes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-pilot-code': code },
      body: JSON.stringify(note),
    })
    if (res.ok) {
      markSynced(note.id)
      return true
    }
    return false
  } catch {
    return false
  }
}

/** Verifies a pilot code and, if valid, fetches this shift's notes from every device. */
async function fetchServerNotes(code: string): Promise<{ ok: boolean; notes: ShiftNote[] }> {
  try {
    const since = new Date(Date.now() - SHIFT_WINDOW_MS).toISOString()
    const res = await fetch(`/api/notes?since=${encodeURIComponent(since)}&limit=200`, {
      headers: { 'x-pilot-code': code },
    })
    if (res.status === 401) return { ok: false, notes: [] }
    if (!res.ok) return { ok: true, notes: [] } // reachable but errored server-side — don't kick the user back to the gate
    const data = (await res.json()) as { notes: ShiftNote[] }
    return { ok: true, notes: data.notes }
  } catch {
    return { ok: true, notes: [] } // offline — proceed with local notes only
  }
}

function mergeNotesById(a: ShiftNote[], b: ShiftNote[]): ShiftNote[] {
  const byId = new Map<string, ShiftNote>()
  for (const n of [...a, ...b]) byId.set(n.id, n)
  return [...byId.values()].sort((x, y) => new Date(y.createdAt).getTime() - new Date(x.createdAt).getTime())
}

async function flushOutbox(notes: ShiftNote[], code: string) {
  const synced = getSyncedIds()
  const pending = notes.filter((n) => isSyncable(n) && !synced.has(n.id))
  for (const note of pending) {
    await syncNoteToServer(note, code)
  }
}

/** Returns the most recent same-shift note that shares machine or reason. */
function findRelatedNote(newNote: ShiftNote, existingNotes: ShiftNote[]): ShiftNote | null {
  const shiftStart = Date.now() - SHIFT_WINDOW_MS
  for (const n of existingNotes) {
    if (n.id === newNote.id) continue
    if (new Date(n.createdAt).getTime() < shiftStart) continue
    const sameMachine =
      n.structured.machine && newNote.structured.machine &&
      n.structured.machine.toLowerCase() === newNote.structured.machine.toLowerCase()
    const sameReason =
      n.structured.reason && newNote.structured.reason &&
      n.structured.reason.toLowerCase() === newNote.structured.reason.toLowerCase()
    if (sameMachine || sameReason) return n
  }
  return null
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

export default function CapturePage() {
  const [step, setStep] = useState<Step>('capture')
  const [transcript, setTranscript] = useState<string>('')
  const [savedNote, setSavedNote] = useState<ShiftNote | null>(null)
  const [savedNotes, setSavedNotes] = useState<ShiftNote[]>([])
  const [deviceId, setDeviceId] = useState('loading…')
  const [relatedNote, setRelatedNote] = useState<ShiftNote | null>(null)
  const [pilotCode, setPilotCode] = useState<string | null>(null)
  const [gateOpen, setGateOpen] = useState(true)
  const [gateInput, setGateInput] = useState('')
  const [gateError, setGateError] = useState<string | null>(null)
  const [gateChecking, setGateChecking] = useState(false)

  const unlockWithCode = async (code: string, localNotes: ShiftNote[]) => {
    const { ok, notes: serverNotes } = await fetchServerNotes(code)
    if (!ok) {
      clearStoredPilotCode()
      setGateError('That code was rejected — try again.')
      setGateOpen(true)
      return
    }
    setStoredPilotCode(code)
    setPilotCode(code)
    setGateOpen(false)
    setGateError(null)
    const merged = mergeNotesById(localNotes, serverNotes)
    setSavedNotes(merged)
    void flushOutbox(localNotes, code)
  }

  useEffect(() => {
    const id = getDeviceId()
    setDeviceId(id)
    const stored = JSON.parse(localStorage.getItem('vocavic_notes') ?? '[]') as ShiftNote[]
    // Re-seed whenever only seed notes are present (keeps timestamps fresh across sessions)
    const onlySeedNotes = stored.length === 0 || stored.every(n => n.id.startsWith('seed-'))
    let initial: ShiftNote[]
    if (onlySeedNotes) {
      const seeds = buildSeedNotes(id)
      localStorage.setItem('vocavic_notes', JSON.stringify(seeds))
      initial = seeds
    } else {
      initial = stored
    }
    setSavedNotes(initial)

    const storedCode = getStoredPilotCode()
    if (storedCode) {
      unlockWithCode(storedCode, initial)
    } else {
      setGateOpen(true)
    }
  }, [])

  // Retry any notes that failed to sync once the device comes back online.
  useEffect(() => {
    const onOnline = () => {
      if (pilotCode) void flushOutbox(savedNotes, pilotCode)
    }
    window.addEventListener('online', onOnline)
    return () => window.removeEventListener('online', onOnline)
  }, [pilotCode, savedNotes])

  const handleGateSubmit = async () => {
    const code = gateInput.trim()
    if (!code) return
    setGateChecking(true)
    setGateError(null)
    await unlockWithCode(code, savedNotes)
    setGateChecking(false)
  }

  const handleTranscript = (t: string) => {
    setTranscript(t)
    setStep('review')
  }

  const handleSave = (note: ShiftNote) => {
    saveNoteLocally(note)
    const related = findRelatedNote(note, savedNotes)
    setRelatedNote(related)
    setSavedNote(note)
    setSavedNotes(prev => [note, ...prev])
    setStep('saved')
    if (pilotCode && isSyncable(note)) void syncNoteToServer(note, pilotCode)
  }

  const handleNew = () => {
    setTranscript('')
    setSavedNote(null)
    setRelatedNote(null)
    setStep('capture')
  }

  if (gateOpen) {
    return (
      <main
        className="min-h-screen flex items-center justify-center px-4"
        style={{ background: '#f2ebe0', fontFamily: 'var(--font-barlow, sans-serif)' }}
      >
        <div className="w-full max-w-sm rounded-2xl p-6 shadow-sm flex flex-col gap-4" style={{ background: '#fff' }}>
          <div className="text-center">
            <p className="font-semibold text-lg" style={{ color: '#0f5f68' }}>Vocavic</p>
            <p className="text-sm mt-1" style={{ color: '#687d85' }}>Enter the pilot access code to capture and view shift notes.</p>
          </div>
          <input
            type="password"
            value={gateInput}
            onChange={(e) => setGateInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleGateSubmit() }}
            placeholder="Pilot access code"
            className="w-full px-4 py-3 rounded-xl text-sm"
            style={{ border: '1px solid rgba(18,35,44,0.15)', color: '#12232c' }}
            autoFocus
          />
          {gateError && <p className="text-xs text-center" style={{ color: '#d65848' }}>{gateError}</p>}
          <button
            onClick={handleGateSubmit}
            disabled={gateChecking || !gateInput.trim()}
            className="w-full py-3 rounded-xl font-semibold text-white disabled:opacity-50"
            style={{ background: '#0f5f68' }}
          >
            {gateChecking ? 'Checking…' : 'Continue'}
          </button>
        </div>
      </main>
    )
  }

  return (
    <main
      className="min-h-screen flex flex-col"
      style={{ background: '#f2ebe0', fontFamily: 'var(--font-barlow, sans-serif)' }}
    >
      {/* Header */}
      <header
        className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 shadow-sm"
        style={{ background: '#fff' }}
      >
        <a href="/" className="font-semibold text-lg tracking-tight" style={{ color: '#0f5f68' }}>
          Vocavic
        </a>
        <div className="flex items-center gap-3">
          <a
            href="/live-dashboard.html"
            target="_blank"
            className="text-xs px-3 py-1 rounded-full font-medium transition-opacity hover:opacity-80"
            style={{ background: '#0f5f68', color: '#fff' }}
          >
            Dashboard →
          </a>
          <span className="text-xs px-3 py-1 rounded-full" style={{ background: '#f2ebe0', color: '#687d85' }}>
            {deviceId}
          </span>
        </div>
      </header>

      {/* Step indicator */}
      <div className="flex items-center justify-center gap-3 py-6 px-4">
        {(['capture', 'review', 'saved'] as Step[]).map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            {i > 0 && <div className="w-8 h-px" style={{ background: '#c5bfb7' }} />}
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
              style={{
                background: s === step ? '#0f5f68' : step === 'saved' || (step === 'review' && i === 0) ? '#2f8f63' : '#e0d9cf',
                color: s === step || step === 'saved' || (step === 'review' && i === 0) ? '#fff' : '#687d85',
              }}
            >
              {step === 'saved' || (step === 'review' && i === 0) ? '✓' : i + 1}
            </div>
            <span className="text-xs capitalize hidden sm:inline" style={{ color: s === step ? '#0f5f68' : '#687d85' }}>
              {s === 'saved' ? 'done' : s}
            </span>
          </div>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 px-4 pb-12 max-w-2xl mx-auto w-full">

        {step === 'capture' && (
          <>
            <h1 className="text-2xl font-bold text-center mb-2" style={{ color: '#12232c' }}>
              Capture shift note
            </h1>
            <p className="text-sm text-center mb-6" style={{ color: '#687d85' }}>
              Tap the mic and describe the event. Mention the machine, component, problem, and what you did.
            </p>
            <DemoScriptCard />
            <VoiceCapture onTranscript={handleTranscript} />
          </>
        )}

        {step === 'review' && (
          <>
            <h1 className="text-2xl font-bold text-center mb-2" style={{ color: '#12232c' }}>
              Review & confirm
            </h1>
            <p className="text-sm text-center mb-8" style={{ color: '#687d85' }}>
              Llama 3.1 extracted these fields. Edit anything that looks wrong.
            </p>
            <NoteReview
              transcript={transcript}
              deviceId={deviceId}
              onSave={handleSave}
              onBack={() => setStep('capture')}
            />
          </>
        )}

        {step === 'saved' && savedNote && (
          <div className="flex flex-col items-center gap-6 py-12">
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center text-4xl shadow-lg"
              style={{ background: savedNote.isComplete ? '#2f8f63' : '#c68a22' }}
            >
              {savedNote.isComplete ? '✓' : '!'}
            </div>

            <div className="text-center">
              <h2 className="text-2xl font-bold mb-1" style={{ color: '#12232c' }}>
                Note saved
              </h2>
              <p className="text-sm" style={{ color: '#687d85' }}>
                {savedNote.isComplete
                  ? `Completeness: ${savedNote.completenessScore}/100 — fully captured`
                  : `Completeness: ${savedNote.completenessScore}/100 — marked incomplete`}
              </p>
            </div>

            {/* Saved note summary card */}
            <div
              className="w-full rounded-2xl p-5 shadow-sm flex flex-col gap-3 text-sm"
              style={{ background: '#fff', color: '#12232c' }}
            >
              {savedNote.structured.reason && <Row label="Reason" value={savedNote.structured.reason} />}
              {savedNote.structured.machine && <Row label="Machine" value={savedNote.structured.machine} />}
              {savedNote.structured.component && <Row label="Component" value={savedNote.structured.component} />}
              {savedNote.structured.actionTaken && <Row label="Action" value={savedNote.structured.actionTaken} />}
              {savedNote.structured.lesson && <Row label="Lesson" value={savedNote.structured.lesson} />}
              {savedNote.structured.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {savedNote.structured.tags.map(t => (
                    <span key={t} className="px-2 py-0.5 rounded-full text-xs" style={{ background: '#0f5f68', color: '#fff' }}>
                      {t}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Related note banner */}
            {relatedNote && (
              <div
                className="w-full rounded-2xl p-5 flex flex-col gap-2"
                style={{ background: 'rgba(47,143,99,0.08)', border: '1px solid rgba(47,143,99,0.3)' }}
              >
                <div className="flex items-center gap-2">
                  <span className="text-base">🔗</span>
                  <p className="text-sm font-semibold" style={{ color: '#2f8f63' }}>
                    Looks like a follow-up
                  </p>
                </div>
                <p className="text-xs leading-relaxed" style={{ color: '#687d85' }}>
                  This note matches your{' '}
                  <strong style={{ color: '#12232c' }}>{formatTime(relatedNote.createdAt)}</strong>{' '}
                  note
                  {relatedNote.structured.machine ? ` on ${relatedNote.structured.machine}` : ''}
                  {relatedNote.structured.reason ? ` — ${relatedNote.structured.reason}` : ''}
                  . Both are saved separately in this shift&apos;s log.
                </p>
              </div>
            )}

            <button
              onClick={handleNew}
              className="w-full max-w-xs py-3 rounded-xl font-semibold text-white"
              style={{ background: '#0f5f68' }}
            >
              Capture another note
            </button>

            <div className="w-full mt-4">
              <ShiftSummary notes={savedNotes} label={`Device ${deviceId}`} />
            </div>
          </div>
        )}
      </div>
    </main>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-3">
      <span className="w-24 shrink-0 font-semibold text-xs uppercase tracking-wide" style={{ color: '#687d85' }}>
        {label}
      </span>
      <span style={{ color: '#12232c' }}>{value}</span>
    </div>
  )
}
