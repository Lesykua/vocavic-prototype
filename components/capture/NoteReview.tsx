'use client'

import { useState, useEffect } from 'react'
import { useVoiceCapture } from '@/hooks/useVoiceCapture'
import { ShiftNote, ShiftNoteStructured, ParseNoteResponse, COMPLETENESS_THRESHOLD } from '@/lib/types'

interface NoteReviewProps {
  transcript: string
  deviceId: string
  onSave: (note: ShiftNote) => void
  onBack: () => void
}

type FieldKey = keyof Omit<ShiftNoteStructured, 'tags'>

const FIELD_META: Array<{ key: FieldKey; label: string; placeholder: string; weight: number }> = [
  { key: 'reason',      label: 'Reason for note',   placeholder: 'e.g. press temperature drift, board jam',          weight: 30 },
  { key: 'machine',     label: 'Machine / line',     placeholder: 'e.g. Hot Press 1, UV Coating Line',               weight: 25 },
  { key: 'actionTaken', label: 'Action taken',       placeholder: 'e.g. raised platen setpoint, replaced sanding belt', weight: 25 },
  { key: 'component',   label: 'Component involved', placeholder: 'e.g. press platen, glue roller, UV lamp',         weight: 10 },
  { key: 'lesson',      label: 'Lesson learned',     placeholder: 'e.g. check belt wear at each shift start',        weight: 10 },
]

function scoreFromFields(fields: Omit<ShiftNoteStructured, 'tags'>): number {
  return FIELD_META.reduce((acc, { key, weight }) => {
    const val = fields[key]
    return acc + (val && val.trim().length > 0 ? weight : 0)
  }, 0)
}

