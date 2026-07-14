import { NextRequest, NextResponse } from 'next/server'

// Prototype-stage guard, not real auth: a single shared secret gates the
// shared notes table from anonymous internet traffic. Fine for a pre-pilot
// demo shown to one plant/investor audience; replace with per-operator auth
// before a wider rollout.
export function requirePilotCode(req: NextRequest): NextResponse | null {
  const expected = process.env.PILOT_ACCESS_CODE
  if (!expected) {
    return NextResponse.json({ error: 'PILOT_ACCESS_CODE not configured' }, { status: 500 })
  }
  const provided = req.headers.get('x-pilot-code')
  if (provided !== expected) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  return null
}
