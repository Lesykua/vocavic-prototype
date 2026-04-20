'use client'

import { useState, useEffect } from 'react'
import { VoiceCapture } from '@/components/capture/VoiceCapture'
import { NoteReview } from '@/components/capture/NoteReview'
import { ShiftSummary } from '@/components/capture/ShiftSummary'
import { ShiftNote } from '@/lib/types'

type Step = 'capture' | 'review' | 'saved'

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

export default function CapturePage() {
  const [step, setStep] = useState<Step>('capture')
  const [transcript, setTranscript] = useState<string>('')
  const [savedNote, setSavedNote] = useState<ShiftNote | null>(null)
  const [savedNotes, setSavedNotes] = useState<ShiftNote[]>([])
  const [deviceId, setDeviceId] = useState('loading…')

  useEffect(() => {
    setDeviceId(getDeviceId())
    const stored = JSON.parse(localStorage.getItem('shiftvoice_notes') ?? '[]') as ShiftNote[]
    setSavedNotes(stored)
  }, [])

  const handleTranscript = (t: string) => {
    setTranscript(t)
    setStep('review')
  }

  const handleSave = (note: ShiftNote) => {
    saveNoteLocally(note)
    setSavedNote(note)
    setSavedNotes(prev => [note, ...prev])
    setStep('saved')
  }

  const handleNew = () => {
    setTranscript('')
    setSavedNote(null)
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
            <p className="text-sm text-center mb-8" style={{ color: '#687d85' }}>
              Tap the mic and describe the event. Mention the machine, component, problem, and what you did.
            </p>
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
