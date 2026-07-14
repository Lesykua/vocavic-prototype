import { sql, ensureNotesTable } from './db'

export interface OperationalMetrics {
  noteCount: number
  completeCount: number
  incompleteCount: number
  avgCompletenessScore: number
  completenessTrend: { date: string; avgScore: number; noteCount: number }[]
  notesByMachine: { machine: string; count: number }[]
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

const TREND_WINDOW_DAYS = 30

export async function getOperationalMetrics(): Promise<OperationalMetrics> {
  await ensureNotesTable()

  const [totals, trend, byMachine, recurring, followUps] = await Promise.all([
    sql<{ note_count: string; complete_count: string; incomplete_count: string; avg_score: number | null }>`
      SELECT
        COUNT(*)::int AS note_count,
        COUNT(*) FILTER (WHERE is_complete)::int AS complete_count,
        COUNT(*) FILTER (WHERE NOT is_complete)::int AS incomplete_count,
        AVG(completeness_score) AS avg_score
      FROM notes
    `,
    sql<{ day: string; avg_score: number | null; note_count: string }>`
      SELECT
        date_trunc('day', created_at)::date AS day,
        AVG(completeness_score) AS avg_score,
        COUNT(*)::int AS note_count
      FROM notes
      WHERE created_at >= NOW() - (${TREND_WINDOW_DAYS} * INTERVAL '1 day')
      GROUP BY day
      ORDER BY day ASC
    `,
    sql<{ machine: string; count: string }>`
      SELECT machine, COUNT(*)::int AS count
      FROM notes
      WHERE machine IS NOT NULL
      GROUP BY machine
      ORDER BY count DESC
      LIMIT 10
    `,
    sql<{ reason: string; machine: string | null; count: string }>`
      SELECT reason, machine, COUNT(*)::int AS count
      FROM notes
      WHERE reason IS NOT NULL
      GROUP BY reason, machine
      HAVING COUNT(*) > 1
      ORDER BY count DESC
      LIMIT 10
    `,
    sql<{ id: string; machine: string | null; reason: string | null; created_at: string }>`
      SELECT id, machine, reason, created_at
      FROM notes
      WHERE NOT is_complete
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
    recurringIssues: recurring.map((r) => ({ reason: r.reason, machine: r.machine, count: Number(r.count) })),
    openFollowUps: followUps.map((r) => ({
      id: r.id,
      machine: r.machine,
      reason: r.reason,
      createdAt: r.created_at,
    })),
  }
}

export async function getPilotDemoMetrics(): Promise<PilotDemoMetrics> {
  await ensureNotesTable()

  const [totals, last7, tags] = await Promise.all([
    sql<{ total: string; active_devices: string; tagged: string; avg_score: number | null }>`
      SELECT
        COUNT(*)::int AS total,
        COUNT(DISTINCT device_id)::int AS active_devices,
        COUNT(*) FILTER (WHERE array_length(tags, 1) > 0)::int AS tagged,
        AVG(completeness_score) AS avg_score
      FROM notes
    `,
    sql<{ day: string; count: string }>`
      SELECT date_trunc('day', created_at)::date AS day, COUNT(*)::int AS count
      FROM notes
      WHERE created_at >= NOW() - INTERVAL '7 days'
      GROUP BY day
      ORDER BY day ASC
    `,
    sql<{ tag: string; count: string }>`
      SELECT unnest(tags) AS tag, COUNT(*)::int AS count
      FROM notes
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
