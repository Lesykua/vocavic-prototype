'use client'

import { useState, useEffect } from 'react'
import { ShiftNote, ShiftNoteStructured, ParseNoteResponse, COMPLETENESS_THRESHOLD } from '@/lib/types'

interface NoteReviewProps {
  transcript: string
  deviceId: string
  onSave: (note: ShiftNote) => void
  onBack: () => void
}

type FieldKey = keyof Omit<ShiftNoteStructured, 'tags'>

const FIELD_META: Array<{ key: FieldKey; label: string; placeholder: string; weight: number }> = [
  { key: 'reason',      label: 'Reason for note',   placeholder: 'e.g. overheating, seal failure',        weight: 30 },
  { key: 'machine',     label: 'Machine / line',     placeholder: 'e.g. moulding machine 3, line 2',       weight: 25 },
  { key: 'actionTaken', label: 'Action taken',       placeholder: 'e.g. called maintenance, changed seal', weight: 25 },
  { key: 'component',   label: 'Component involved', placeholder: 'e.g. seal, motor, bearing',             weight: 10 },
  { key: 'lesson',      label: 'Lesson learned',     placeholder: 'e.g. inspect seals weekly',             weight: 10 },
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

  const score = scoreFromFields(fields)
  const isComplete = score >= COMPLETENESS_THRESHOLD

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
        "{transcript}"
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