export function NoteReview({ transcript, deviceId, onSave, onBack }: NoteReviewProps) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tags, setTags] = useState<string[]>([])
  const [fields, setFields] = useState<Omit<ShiftNoteStructured, 'tags'>>({})
  const [missingFields, setMissingFields] = useState<string[]>([])

  // Voice fill state
  const [fillMode, setFillMode] = useState(false)
  const [fillMerging, setFillMerging] = useState(false)
  const [fillSuccess, setFillSuccess] = useState(false)
  const voiceFill = useVoiceCapture()

  // When fill recording finishes, parse and merge into fields
  useEffect(() => {
    if (voiceFill.state !== 'done' || !voiceFill.transcript) return

    async function mergeFields() {
      setFillMerging(true)
      try {
        const res = await fetch('/api/parse-note', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ transcript: voiceFill.transcript }),
        })
        const data = (await res.json()) as ParseNoteResponse & { error?: string }
        if (!res.ok) throw new Error(data.error ?? 'Parse failed')

        // Only fill fields that are currently empty
        setFields(prev => ({
          reason:      prev.reason      || data.structured.reason,
          machine:     prev.machine     || data.structured.machine,
          component:   prev.component   || data.structured.component,
          actionTaken: prev.actionTaken || data.structured.actionTaken,
          lesson:      prev.lesson      || data.structured.lesson,
        }))
        if (data.structured.tags?.length) {
          setTags(prev => Array.from(new Set([...prev, ...data.structured.tags])))
        }
        setFillSuccess(true)
        setTimeout(() => {
          setFillSuccess(false)
          setFillMode(false)
          voiceFill.reset()
        }, 1800)
      } catch (e) {
        console.error(e)
      } finally {
        setFillMerging(false)
      }
    }

    mergeFields()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [voiceFill.state, voiceFill.transcript])

  useEffect(() => {
    let cancelled = false
    async function parse() {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch('/api/parse-note', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ transcript }),
        })
        const data = (await res.json()) as ParseNoteResponse & { error?: string }
        if (!res.ok) throw new Error(data.error ?? 'Parse failed')
        if (!cancelled) {
          setTags(data.structured.tags ?? [])
          setFields({
            reason:      data.structured.reason,
            machine:     data.structured.machine,
            component:   data.structured.component,
            actionTaken: data.structured.actionTaken,
            lesson:      data.structured.lesson,
          })
          setMissingFields(data.missingFields)
        }
      } catch (e) {
        if (!cancelled) setError(String(e))
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    parse()
    return () => { cancelled = true }
  }, [transcript])

  // Recompute missing fields whenever fields change
  useEffect(() => {
    const missing = FIELD_META
      .filter(({ key }) => !fields[key] || (fields[key] as string).trim().length === 0)
      .map(({ label }) => label)
    setMissingFields(missing)
  }, [fields])

  const score = scoreFromFields(fields)
  const isComplete = score >= COMPLETENESS_THRESHOLD
  const hasMissing = missingFields.length > 0

  const handleSave = () => {
    const now = new Date().toISOString()
    const note: ShiftNote = {
      id: crypto.randomUUID(),
      timestamp: now,
      createdAt: now,
      deviceId,
      transcript,
      structured: { tags, ...fields },
      completenessScore: score,
      isComplete,
    }
    onSave(note)
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center gap-4 py-12">
        <div className="w-10 h-10 rounded-full border-4 border-t-transparent animate-spin"
          style={{ borderColor: '#0f5f68', borderTopColor: 'transparent' }} />
        <p className="text-sm" style={{ color: '#687d85' }}>Extracting fields with Llama 3.1…</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center gap-4 py-12">
        <p className="text-sm" style={{ color: '#d65848' }}>{error}</p>
        <button onClick={onBack} className="underline text-sm" style={{ color: '#0f5f68' }}>← Back</button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 w-full max-w-xl mx-auto">

      {/* Transcript */}
      <div className="rounded-2xl p-4 text-sm leading-relaxed" style={{ background: '#f2ebe0', color: '#687d85' }}>
        <span className="font-semibold uppercase text-xs tracking-widest block mb-1" style={{ color: '#0f5f68' }}>
          Transcript
        </span>
        &ldquo;{transcript}&rdquo;
      </div>

      {/* Tags */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {tags.map(tag => (
            <span
              key={tag}
              className="px-3 py-1 rounded-full text-xs font-medium"
              style={{ background: '#0f5f68', color: '#fff' }}
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Editable fields */}
      <div className="flex flex-col gap-4">
        {FIELD_META.map(({ key, label, placeholder, weight }) => {
          const value = fields[key] ?? ''
          const filled = value.trim().length > 0
          return (
            <div key={key} className="flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#12232c' }}>
                  {label}
                </label>
                <span className="text-xs" style={{ color: filled ? '#2f8f63' : '#c68a22' }}>
                  {filled ? `+${weight}pts` : `missing (${weight}pts)`}
                </span>
              </div>
              <input
                type="text"
                value={value}
                onChange={e => setFields(prev => ({ ...prev, [key]: e.target.value || undefined }))}
                placeholder={placeholder}
                className="w-full px-4 py-2 rounded-xl border text-sm outline-none focus:ring-2"
                style={{
                  borderColor: filled ? '#2f8f63' : '#c68a22',
                  background: '#fff',
                  color: '#12232c',
                }}
              />
            </div>
          )
        })}
      </div>

      {/* Voice fill for missing fields */}
      {hasMissing && (
        <div
          className="rounded-2xl border overflow-hidden"
          style={{ borderColor: 'rgba(198,138,34,0.35)', background: 'rgba(198,138,34,0.05)' }}
        >
          {!fillMode ? (
            <button
              onClick={() => setFillMode(true)}
              className="w-full flex items-center gap-3 px-5 py-4 text-left"
            >
              <span className="text-xl">🎙</span>
              <div>
                <p className="text-sm font-semibold" style={{ color: '#c68a22' }}>
                  Fill missing fields by voice
                </p>
                <p className="text-xs" style={{ color: '#687d85' }}>
                  Say what&apos;s missing — {missingFields.join(', ')}
                </p>
              </div>
            </button>
          ) : (
            <div className="px-5 py-4 flex flex-col items-center gap-3">
              <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#c68a22' }}>
                {fillMerging
                  ? 'Merging fields…'
                  : fillSuccess
                  ? '✓ Fields updated!'
                  : voiceFill.state === 'recording'
                  ? 'Recording… tap to stop'
                  : voiceFill.state === 'processing'
                  ? 'Transcribing…'
                  : `Say the missing info: ${missingFields.join(', ')}`}
              </p>

              {(fillMerging || voiceFill.state === 'processing') && (
                <div className="w-8 h-8 rounded-full border-4 border-t-transparent animate-spin"
                  style={{ borderColor: '#c68a22', borderTopColor: 'transparent' }} />
              )}

              {fillSuccess && (
                <span className="text-2xl">✅</span>
              )}

              {!fillMerging && !fillSuccess && voiceFill.state === 'idle' && (
                <button
                  onClick={voiceFill.startRecording}
                  className="w-16 h-16 rounded-full flex items-center justify-center shadow-lg"
                  style={{ background: '#c68a22' }}
                >
                  <MicIcon className="w-7 h-7 text-white" />
                </button>
              )}

              {!fillMerging && !fillSuccess && voiceFill.state === 'recording' && (
                <button
                  onClick={voiceFill.stopRecording}
                  className="w-16 h-16 rounded-full flex items-center justify-center shadow-lg animate-pulse"
                  style={{ background: '#d65848' }}
                >
                  <StopIcon className="w-7 h-7 text-white" />
                </button>
              )}

              {!fillMerging && !fillSuccess && voiceFill.state === 'idle' && (
                <button
                  onClick={() => { setFillMode(false); voiceFill.reset() }}
                  className="text-xs underline"
                  style={{ color: '#687d85' }}
                >
                  Cancel
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Completeness bar */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between text-sm">
          <span style={{ color: '#687d85' }}>Completeness</span>
          <span
            className="font-bold"
            style={{ color: isComplete ? '#2f8f63' : '#c68a22' }}
          >
            {score}/100 — {isComplete ? 'Complete' : 'Incomplete'}
          </span>
        </div>
        <div className="w-full h-3 rounded-full overflow-hidden" style={{ background: '#e0d9cf' }}>
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{
              width: `${score}%`,
              background: isComplete ? '#2f8f63' : '#c68a22',
            }}
          />
        </div>
        {!isComplete && missingFields.length > 0 && (
          <p className="text-xs" style={{ color: '#c68a22' }}>
            Add: {missingFields.join(', ')} to reach {COMPLETENESS_THRESHOLD}pts
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-3 pb-4">
        <button
          onClick={onBack}
          className="px-5 py-3 rounded-xl font-semibold border transition-colors"
          style={{ borderColor: '#687d85', color: '#687d85' }}
        >
          ← Back
        </button>
        <button
          onClick={handleSave}
          className="flex-1 py-3 rounded-xl font-semibold text-white transition-opacity"
          style={{ background: isComplete ? '#0f5f68' : '#c68a22' }}
        >
          {isComplete ? 'Save note' : 'Save anyway (incomplete)'}
        </button>
      </div>
    </div>
  )
}

function MicIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 10v2a7 7 0 0 1-14 0v-2" />
      <line x1="12" y1="19" x2="12" y2="23" />
      <line x1="8" y1="23" x2="16" y2="23" />
    </svg>
  )
}

function StopIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <rect x="4" y="4" width="16" height="16" rx="2" />
    </svg>
  )
}
