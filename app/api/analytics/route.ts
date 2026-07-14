import { NextRequest, NextResponse } from 'next/server'
import { getOperationalMetrics, getPilotDemoMetrics } from '@/lib/analytics'
import { requirePilotCode } from '@/lib/auth'

export interface AnalyticsResponse {
  operational: Awaited<ReturnType<typeof getOperationalMetrics>>
  pilotDemo: Awaited<ReturnType<typeof getPilotDemoMetrics>>
  generatedAt: string
}

export async function GET(req: NextRequest) {
  const unauthorized = requirePilotCode(req)
  if (unauthorized) return unauthorized

  try {
    const [operational, pilotDemo] = await Promise.all([
      getOperationalMetrics(),
      getPilotDemoMetrics(),
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
