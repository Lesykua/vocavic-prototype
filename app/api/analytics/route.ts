import { NextRequest, NextResponse } from 'next/server'
import { getOperationalMetrics, getPilotDemoMetrics, AnalyticsFilters } from '@/lib/analytics'

export interface AnalyticsResponse {
  operational: Awaited<ReturnType<typeof getOperationalMetrics>>
  pilotDemo: Awaited<ReturnType<typeof getPilotDemoMetrics>>
  generatedAt: string
}

function isShift(value: string | null): value is 'A' | 'B' | 'C' {
  return value === 'A' || value === 'B' || value === 'C'
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const machineParam = searchParams.get('machine')
  const shiftParam = searchParams.get('shift')
  const daysParam = searchParams.get('days')

  const filters: AnalyticsFilters = {
    machine: machineParam ?? undefined,
    shift: isShift(shiftParam) ? shiftParam : undefined,
    days: daysParam ? Number(daysParam) : undefined,
  }

  try {
    const [operational, pilotDemo] = await Promise.all([
      getOperationalMetrics(filters),
      getPilotDemoMetrics(filters),
    ])

    const response: AnalyticsResponse = {
      operational,
      pilotDemo,
      generatedAt: new Date().toISOString(),
    }
    return NextResponse.json(response)
  } catch (err) {
    return NextResponse.json({ error: 'Failed to compute analytics', detail: String(err) }, { status: 500 })
  }
}
