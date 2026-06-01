'use client'

import { useState, useEffect } from 'react'
import { VoiceCapture } from '@/components/capture/VoiceCapture'
import { NoteReview } from '@/components/capture/NoteReview'
import { ShiftSummary } from '@/components/capture/ShiftSummary'
import { ShiftNote } from '@/lib/types'
import { buildSeedNotes } from '@/lib/seed-notes'

const DEMO_SCRIPT =
  'Around 2am, Moulding Machine 3 went down — the temperature sensor kept triggering the overheating alarm, reading about 40 degrees above setpoint. I isolated the machine and called maintenance to check the cooling fan. Turned out the fan had a blocked filter cutting airflow. We cleared the blockage and restarted the machine. Lesson: cooling fan filters on Moulding Machine 3 should be checked every week.'

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
              style={{
                background: copied ? '#2f8f63' : '#0f5f68',
                color: '#fff',
              }}
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

const SHIFT_WINDOW_MS = 8 * 60 * 60 * 1000 // 8 hours = one shift

function getDeviceId(): string {
  if (typeof window === 'undefined') return 'unknown'
  let id = localStorage.getItem('shiftvoice_device_id')
  if (!id) {
    id = `device_${crypto.randomUUID().slice(0, 8)}`
    localStorage.setItem('shiftvoice_device_id', id)
  }
  return id
}

function saveNoteLocally(note: ShiftNote) {
  const existing = JSON.parse(localStorage.getItem('shiftvoice_notes') ?? '[]') as ShiftNote[]
  existing.unshift(note)
  localStorage.setItem('shiftvoice_notes', JSON.stringify(existing))
}

/** Returns the most recent note from this shift that shares machine or reason with the new note. */
function findRelatedNote(newNote: ShiftNote, existingNotes: ShiftNote[]): ShiftNote | null {
  const shiftStart = Date.now() - SHIFT_WINDOW_MS
  for (const n of existingNotes) {
    if (n.id === newNote.id) continue
    if (new Date(n.createdAt).getTime() < shiftStart) continue
    const sameMachine =
      n.structured.machine &&
      newNote.structured.machine &&
      n.structured.machine.toLowerCase() === newNote.structured.machine.toLowerCase()
    const sameReason =
      n.structured.reason &&
      newNote.structured.reason &&
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

  useEffect(() => {
    const id = getDeviceId()
    setDeviceId(id)
    const stored = JSON.parse(localStorage.getItem('shiftvoice_notes') ?? '[]') as ShiftNote[]
    if (stored.length === 0) {
      // First visit — seed the shift log with demo notes
      const seeds = buildSeedNotes(id)
      localStorage.setItem('shiftvoice_notes', JSON.stringify(seeds))
      setSavedNotes(seeds)
    } else {
      setSavedNotes(stored)
    }
  }, [])

  const handleTranscript = (t: string) => {
    setTranscript(t)
    setStep('review')
  }

  const handleSave = (note: ShiftNote) => {
    saveNoteLocally(note)
    // Detect related note before updating savedNotes state
    const related = findRelatedNote(note, savedNotes)
    setRelatedNote(related)
    setSavedNote(note)
    setSavedNotes(prev => [note, ...prev])
    setStep('saved')
  }

  const handleNew = () => {
    setTranscript('')
    setSavedNote(null)
    setRelatedNote(null)
    setStep('capture')
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
          ShiftVoice
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
                color: s === step || (step === 'saved') || (step === 'review' && i === 0) ? '#fff' : '#687d85',
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
                  : `Completeness: ${savedNote.completenessScore}/100 — marked incomplete`
                }
              </p>
            </div>

            {/* Summary card */}
            <div
              className="w-full rounded-2xl p-5 shadow-sm flex flex-col gap-3 text-sm"
              style={{ background: '#fff', color: '#12232c' }}
            >
              {savedNote.structured.reason && (
                <Row label="Reason" value={savedNote.structured.reason} />
              )}
              {savedNote.structured.machine && (
                <Row label="Machine" value={savedNote.structured.machine} />
              )}
              {savedNote.structured.component && (
                <Row label="Component" value={savedNote.structured.component} />
              )}
              {savedNote.structured.actionTaken && (
                <Row label="Action" value={savedNote.structured.actionTaken} />
              )}
              {savedNote.structured.lesson && (
                <Row label="Lesson" value={savedNote.structured.lesson} />
              )}
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
                  {relatedNote.structured.machine
                    ? ` on ${relatedNote.structured.machine}`
                    : ''}
                  {relatedNote.structured.reason
                    ? ` — ${relatedNote.structured.reason}`
                    : ''}
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

            {/* Shift summary — shown once there are notes */}
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
