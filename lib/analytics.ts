import { sql, ensureNotesTable } from './db'

export interface OperationalMetrics {
  noteCount: number
  completeCount: number
  incompleteCount: number
  avgCompletenessScore: number
  completenessTrend: { date: string; avgScore: number; noteCount: number }[]
  notesByMachine: { machine: string; count: number }[]
  notesByShift: { shift: string; count: number }[]
  recurringIssues: { reason: string; machine: string | null; count: number }[]
  openFollowUps: { id: string; machine: string | null; reason: string | null; createdAt: string }[]
}

export interface PilotDemoMetrics {
  totalNotesCaptured: number
  activeDevices: number
  tagCoveragePct: number
  avgCompletenessScore: number
  notesLast7Days: { date: string; count: number }[]
  topTags: { tag: string; count: number }[]
}

export interface FilterOptions {
  machines: string[]
}

export interface AnalyticsFilters {
  machine?: string
  shift?: 'A' | 'B' | 'C'
  /** Rolling window in days. Omit (or 0) for all-time. */
  days?: number
}

const DEFAULT_TREND_WINDOW_DAYS = 30

// The CASE expression below mirrors the shift-letter logic already used in
// public/live-dashboard.html's getShiftLetter(). It's typed out literally at
// each call site rather than factored into a shared constant: the sql tag
// binds every ${} placeholder as a query PARAMETER, not raw SQL text, so
// there is no way to splice a reusable SQL fragment through interpolation
// here (that's a postgres.js feature, not part of Neon's driver) — the only
// safe option is literal, repeated SQL text.

export async function getFilterOptions(): Promise<FilterOptions> {
  await ensureNotesTable()
  const rows = await sql<{ machine: string }>`
    SELECT DISTINCT machine FROM notes WHERE machine IS NOT NULL ORDER BY machine
  `
  return { machines: rows.map((r) => r.machine) }
}

