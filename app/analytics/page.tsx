import Link from 'next/link'
import { getOperationalMetrics, getPilotDemoMetrics } from '@/lib/analytics'

export const metadata = {
  title: 'Vocavic — Analytics',
}

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

function GateForm({ error }: { error?: string }) {
  return (
    <main
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: '#f2ebe0', fontFamily: 'var(--font-barlow, sans-serif)' }}
    >
      <form
        method="get"
        className="w-full max-w-sm rounded-2xl p-6 shadow-sm flex flex-col gap-4"
        style={{ background: '#fff' }}
      >
        <div className="text-center">
          <p className="font-semibold text-lg" style={{ color: ACCENT }}>Vocavic Analytics</p>
          <p className="text-sm mt-1" style={{ color: MUTED }}>Enter the pilot access code to view analytics.</p>
        </div>
        <input
          type="password"
          name="code"
          placeholder="Pilot access code"
          className="w-full px-4 py-3 rounded-xl text-sm"
          style={{ border: `1px solid ${BORDER}`, color: TEXT }}
          autoFocus
        />
        {error && <p className="text-xs text-center" style={{ color: '#d65848' }}>{error}</p>}
        <button
          type="submit"
          className="w-full py-3 rounded-xl font-semibold text-white"
          style={{ background: ACCENT }}
        >
          Continue
        </button>
      </form>
    </main>
  )
}

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string }>
}) {
  const { code } = await searchParams
  const expected = process.env.PILOT_ACCESS_CODE

  if (!expected) {
    return <GateForm error="PILOT_ACCESS_CODE is not configured on the server." />
  }
  if (code !== expected) {
    return <GateForm error={code ? 'That code was rejected — try again.' : undefined} />
  }

  let operational: Awaited<ReturnType<typeof getOperationalMetrics>>
  let pilotDemo: Awaited<ReturnType<typeof getPilotDemoMetrics>>
  try {
    ;[operational, pilotDemo] = await Promise.all([
      getOperationalMetrics(),
      getPilotDemoMetrics(),
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

        {/* Pilot / demo half */}
        <div>
          <span
            className="inline-block text-xs font-semibold uppercase tracking-widest px-3 py-1.5 rounded-full mb-4"
            style={{ background: 'rgba(15,95,104,0.1)', color: ACCENT }}
          >
            Pilot Impact
          </span>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-6">
            <StatTile label="Notes captured" value={String(pilotDemo.totalNotesCaptured)} />
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
            <Section title="Completeness trend — last 30 days">
              <BarRows
                emptyLabel="No notes in the last 30 days yet."
                rows={operational.completenessTrend.map((d) => ({
                  label: formatDay(d.date),
                  value: d.avgScore,
                  sub: '/100',
                }))}
              />
            </Section>

            <Section title="Notes by machine">
              <BarRows
                emptyLabel="No machine data yet."
                rows={operational.notesByMachine.map((m) => ({ label: m.machine, value: m.count }))}
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
