/**
 * Demo seed notes — pre-populate the shift log for live demos.
 * Timestamps are calculated relative to "now" so the notes always
 * appear to be from the current shift regardless of when the demo runs.
 *
 * Note at index 4 (Hot Press 1 / press temperature drift, ~2.5h ago) is
 * intentionally on the same machine + reason as the demo script so
 * the "related note" banner fires automatically.
 */

import { ShiftNote } from './types'

function hoursAgo(h: number): string {
  return new Date(Date.now() - h * 60 * 60 * 1000).toISOString()
}

export function buildSeedNotes(deviceId: string): ShiftNote[] {
  return [
    // ── 1. Hot Press 2 — hydraulic cylinder seal failure, 75 min downtime ──
    {
      id: 'seed-001',
      timestamp: hoursAgo(7.2),
      createdAt: hoursAgo(7.2),
      deviceId,
      transcript:
        'Hot Press 2 went down at shift start. Hydraulic cylinder seal blew — oil spraying onto the press frame, automatic safety shutdown triggered. Called emergency maintenance. Machine was down for 75 minutes. Maintenance replaced the seal and topped up the hydraulic fluid. Lost the first two production runs completely. This is the second seal failure on this press in six weeks.',
      structured: {
        tags: ['hydraulic', 'downtime', 'maintenance', 'pressing'],
        reason: 'hydraulic pressure drop',
        machine: 'Hot Press 2',
        component: 'hydraulic cylinder',
        actionTaken: 'called maintenance, replaced seal, refilled hydraulic fluid, restarted press',
        lesson: 'Hot Press 2 hydraulic cylinder seals are failing repeatedly — escalate for full hydraulic system inspection before next shift',
      },
      completenessScore: 100,
      isComplete: true,
    },

    // ── 2. UV Coating Line — UV lamp failure causing under-cured boards ────
    {
      id: 'seed-002',
      timestamp: hoursAgo(6.1),
      createdAt: hoursAgo(6.1),
      deviceId,
      transcript:
        'UV lamp failure on the coating line. Zone 2 lamp went dark mid-run — boards coming out with tacky coating surface, clearly under-cured. Stopped the line immediately and isolated the batch of about 180 boards. QC called to inspect. Maintenance replaced the UV lamp. Line restarted after 40 minutes. Under-cured batch flagged for rework or scrap depending on QC assessment.',
      structured: {
        tags: ['uv-cure', 'coating', 'quality', 'downtime'],
        reason: 'UV cure failure',
        machine: 'UV Coating Line',
        component: 'UV lamp',
        actionTaken: 'stopped line, isolated batch, called QC, replaced UV lamp, restarted line',
        lesson: 'check UV lamp hours against replacement schedule — Zone 2 lamp was overdue by approximately 200 hours',
      },
      completenessScore: 100,
      isComplete: true,
    },

    // ── 3. Wide Belt Sander — belt wear causing surface scratches, batch held
    {
      id: 'seed-003',
      timestamp: hoursAgo(5.0),
      createdAt: hoursAgo(5.0),
      deviceId,
      transcript:
        'Major quality event on the Wide Belt Sander. Sanding belt wearing unevenly — producing linear scratch marks across board surfaces on approximately 600 boards. QC caught it during routine check. Full batch quarantined for visual inspection. Root cause: sanding belt past end of service life and not changed at scheduled interval. Raised work order for immediate belt replacement. Production plan for remainder of shift needs to be revised.',
      structured: {
        tags: ['sanding', 'surface', 'quality', 'downtime'],
        reason: 'sanding belt wear',
        machine: 'Wide Belt Sander',
        component: 'sanding belt',
        actionTaken: 'stopped machine, quarantined batch, escalated to supervisor, raised work order for belt replacement',
        lesson: 'mandatory belt condition check required at every shift start — add to shift start checklist immediately',
      },
      completenessScore: 100,
      isComplete: true,
    },

    // ── 4. Moisture Conditioning Chamber — moisture deviation, boards warping
    {
      id: 'seed-004',
      timestamp: hoursAgo(3.5),
      createdAt: hoursAgo(3.5),
      deviceId,
      transcript:
        'Moisture Conditioning Chamber producing boards with moisture content creeping up — readings at 9.2% against spec max of 8.0%. Boards from the last two hours showing early signs of bow and warp. QC flagged it. Suspect the humidity controller is drifting — this chamber is overdue for a calibration check by about three weeks. Adjusted chamber setpoints to compensate for now but this is a temporary fix. Raised work order for calibration. Boards since 10am have been held pending QC review.',
      structured: {
        tags: ['moisture', 'warp', 'quality', 'maintenance'],
        reason: 'moisture deviation',
        machine: 'Moisture Conditioning Chamber',
        component: 'moisture sensor',
        actionTaken: 'adjusted chamber setpoints, raised work order, held batch for QC review',
        lesson: 'humidity controller calibration overdue by 3 weeks — schedule immediately, boards are already warping',
      },
      completenessScore: 100,
      isComplete: true,
    },

    // ── 5. Hot Press 1 — early press temperature warning ───────────────────
    // ⚠️  Same machine + reason as the demo script → triggers "related note" banner
    {
      id: 'seed-005',
      timestamp: hoursAgo(2.5),
      createdAt: hoursAgo(2.5),
      deviceId,
      transcript:
        'Upper platen on Hot Press 1 running about 8 degrees below setpoint. Not alarming yet but keeping a close eye. Adjusted the platen temperature setpoint slightly. Heating element might need inspection — output feels reduced when standing near the press. Third time this week the platen temperature has crept down on this press.',
      structured: {
        tags: ['pressing', 'overheating', 'maintenance', 'sensor'],
        reason: 'press temperature drift',
        machine: 'Hot Press 1',
        component: 'heating element',
        actionTaken: 'adjusted platen temperature setpoint',
        lesson: 'recurring temperature drift on Hot Press 1 — heating system needs proper inspection, not just setpoint adjustment',
      },
      completenessScore: 100,
      isComplete: true,
    },

    // ── 6. Tongue & Groove Line — fourth alignment fault this week ──────────
    {
      id: 'seed-006',
      timestamp: hoursAgo(1.8),
      createdAt: hoursAgo(1.8),
      deviceId,
      transcript:
        'Tongue and Groove Line alignment fault again. Fourth time this week. Line stopped for 18 minutes each time. Reset the alignment guide and did a manual measurement check — boards running within tolerance but the root cause has not been found. Maintenance says the guide rail is fine. I think it is a calibration drift issue in the PLC program. Escalated to engineering. This is costing us roughly 72 minutes of production per week.',
      structured: {
        tags: ['alignment', 'downtime', 'electrical', 'mechanical'],
        reason: 'alignment drift',
        machine: 'Tongue & Groove Line',
        component: 'PLC',
        actionTaken: 'reset alignment guide, escalated to engineering',
        lesson: 'fourth alignment fault this week — guide reset is not a fix. Engineering must investigate PLC calibration before next shift',
      },
      completenessScore: 100,
      isComplete: true,
    },

    // ── 7. Glue Spreader 1 — pressure drop affecting entire press floor ─────
    {
      id: 'seed-007',
      timestamp: hoursAgo(1.0),
      createdAt: hoursAgo(1.0),
      deviceId,
      transcript:
        'Glue Spreader 1 glue pressure dropped sharply — spread rate fell below minimum threshold, boards coming off the spreader with glue starvation on the edges. Both Cold Press 1 and 2 had to reduce cycle speed to compensate. Lost about 30% throughput for 35 minutes while maintenance diagnosed it. Turned out a glue feed solenoid valve had stuck partially closed. Maintenance cleared it manually and pressure restored. Valve needs replacing — it has been partially sticking intermittently for ten days.',
      structured: {
        tags: ['glue', 'hydraulic', 'pressing', 'downtime', 'delamination'],
        reason: 'glue starvation',
        machine: 'Glue Spreader 1',
        component: 'doctor blade',
        actionTaken: 'called maintenance, manually cleared valve, restored glue pressure',
        lesson: 'sticking solenoid valve on Glue Spreader 1 flagged ten days ago — it caused a floor-wide slowdown today. Replace immediately',
      },
      completenessScore: 100,
      isComplete: true,
    },

    // ── 8. Cross-Cut Saw — saw blade chatter, boards splintering ───────────
    {
      id: 'seed-008',
      timestamp: hoursAgo(0.4),
      createdAt: hoursAgo(0.4),
      deviceId,
      transcript:
        'Cross-Cut Saw blade chatter failure. Loud resonance noise then edge splintering visible on board ends. Maintenance confirmed the main saw blade has developed a hairline crack. Replacement blade not in stock — had to pull the spare from Rip Saw standby set which takes Rip Saw offline too. Both saws down. Expected back up in 50 minutes. Production supervisor is aware. Parts department notified to reorder blade stock.',
      structured: {
        tags: ['saw', 'mechanical', 'downtime', 'quality'],
        reason: 'saw blade chatter',
        machine: 'Cross-Cut Saw',
        component: 'saw blade',
        actionTaken: 'called maintenance, sourced spare blade from Rip Saw, restarted machine',
        lesson: 'spare blade stock critically low — single failure took down two saws. Reorder minimum 4 blades immediately',
      },
      completenessScore: 100,
      isComplete: true,
    },
  ]
}