export async function getOperationalMetrics(filters: AnalyticsFilters = {}): Promise<OperationalMetrics> {
  await ensureNotesTable()
  const machine = filters.machine ?? null
  const shift = filters.shift ?? null
  const days = filters.days && filters.days > 0 ? filters.days : null
  const trendDays = days ?? DEFAULT_TREND_WINDOW_DAYS

  const [totals, trend, byMachine, byShift, recurring, followUps] = await Promise.all([
    sql<{ note_count: string; complete_count: string; incomplete_count: string; avg_score: number | null }>`
      SELECT
        COUNT(*)::int AS note_count,
        COUNT(*) FILTER (WHERE is_complete)::int AS complete_count,
        COUNT(*) FILTER (WHERE NOT is_complete)::int AS incomplete_count,
        AVG(completeness_score) AS avg_score
      FROM notes
      WHERE (${machine}::text IS NULL OR machine = ${machine})
        AND (${shift}::text IS NULL OR (CASE
              WHEN EXTRACT(HOUR FROM created_at) >= 6 AND EXTRACT(HOUR FROM created_at) < 14 THEN 'A'
              WHEN EXTRACT(HOUR FROM created_at) >= 14 AND EXTRACT(HOUR FROM created_at) < 22 THEN 'B'
              ELSE 'C'
            END) = ${shift})
        AND (${days}::int IS NULL OR created_at >= NOW() - (${days} * INTERVAL '1 day'))
    `,
    sql<{ day: string; avg_score: number | null; note_count: string }>`
      SELECT
        date_trunc('day', created_at)::date AS day,
        AVG(completeness_score) AS avg_score,
        COUNT(*)::int AS note_count
      FROM notes
      WHERE created_at >= NOW() - (${trendDays} * INTERVAL '1 day')
        AND (${machine}::text IS NULL OR machine = ${machine})
        AND (${shift}::text IS NULL OR (CASE
              WHEN EXTRACT(HOUR FROM created_at) >= 6 AND EXTRACT(HOUR FROM created_at) < 14 THEN 'A'
              WHEN EXTRACT(HOUR FROM created_at) >= 14 AND EXTRACT(HOUR FROM created_at) < 22 THEN 'B'
              ELSE 'C'
            END) = ${shift})
      GROUP BY day
      ORDER BY day ASC
    `,
    sql<{ machine: string; count: string }>`
      SELECT machine, COUNT(*)::int AS count
      FROM notes
      WHERE machine IS NOT NULL
        AND (${shift}::text IS NULL OR (CASE
              WHEN EXTRACT(HOUR FROM created_at) >= 6 AND EXTRACT(HOUR FROM created_at) < 14 THEN 'A'
              WHEN EXTRACT(HOUR FROM created_at) >= 14 AND EXTRACT(HOUR FROM created_at) < 22 THEN 'B'
              ELSE 'C'
            END) = ${shift})
        AND (${days}::int IS NULL OR created_at >= NOW() - (${days} * INTERVAL '1 day'))
      GROUP BY machine
      ORDER BY count DESC
      LIMIT 10
    `,
    sql<{ shift: string; count: string }>`
      SELECT
        (CASE
          WHEN EXTRACT(HOUR FROM created_at) >= 6 AND EXTRACT(HOUR FROM created_at) < 14 THEN 'A'
          WHEN EXTRACT(HOUR FROM created_at) >= 14 AND EXTRACT(HOUR FROM created_at) < 22 THEN 'B'
          ELSE 'C'
        END) AS shift,
        COUNT(*)::int AS count
      FROM notes
      WHERE (${machine}::text IS NULL OR machine = ${machine})
        AND (${days}::int IS NULL OR created_at >= NOW() - (${days} * INTERVAL '1 day'))
      GROUP BY shift
      ORDER BY shift ASC
    `,
    sql<{ reason: string; machine: string | null; count: string }>`
      SELECT reason, machine, COUNT(*)::int AS count
      FROM notes
      WHERE reason IS NOT NULL
        AND (${machine}::text IS NULL OR machine = ${machine})
        AND (${shift}::text IS NULL OR (CASE
              WHEN EXTRACT(HOUR FROM created_at) >= 6 AND EXTRACT(HOUR FROM created_at) < 14 THEN 'A'
              WHEN EXTRACT(HOUR FROM created_at) >= 14 AND EXTRACT(HOUR FROM created_at) < 22 THEN 'B'
              ELSE 'C'
            END) = ${shift})
        AND (${days}::int IS NULL OR created_at >= NOW() - (${days} * INTERVAL '1 day'))
      GROUP BY reason, machine
      HAVING COUNT(*) > 1
      ORDER BY count DESC
      LIMIT 10
    `,
    sql<{ id: string; machine: string | null; reason: string | null; created_at: string }>`
      SELECT id, machine, reason, created_at
      FROM notes
      WHERE NOT is_complete
        AND (${machine}::text IS NULL OR machine = ${machine})
        AND (${shift}::text IS NULL OR (CASE
              WHEN EXTRACT(HOUR FROM created_at) >= 6 AND EXTRACT(HOUR FROM created_at) < 14 THEN 'A'
              WHEN EXTRACT(HOUR FROM created_at) >= 14 AND EXTRACT(HOUR FROM created_at) < 22 THEN 'B'
              ELSE 'C'
            END) = ${shift})
        AND (${days}::int IS NULL OR created_at >= NOW() - (${days} * INTERVAL '1 day'))
      ORDER BY created_at DESC
      LIMIT 20
    `,
  ])

  const totalsRow = totals[0]
  return {
    noteCount: totalsRow?.note_count ? Number(totalsRow.note_count) : 0,
    completeCount: totalsRow?.complete_count ? Number(totalsRow.complete_count) : 0,
    incompleteCount: totalsRow?.incomplete_count ? Number(totalsRow.incomplete_count) : 0,
    avgCompletenessScore: totalsRow?.avg_score ? Math.round(Number(totalsRow.avg_score)) : 0,
    completenessTrend: trend.map((r) => ({
      date: r.day,
      avgScore: r.avg_score ? Math.round(Number(r.avg_score)) : 0,
      noteCount: Number(r.note_count),
    })),
    notesByMachine: byMachine.map((r) => ({ machine: r.machine, count: Number(r.count) })),
    notesByShift: byShift.map((r) => ({ shift: r.shift, count: Number(r.count) })),
    recurringIssues: recurring.map((r) => ({ reason: r.reason, machine: r.machine, count: Number(r.count) })),
    openFollowUps: followUps.map((r) => ({
      id: r.id,
      machine: r.machine,
      reason: r.reason,
      createdAt: r.created_at,
    })),
  }
}

