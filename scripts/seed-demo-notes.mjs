#!/usr/bin/env node
// Seeds the shared /api/notes table with a spread of synthetic shift notes —
// multiple machines, issues, shifts, and completeness levels — so /analytics
// and /live-dashboard.html have something to show before a real pilot
// generates volume.
//
// Every note gets a deviceId prefixed "demo_" and an id prefixed "demoseed-"
// so this batch stays identifiable and easy to remove later, e.g.:
//   DELETE FROM notes WHERE device_id LIKE 'demo\_%' ESCAPE '\'
//
// Usage: TARGET_URL=https://your-deploy.vercel.app node scripts/seed-demo-notes.mjs

const TARGET_URL = process.env.TARGET_URL || 'https://parquetvoice-prototype.vercel.app'
const DAYS_BACK = 30
const DEVICE_COUNT = 9

const ISSUES = [
  { machine: 'Hot Press 1', reason: 'press temperature drift', component: 'heating element', action: 'adjusted platen temperature setpoint', lesson: 'inspect heating system, not just setpoint', tags: ['pressing', 'overheating', 'maintenance'], transcript: 'Upper platen running a few degrees below setpoint again. Adjusted the setpoint for now but this keeps happening.' },
  { machine: 'Hot Press 1', reason: 'hydraulic pressure drop', component: 'hydraulic cylinder', action: 'called maintenance, replaced seal', lesson: 'schedule full hydraulic inspection', tags: ['hydraulic', 'downtime', 'maintenance'], transcript: 'Hydraulic cylinder seal blew, safety shutdown triggered. Maintenance replaced the seal and topped up fluid.' },
  { machine: 'Hot Press 2', reason: 'hydraulic pressure drop', component: 'hydraulic cylinder', action: 'replaced seal, refilled hydraulic fluid', lesson: 'second seal failure in six weeks — escalate', tags: ['hydraulic', 'downtime', 'maintenance', 'pressing'], transcript: 'Hydraulic cylinder seal failure again on this press. Oil spraying onto the frame, automatic shutdown.' },
  { machine: 'UV Coating Line', reason: 'UV cure failure', component: 'UV lamp', action: 'stopped line, isolated batch, replaced lamp', lesson: 'lamp hours were overdue for replacement', tags: ['uv-cure', 'coating', 'quality'], transcript: 'Zone 2 UV lamp went dark mid-run, boards coming out under-cured and tacky.' },
  { machine: 'Wide Belt Sander', reason: 'sanding belt wear', component: 'sanding belt', action: 'quarantined batch, raised work order', lesson: 'add belt condition check to shift start checklist', tags: ['sanding', 'surface', 'quality'], transcript: 'Sanding belt wearing unevenly, linear scratch marks across board surfaces on the last run.' },
  { machine: 'Moisture Conditioning Chamber', reason: 'moisture deviation', component: 'moisture sensor', action: 'adjusted chamber setpoints, held batch for QC', lesson: 'humidity controller calibration overdue', tags: ['moisture', 'warp', 'quality'], transcript: 'Moisture readings creeping up over spec, boards from the last two hours showing early bow.' },
  { machine: 'Tongue & Groove Line', reason: 'alignment drift', component: 'PLC', action: 'reset alignment guide, escalated to engineering', lesson: 'guide reset is not a fix, PLC calibration needs review', tags: ['alignment', 'downtime', 'electrical'], transcript: 'Alignment fault again, fourth time this week. Guide reset and manual check, boards back in tolerance for now.' },
  { machine: 'Glue Spreader 1', reason: 'glue starvation', component: 'doctor blade', action: 'called maintenance, cleared valve', lesson: 'solenoid valve has been sticking intermittently for days', tags: ['glue', 'pressing', 'downtime'], transcript: 'Glue pressure dropped sharply, boards coming off with starved edges. Both cold presses had to slow down.' },
  { machine: 'Cross-Cut Saw', reason: 'saw blade chatter', component: 'saw blade', action: 'called maintenance, sourced spare blade', lesson: 'spare blade stock critically low', tags: ['saw', 'mechanical', 'downtime'], transcript: 'Loud resonance noise then edge splintering on board ends. Blade has a hairline crack.' },
  { machine: 'Sorting & Grading Station', reason: 'sensor fault', component: 'thickness gauge', action: 'cleaned sensor face, cleared false reject', lesson: 'dust buildup on the gauge is a recurring issue', tags: ['sensor', 'quality', 'sorting'], transcript: 'Thickness gauge threw a false reject streak. Wiped the sensor face and it cleared up.' },
]

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

const deviceIds = Array.from({ length: DEVICE_COUNT }, (_, i) => `demo_${i.toString(16).padStart(4, '0')}${Math.random().toString(16).slice(2, 6)}`)

function buildNote(dayOffset, seq) {
  const issue = pick(ISSUES)
  // Spread hours across the day so shifts A/B/C all get populated.
  const hour = randomInt(0, 23)
  const minute = randomInt(0, 59)
  const ts = new Date()
  ts.setDate(ts.getDate() - dayOffset)
  ts.setHours(hour, minute, 0, 0)

  // ~75% complete, ~25% incomplete (missing lesson and/or component drops
  // the score below the 60 threshold from lib/types.ts).
  const isComplete = Math.random() > 0.25
  const score = isComplete ? randomInt(80, 100) : randomInt(30, 58)

  const structured = {
    tags: issue.tags,
    reason: issue.reason,
    machine: issue.machine,
    component: isComplete || Math.random() > 0.5 ? issue.component : undefined,
    actionTaken: isComplete || Math.random() > 0.5 ? issue.action : undefined,
    lesson: isComplete ? issue.lesson : undefined,
  }

  return {
    id: `demoseed-${dayOffset}-${seq}-${Math.random().toString(36).slice(2, 8)}`,
    timestamp: ts.toISOString(),
    createdAt: ts.toISOString(),
    deviceId: pick(deviceIds),
    transcript: issue.transcript,
    structured,
    completenessScore: score,
    isComplete,
  }
}

async function main() {
  const notes = []
  for (let day = 0; day < DAYS_BACK; day++) {
    const perDay = randomInt(1, 4)
    for (let seq = 0; seq < perDay; seq++) {
      notes.push(buildNote(day, seq))
    }
  }

  console.log(`Seeding ${notes.length} demo notes to ${TARGET_URL} ...`)
  let ok = 0
  let failed = 0
  for (const note of notes) {
    try {
      const res = await fetch(`${TARGET_URL}/api/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(note),
      })
      if (res.ok) ok++
      else {
        failed++
        console.error(`  ${res.status} for ${note.id}: ${await res.text()}`)
      }
    } catch (err) {
      failed++
      console.error(`  network error for ${note.id}:`, err.message)
    }
  }
  console.log(`Done — ${ok} saved, ${failed} failed.`)
}

main()
