import Link from 'next/link'
import { getOperationalMetrics, getPilotDemoMetrics, getFilterOptions, AnalyticsFilters } from '@/lib/analytics'

export const metadata = {
  title: 'Vocavic — Analytics',
}

// Reads searchParams for filters, which already forces per-request rendering —
// kept explicit so this doesn't silently regress to a build-time static page
// (that bug bit this page once already: it'd freeze on whatever numbers
// existed when `next build` ran).
export const dynamic = 'force-dynamic'

const CARD = 'rgba(255,251,245,0.85)'
const BORDER = 'rgba(18,35,44,0.12)'
const TEXT = '#12232c'
const MUTED = '#687d85'
const ACCENT = '#0f5f68'

function StatTile({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-2xl p-6 shadow-sm" style={{ background: CARD, border: `1px solid ${BORDER}` }}>
      <p
        className="font-extrabold leading-none mb-2"
        style={{ fontFamily: 'var(--font-barlow-condensed)', fontSize: '2rem', color: ACCENT }}
      >
        {value}
      </p>
      <p className="font-semibold text-xs leading-snug mb-1" style={{ color: TEXT }}>{label}</p>
      {sub && <p className="text-xs" style={{ color: MUTED }}>{sub}</p>}
    </div>
  )
}

function BarRows({
  rows,
  emptyLabel,
}: {
  rows: { label: string; value: number; sub?: string; color?: string }[]
  emptyLabel: string
}) {
  if (rows.length === 0) {
    return <p className="text-sm" style={{ color: MUTED }}>{emptyLabel}</p>
  }
  const max = Math.max(...rows.map((r) => r.value), 1)
  return (
    <div>
      {rows.map((row, i) => (
        <div key={row.label + i} className="mb-4 last:mb-0">
          <div className="flex items-center justify-between mb-1.5 gap-3">
            <span className="text-xs truncate" style={{ color: MUTED }}>{row.label}</span>
            <span className="text-xs font-semibold shrink-0" style={{ color: TEXT }}>
              {row.value}{row.sub ? ` ${row.sub}` : ''}
            </span>
          </div>
          <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(18,35,44,0.08)' }}>
            <div
              className="h-full rounded-full"
              style={{ width: `${Math.max((row.value / max) * 100, 3)}%`, backgroundColor: row.color ?? ACCENT }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}

/** Hand-rolled SVG line/area chart — no charting dependency, matches the
 * landing page's existing div-bar chart precedent in spirit. */
function TrendChart({
  points,
  emptyLabel,
  valueSuffix = '',
}: {
  points: { label: string; value: number }[]
  emptyLabel: string
  valueSuffix?: string
}) {
  if (points.length === 0) {
    return <p className="text-sm" style={{ color: MUTED }}>{emptyLabel}</p>
  }
  if (points.length === 1) {
    return (
      <div className="flex items-baseline gap-2">
        <span className="font-extrabold" style={{ fontFamily: 'var(--font-barlow-condensed)', fontSize: '2rem', color: ACCENT }}>
          {points[0].value}{valueSuffix}
        </span>
        <span className="text-xs" style={{ color: MUTED }}>on {points[0].label}</span>
      </div>
    )
  }

  const max = Math.max(...points.map((p) => p.value), 1)
  const stepX = 100 / (points.length - 1)
  const coords = points.map((p, i) => ({ x: i * stepX, y: 100 - (p.value / max) * 92 }))
  const lineD = coords.map((c, i) => `${i === 0 ? 'M' : 'L'} ${c.x.toFixed(2)} ${c.y.toFixed(2)}`).join(' ')
  const areaD = `${lineD} L ${coords[coords.length - 1].x.toFixed(2)} 100 L ${coords[0].x.toFixed(2)} 100 Z`

  return (
    <div>
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ width: '100%', height: 140 }}>
        <path d={areaD} fill={ACCENT} fillOpacity={0.12} stroke="none" />
        <path d={lineD} fill="none" stroke={ACCENT} strokeWidth={1.6} vectorEffect="non-scaling-stroke" strokeLinejoin="round" strokeLinecap="round" />
        {coords.map((c, i) => (
          <circle key={i} cx={c.x} cy={c.y} r={1.4} fill={ACCENT} />
        ))}
      </svg>
      <div className="flex justify-between text-xs mt-1" style={{ color: MUTED }}>
        <span>{points[0].label}</span>
        <span>
          {points[points.length - 1].label} · {points[points.length - 1].value}{valueSuffix}
        </span>
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section
      className="rounded-2xl p-6 shadow-sm"
      style={{ background: CARD, border: `1px solid ${BORDER}` }}
    >
      <h2
        className="font-bold mb-4"
        style={{ fontFamily: 'var(--font-barlow-condensed)', letterSpacing: '0.02em', fontSize: '1.1rem', color: TEXT }}
      >
        {title}
      </h2>
      {children}
    </section>
  )
}

function formatDay(iso: string) {
  return new Date(iso).toLocaleDateString([], { month: 'short', day: 'numeric' })
}

const DAY_OPTIONS = [
  { value: '7', label: 'Last 7 days' },
  { value: '30', label: 'Last 30 days' },
  { value: '90', label: 'Last 90 days' },
  { value: '0', label: 'All time' },
]

function FilterBar({
  machines,
  filters,
  daysValue,
}: {
  machines: string[]
  filters: AnalyticsFilters
  daysValue: string
}) {
  const selectStyle: React.CSSProperties = {
    border: `1px solid ${BORDER}`,
    borderRadius: '10px',
    padding: '0.5rem 0.75rem',
    fontSize: '0.85rem',
    color: TEXT,
    background: '#fff',
  }
  const hasActiveFilters = Boolean(filters.machine || filters.shift || (filters.days && filters.days !== 30))

  return (
    <form method="get" className="flex flex-wrap items-end gap-3 mb-6">
      <div className="flex flex-col gap-1">
        <label htmlFor="machine" className="text-xs font-semibold uppercase tracking-wide" style={{ color: MUTED }}>Machine</label>
        <select id="machine" name="machine" defaultValue={filters.machine ?? ''} style={selectStyle}>
          <option value="">All machines</option>
          {machines.map((m) => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor="shift" className="text-xs font-semibold uppercase tracking-wide" style={{ color: MUTED }}>Shift</label>
        <select id="shift" name="shift" defaultValue={filters.shift ?? ''} style={selectStyle}>
          <option value="">All shifts</option>
          <option value="A">A (06:00–14:00)</option>
          <option value="B">B (14:00–22:00)</option>
          <option value="C">C (22:00–06:00)</option>
        </select>
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor="days" className="text-xs font-semibold uppercase tracking-wide" style={{ color: MUTED }}>Range</label>
        <select id="days" name="days" defaultValue={daysValue} style={selectStyle}>
          {DAY_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>
      <button
        type="submit"
        className="text-xs font-semibold px-4 py-2 rounded-lg text-white"
        style={{ background: ACCENT }}
      >
        Apply
      </button>
      {hasActiveFilters && (
        <Link href="/analytics" className="text-xs font-semibold hover:underline" style={{ color: MUTED }}>
          Clear filters
        </Link>
      )}
    </form>
  )
}

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ machine?: string; shift?: string; days?: string }>
}) {
  const params = await searchParams
  const daysValue = params.days ?? '30'
  const filters: AnalyticsFilters = {
    machine: params.machine || undefined,
    shift: params.shift === 'A' || params.shift === 'B' || params.shift === 'C' ? params.shift : undefined,
    days: Number(daysValue) || undefined,
  }

  let operational: Awaited<ReturnType<typeof getOperationalMetrics>>
  let pilotDemo: Awaited<ReturnType<typeof getPilotDemoMetrics>>
  let machines: string[]
  try {
    ;[operational, pilotDemo, { machines }] = await Promise.all([
      getOperationalMetrics(filters),
      getPilotDemoMetrics(filters),
      getFilterOptions(),
    ])
  } catch {
    return (
      <main
        className="min-h-screen flex items-center justify-center px-4 text-center"
        style={{ background: '#f2ebe0', fontFamily: 'var(--font-barlow, sans-serif)' }}
      >
        <div>
          <p className="font-semibold text-lg mb-2" style={{ color: ACCENT }}>Analytics unavailable</p>
          <p className="text-sm" style={{ color: MUTED }}>
            Couldn&apos;t reach the database. Check that <code>DATABASE_URL</code> is configured and try again.
          </p>
        </div>
      </main>
    )
  }

  const rangeLabel = DAY_OPTIONS.find((o) => o.value === daysValue)?.label ?? 'Last 30 days'

  return (
    <main className="min-h-screen" style={{ background: '#f2ebe0', fontFamily: 'var(--font-barlow, sans-serif)' }}>
      <header className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 shadow-sm" style={{ background: '#fff' }}>
        <Link href="/" className="font-semibold text-lg tracking-tight" style={{ color: ACCENT }}>Vocavic</Link>
        <div className="flex items-center gap-3">
          <a
            href="/live-dashboard.html"
            className="text-xs px-3 py-1 rounded-full font-medium transition-opacity hover:opacity-80"
            style={{ background: ACCENT, color: '#fff' }}
          >
            Live dashboard →
          </a>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-10 flex flex-col gap-10">

        <FilterBar machines={machines} filters={filters} daysValue={daysValue} />

        {/* Pilot / demo half */}
        <div>
          <span
            className="inline-block text-xs font-semibold uppercase tracking-widest px-3 py-1.5 rounded-full mb-4"
            style={{ background: 'rgba(15,95,104,0.1)', color: ACCENT }}
          >
            Pilot Impact
          </span>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-6">
            <StatTile label="Notes captured" value={String(pilotDemo.totalNotesCaptured)} sub={rangeLabel} />
            <StatTile label="Active devices" value={String(pilotDemo.activeDevices)} />
            <StatTile label="Tag coverage" value={`${pilotDemo.tagCoveragePct}%`} />
            <StatTile label="Avg completeness" value={`${pilotDemo.avgCompletenessScore}/100`} />
          </div>
          <Section title="Notes captured — last 7 days">
            <BarRows
              emptyLabel="No notes captured in the last 7 days yet."
              rows={pilotDemo.notesLast7Days.map((d) => ({ label: formatDay(d.date), value: d.count }))}
            />
          </Section>
        </div>

        {/* Operational half */}
        <div>
          <span
            className="inline-block text-xs font-semibold uppercase tracking-widest px-3 py-1.5 rounded-full mb-4"
            style={{ background: 'rgba(15,95,104,0.1)', color: ACCENT }}
          >
            Operational Trends
          </span>
          <div className="grid md:grid-cols-2 gap-6">
            <Section title={`Completeness trend — ${rangeLabel.toLowerCase()}`}>
              <TrendChart
                emptyLabel="No notes in this range yet."
                valueSuffix="/100"
                points={operational.completenessTrend.map((d) => ({ label: formatDay(d.date), value: d.avgScore }))}
              />
            </Section>

            <Section title="Notes by machine">
              <BarRows
                emptyLabel="No machine data yet."
                rows={operational.notesByMachine.map((m) => ({ label: m.machine, value: m.count }))}
              />
            </Section>

            <Section title="Notes by shift">
              <BarRows
                emptyLabel="No shift data yet."
                rows={operational.notesByShift.map((s) => ({
                  label: `Shift ${s.shift}`,
                  value: s.count,
                  color: s.shift === 'A' ? '#0f5f68' : s.shift === 'B' ? '#c68a22' : '#2f8f63',
                }))}
              />
            </Section>

            <Section title="Recurring issues">
              {operational.recurringIssues.length === 0 ? (
                <p className="text-sm" style={{ color: MUTED }}>No repeated issues yet.</p>
              ) : (
                <ul className="flex flex-col gap-3">
                  {operational.recurringIssues.map((issue, i) => (
                    <li key={i} className="flex items-center justify-between gap-3 text-sm">
                      <span style={{ color: TEXT }}>
                        {issue.reason}
                        {issue.machine && <span style={{ color: MUTED }}> · {issue.machine}</span>}
                      </span>
                      <span
                        className="text-xs font-semibold px-2 py-0.5 rounded-full shrink-0"
                        style={{ background: 'rgba(198,138,34,0.15)', color: '#c68a22' }}
                      >
                        ×{issue.count}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </Section>

            <Section title="Open follow-up backlog">
              {operational.openFollowUps.length === 0 ? (
                <p className="text-sm" style={{ color: MUTED }}>No open follow-ups — nice work.</p>
              ) : (
                <ul className="flex flex-col gap-3">
                  {operational.openFollowUps.map((n) => (
                    <li key={n.id} className="flex items-center justify-between gap-3 text-sm">
                      <span style={{ color: TEXT }}>
                        {n.machine ?? 'Unknown machine'}
                        {n.reason && <span style={{ color: MUTED }}> · {n.reason}</span>}
                      </span>
                      <a
                        href="/live-dashboard.html"
                        className="text-xs font-semibold shrink-0 hover:underline"
                        style={{ color: ACCENT }}
                      >
                        View →
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </Section>
          </div>
        </div>
      </div>
    </main>
  )
}