export async function getPilotDemoMetrics(filters: AnalyticsFilters = {}): Promise<PilotDemoMetrics> {
  await ensureNotesTable()
  const machine = filters.machine ?? null
  const shift = filters.shift ?? null
  const days = filters.days && filters.days > 0 ? filters.days : null

  const [totals, last7, tags] = await Promise.all([
    sql<{ total: string; active_devices: string; tagged: string; avg_score: number | null }>`
      SELECT
        COUNT(*)::int AS total,
        COUNT(DISTINCT device_id)::int AS active_devices,
        COUNT(*) FILTER (WHERE array_length(tags, 1) > 0)::int AS tagged,
        AVG(completeness_score) AS avg_score
      FROM notes
      WHERE (${machine}::text IS NULL OR machine = ${machine})
        AND (${shift}::text IS NULL OR (CASE
              WHEN EXTRACT(HOUR FROM created_at) >= 6 AND EXTRACT(HOUR FROM created_at) < 14 THEN 'A'
              WHEN EXTRACT(HOUR FROM created_at) >= 14 AND EXTRACT(HOUR FROM created_at) < 22 THEN 'B'
              ELSE 'C'
            END) = ${shift})
        AND (${days}::int IS NULL OR created_at >= NOW() - (${days} * INTERVAL '1 day'))
    `,
    sql<{ day: string; count: string }>`
      SELECT date_trunc('day', created_at)::date AS day, COUNT(*)::int AS count
      FROM notes
      WHERE created_at >= NOW() - INTERVAL '7 days'
        AND (${machine}::text IS NULL OR machine = ${machine})
        AND (${shift}::text IS NULL OR (CASE
              WHEN EXTRACT(HOUR FROM created_at) >= 6 AND EXTRACT(HOUR FROM created_at) < 14 THEN 'A'
              WHEN EXTRACT(HOUR FROM created_at) >= 14 AND EXTRACT(HOUR FROM created_at) < 22 THEN 'B'
              ELSE 'C'
            END) = ${shift})
      GROUP BY day
      ORDER BY day ASC
    `,
    sql<{ tag: string; count: string }>`
      SELECT unnest(tags) AS tag, COUNT(*)::int AS count
      FROM notes
      WHERE (${machine}::text IS NULL OR machine = ${machine})
        AND (${shift}::text IS NULL OR (CASE
              WHEN EXTRACT(HOUR FROM created_at) >= 6 AND EXTRACT(HOUR FROM created_at) < 14 THEN 'A'
              WHEN EXTRACT(HOUR FROM created_at) >= 14 AND EXTRACT(HOUR FROM created_at) < 22 THEN 'B'
              ELSE 'C'
            END) = ${shift})
        AND (${days}::int IS NULL OR created_at >= NOW() - (${days} * INTERVAL '1 day'))
      GROUP BY tag
      ORDER BY count DESC
      LIMIT 10
    `,
  ])

  const totalsRow = totals[0]
  const total = totalsRow?.total ? Number(totalsRow.total) : 0
  const tagged = totalsRow?.tagged ? Number(totalsRow.tagged) : 0

  return {
    totalNotesCaptured: total,
    activeDevices: totalsRow?.active_devices ? Number(totalsRow.active_devices) : 0,
    tagCoveragePct: total > 0 ? Math.round((tagged / total) * 100) : 0,
    avgCompletenessScore: totalsRow?.avg_score ? Math.round(Number(totalsRow.avg_score)) : 0,
    notesLast7Days: last7.map((r) => ({ date: r.day, count: Number(r.count) })),
    topTags: tags.map((r) => ({ tag: r.tag, count: Number(r.count) })),
  }
}
