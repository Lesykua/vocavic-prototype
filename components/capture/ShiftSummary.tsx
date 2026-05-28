'use client'

import { useState, useCallback } from 'react'
import { ShiftNote } from '@/lib/types'
import type { ShiftSummaryResponse } from '@/app/api/shift-summary/route'

interface ShiftSummaryProps {
  notes: ShiftNote[]
  label?: string
}

type TagCategory = 'theme' | 'action' | 'open' | 'watch'

interface TagItem {
  label: string
  category: TagCategory
}

function TagChip({ label, category }: TagItem) {
  const styles: Record<TagCategory, { bg: string; color: string }> = {
    theme:  { bg: 'rgba(15,95,104,0.12)',  color: '#0f5f68' },
    action: { bg: 'rgba(47,143,99,0.12)',  color: '#2f8f63' },
    open:   { bg: 'rgba(198,138,34,0.12)', color: '#c68a22' },
    watch:  { bg: 'rgba(214,88,72,0.12)',  color: '#d65848' },
  }
  const s = styles[category]
  return (
    <span
      className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium"
      style={{ background: s.bg, color: s.color }}
    >
      {label}
    </span>
  )
}

function MetricCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="flex flex-col gap-1 p-4 rounded-2xl" style={{ background: '#fff' }}>
      <span className="text-xs uppercase tracking-widest font-semibold" style={{ color: '#687d85' }}>{label}</span>
      <span className="text-3xl font-bold" style={{ color: '#12232c' }}>{value}</span>
      {sub && <span className="text-xs" style={{ color: '#687d85' }}>{sub}</span>}
    </div>
  )
}

export function ShiftSummary({ notes, label }: ShiftSummaryProps) {
  const [summary, setSummary] = useState<ShiftSummaryResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const generate = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/shift-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes, label }),
      })
      const data = await res.json() as ShiftSummaryResponse & { error?: string }
      if (!res.ok) throw new Error(data.error ?? 'Summary failed')
      setSummary(data)
    } catch (e) {
      setError(String(e))
    } finally {
      setLoading(false)
    }
  }, [notes, label])

  const tags: TagItem[] = summary ? [
    ...summary.themes.map(l => ({ label: l, category: 'theme' as TagCategory })),
    ...summary.actions.map(l => ({ label: l, category: 'action' as TagCategory })),
    ...summary.open.map(l => ({ label: l, category: 'open' as TagCategory })),
    ...summary.watch.map(l => ({ label: l, category: 'watch' as TagCategory })),
  ] : []

  return (
    <div
      className="w-full rounded-3xl border shadow-xl overflow-hidden"
      style={{ borderColor: 'rgba(15,95,104,0.2)', background: 'rgba(15,95,104,0.04)' }}
    >
      {/* Header */}
      <div
        className="flex items-start justify-between gap-4 p-6 pb-4"
        style={{ borderBottom: '1px solid rgba(15,95,104,0.1)' }}
      >
        <div>
          <p className="text-xs uppercase tracking-widest font-semibold mb-1" style={{ color: '#0f5f68' }}>
            Operator summary
          </p>
          <h2 className="text-xl font-bold" style={{ color: '#12232c' }}>
            {label ?? 'Current shift'}
          </h2>
          <p className="text-sm mt-0.5" style={{ color: '#687d85' }}>
            {notes.length} note{notes.length !== 1 ? 's' : ''} captured
          </p>
        </div>

        <button
          onClick={generate}
          disabled={loading || notes.length === 0}
          className="shrink-0 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-opacity disabled:opacity-40"
          style={{ background: '#0f5f68' }}
        >
          {loading ? 'Generating…' : summary ? 'Regenerate' : 'Generate summary'}
        </button>
      </div>

      {/* Body */}
      <div className="p-6 flex flex-col gap-5">

        {/* Error */}
        {error && (
          <p className="text-sm" style={{ color: '#d65848' }}>{error}</p>
        )}

        {/* Loading spinner */}
        {loading && !summary && (
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 rounded-full border-2 border-t-transparent animate-spin"
              style={{ borderColor: '#0f5f68', borderTopColor: 'transparent' }} />
            <span className="text-sm" style={{ color: '#687d85' }}>Summarising with Gemma 3…</span>
          </div>
        )}

        {/* Metrics row */}
        {summary && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <MetricCard label="Notes" value={summary.metrics.noteCount} />
            <MetricCard
              label="Complete"
              value={summary.metrics.completeCount}
              sub={`${summary.metrics.incompleteCount} incomplete`}
            />
            <MetricCard
              label="Avg score"
              value={`${summary.metrics.avgScore}%`}
            />
            <MetricCard
              label="Top machine"
              value={summary.metrics.topMachine ?? '—'}
              sub={summary.metrics.topComponent ?? undefined}
            />
          </div>
        )}

        {/* Narrative */}
        {summary && (
          <p className="text-base leading-relaxed" style={{ color: '#12232c' }}>
            {summary.narrative}
          </p>
        )}

        {/* Tags */}
        {summary && tags.length > 0 && (
          <div className="flex flex-col gap-3">
            {(['theme', 'action', 'open', 'watch'] as TagCategory[]).map(cat => {
              const catTags = tags.filter(t => t.category === cat)
              if (!catTags.length) return null
              const catLabels: Record<TagCategory, string> = {
                theme:  'Themes',
                action: 'Actions taken',
                open:   'Open items',
                watch:  'Watch next shift',
              }
              return (
                <div key={cat} className="flex flex-wrap items-center gap-2">
                  <span className="text-xs uppercase tracking-widest font-semibold w-28 shrink-0" style={{ color: '#687d85' }}>
                    {catLabels[cat]}
                  </span>
                  {catTags.map(t => <TagChip key={t.label} {...t} />)}
                </div>
              )
            })}
          </div>
        )}

        {/* Empty state */}
        {!summary && !loading && !error && (
          <p className="text-sm text-center py-4" style={{ color: '#687d85' }}>
            {notes.length === 0
              ? 'Record some notes first, then generate a shift summary.'
              : 'Press "Generate summary" to get an AI overview of this shift.'}
          </p>
        )}
      </div>
    </div>
  )
}
